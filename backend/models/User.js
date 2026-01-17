import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: String,

    email: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: String,

    isVerified: {
      type: Boolean,
      default: false,
    },

    // 🔥 Email verification OTP
    emailOtp: {
      type: String,
    },

    emailOtpExpire: {
      type: Date,
    },

    // 🔥 Reset password OTP
    resetOtp: {
      type: String,
    },

    resetOtpExpire: {
      type: Date,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
