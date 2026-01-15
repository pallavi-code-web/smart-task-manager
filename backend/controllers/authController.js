import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* =========================
   REGISTER (GENERATE OTP)
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = "123456"; // 🔐 FIXED OTP FOR PROJECT

    await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
      emailOtp: otp,
      emailOtpExpire: Date.now() + 10 * 60 * 1000,
    });

    console.log("REGISTER OTP:", otp);

    res.status(201).json({
      message: "OTP generated successfully (check backend logs)",
      email,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   VERIFY REGISTER OTP
========================= */
export const verifyRegisterOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });

    if (!user || user.emailOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.isVerified = true;
    user.emailOtp = null;
    user.emailOtpExpire = null;
    await user.save();

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
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
      return res
        .status(403)
        .json({ message: "Please verify your email before login" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   FORGOT PASSWORD (GENERATE OTP)
========================= */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = "123456"; // 🔐 FIXED OTP

    user.resetOtp = otp;
    user.resetOtpExpire = Date.now() + 10 * 60 * 1000;
    await user.save();

    console.log("RESET PASSWORD OTP:", otp);

    res.json({ message: "OTP generated successfully (check backend logs)" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   VERIFY FORGOT PASSWORD OTP
========================= */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    res.json({ message: "OTP verified successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   RESET PASSWORD
========================= */
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user || user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpire = null;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
