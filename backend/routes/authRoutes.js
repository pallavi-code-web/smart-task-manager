import express from "express";
import {
  register,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
  verifyRegisterOtp, // ✅ ADD THIS
} from "../controllers/authController.js";

console.log("✅ AUTH ROUTES LOADED");

const router = express.Router();

// ✅ TEST ROUTE
router.get("/test", (req, res) => {
  res.json({ message: "AUTH ROUTES WORKING ✅" });
});

// 🔐 AUTH ROUTES
router.post("/register", register);
router.post("/verify-register-otp", verifyRegisterOtp); // ✅ NEW ROUTE

router.post("/login", login);

// 🔐 FORGOT PASSWORD FLOW
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
