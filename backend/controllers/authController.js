import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

/* =========================
   HELPER: GENERATE OTP
========================= */
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/* =========================
   REGISTER (SEND OTP)
========================= */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const existing = await User.findOne({ email });
    if (existing)
      return res.status(409).json({ message: "User already exists" });

    const otp = generateOtp();
    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      emailOtp: otp,
      emailOtpExpire: Date.now() + 10 * 60 * 1000,
    });

    await sendEmail({
      to: email,
      subject: "Verify your SmartTask account",
      text: `Your verification OTP is ${otp}. Valid for 10 minutes.`,
    });

    res.status(201).json({ message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ message: "Email sending failed" });
  }
};

/* =========================
   VERIFY REGISTER OTP
========================= */
export const verifyRegisterOtp = async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (
    !user ||
    user.emailOtp !== otp ||
    user.emailOtpExpire < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.isVerified = true;
  user.emailOtp = null;
  user.emailOtpExpire = null;
  await user.save();

  res.json({ message: "Email verified successfully" });
};

/* =========================
   LOGIN
========================= */
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  if (!user.isVerified)
    return res.status(403).json({ message: "Verify email first" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: "Invalid credentials" });

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
};

/* =========================
   FORGOT PASSWORD (SEND OTP)
========================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user)
      return res.status(404).json({ message: "User not found" });

    const otp = generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: email,
      subject: "Reset your SmartTask password",
      text: `Your password reset OTP is ${otp}. Valid for 10 minutes.`,
    });

    res.json({ message: "OTP sent to email" });
  } catch {
    res.status(500).json({ message: "Email sending failed" });
  }
};

/* =========================
   VERIFY RESET OTP
========================= */
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  const user = await User.findOne({ email });

  if (
    !user ||
    user.resetOtp !== otp ||
    user.resetOtpExpire < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  res.json({ message: "OTP verified" });
};

/* =========================
   RESET PASSWORD
========================= */
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const user = await User.findOne({ email });

  if (
    !user ||
    user.resetOtp !== otp ||
    user.resetOtpExpire < Date.now()
  ) {
    return res.status(400).json({ message: "Invalid or expired OTP" });
  }

  user.password = await bcrypt.hash(newPassword, 10);
  user.resetOtp = null;
  user.resetOtpExpire = null;
  await user.save();

  res.json({ message: "Password reset successful" });
};
