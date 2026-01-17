import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendEmail from "../utils/sendEmail.js";

/* ================= REGISTER ================= */
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser && existingUser.isVerified)
      return res.status(409).json({ message: "User already exists" });

    if (existingUser && !existingUser.isVerified)
      await User.deleteOne({ email: normalizedEmail });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      name,
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      emailOtp: otp,
      emailOtpExpire: Date.now() + 10 * 60 * 1000,
    });

    const html = `
      <div style="font-family:Arial;padding:20px">
        <h2>SmartTask Email Verification</h2>
        <p>Your OTP code is:</p>
        <h1 style="color:#4CAF50;letter-spacing:6px">${otp}</h1>
        <p>This OTP is valid for 10 minutes.</p>
      </div>
    `;

    // ✅ SAFE EMAIL (NO CRASH)
    sendEmail({
      to: normalizedEmail,
      subject: "Verify your SmartTask account",
      html,
    }).catch(err =>
      console.log("⚠ Mail failed but user created:", err.message)
    );

    res.status(201).json({
      message: "OTP generated successfully",
      email: user.email,
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= VERIFY REGISTER OTP ================= */
export const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp)
      return res.status(400).json({ message: "Email and OTP required" });

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user)
      return res.status(404).json({ message: "User not found" });

    if (!user.emailOtp)
      return res.status(400).json({ message: "OTP already used or missing" });

    if (user.emailOtp !== cleanOtp)
      return res.status(400).json({ message: "Invalid OTP" });

    if (user.emailOtpExpire < Date.now())
      return res.status(400).json({ message: "OTP expired" });

    user.isVerified = true;
    user.emailOtp = null;
    user.emailOtpExpire = null;
    await user.save();

    res.json({ message: "Email verified successfully 🎉" });
  } catch (error) {
    console.log("VERIFY ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= LOGIN ================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.isVerified)
      return res.status(403).json({ message: "Please verify your email" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= FORGOT PASSWORD ================= */
export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    sendEmail({
      to: email,
      subject: "SmartTask Password Reset OTP",
      html: `<h1>${otp}</h1><p>Valid for 10 minutes</p>`,
    }).catch(err =>
      console.log("⚠ Reset mail failed:", err.message)
    );

    res.json({ message: "OTP sent to email" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= RESET PASSWORD ================= */
export const resetPassword = async (req, res) => {
  try {
    const email = req.body.email.trim().toLowerCase();
    const { otp, newPassword } = req.body;

    const cleanOtp = otp.toString().trim();
    const user = await User.findOne({ email });

    if (!user || user.resetOtp !== cleanOtp || user.resetOtpExpire < Date.now())
      return res.status(400).json({ message: "Invalid or expired OTP" });

    user.password = await bcrypt.hash(newPassword, 10);
    user.resetOtp = null;
    user.resetOtpExpire = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
