import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    /* ===== REGISTER OTP ===== */
    otp: {
      type: String,
    },
    otpExpires: {
      type: Date,
    },

    /* ===== RESET PASSWORD OTP ===== */
    resetOtp: {
      type: String,
    },
    resetOtpExpire: {
      type: Date,
    },

    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
