import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

/* =========================
   HELPER: GENERATE OTP
========================= */
const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/* =========================
   REGISTER (SEND OTP EMAIL)
========================= */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

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
      text: `Your verification OTP is ${otp}. It expires in 10 minutes.`,
    });

    console.log("📩 REGISTER OTP SENT:", otp);

    res.status(201).json({
      message: "OTP sent to your email. Please verify.",
    });
  } catch (error) {
    console.error("❌ REGISTER ERROR:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* =========================
   VERIFY REGISTER OTP
========================= */
export const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (
      !user ||
      user.emailOtp !== String(otp) ||
      user.emailOtpExpire < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.emailOtp = null;
    user.emailOtpExpire = null;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    console.error("❌ VERIFY REGISTER OTP ERROR:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/* =========================
   LOGIN
========================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify email first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("❌ LOGIN ERROR:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

/* =========================
   FORGOT PASSWORD (SEND OTP)
========================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = generateOtp();
    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    await sendEmail({
      to: email,
      subject: "SmartTask Password Reset OTP",
      text: `Your password reset OTP is ${otp}. It expires in 10 minutes.`,
    });

    console.log("🔑 RESET OTP SENT:", otp);

    res.json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("❌ FORGOT PASSWORD ERROR:", error);
    res.status(500).json({ message: "OTP generation failed" });
  }
};

/* =========================
   VERIFY RESET OTP
========================= */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (
      !user ||
      user.resetOtp !== String(otp) ||
      user.resetOtpExpire < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("❌ VERIFY RESET OTP ERROR:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

/* =========================
   RESET PASSWORD
========================= */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });

    if (
      !user ||
      user.resetOtp !== String(otp) ||
      user.resetOtpExpire < Date.now()
    ) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpire = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("❌ RESET PASSWORD ERROR:", error);
    res.status(500).json({ message: "Password reset failed" });
  }
};
