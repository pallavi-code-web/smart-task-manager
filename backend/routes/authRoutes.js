import express from "express";
import {
  register,
  verifyRegisterOtp,
  login,
  forgotPassword,
  verifyOtp,
  resetPassword,
} from "../controllers/authController.js";

const router = express.Router();

// ======================
// TEST ROUTE
// ======================
router.get("/test", (req, res) => {
  res.json({ message: "AUTH ROUTES WORKING ✅" });
});

// ======================
// AUTH
// ======================
router.post("/register", register);
router.post("/verify-register-otp", verifyRegisterOtp);
router.post("/login", login);

// ======================
// FORGOT PASSWORD
// ======================
router.post("/forgot-password", forgotPassword);
router.post("/verify-otp", verifyOtp);
router.post("/reset-password", resetPassword);

export default router;
