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

    // 🔐 EMAIL VERIFICATION
    isVerified: {
      type: Boolean,
      default: false,
    },
    emailOtp: String,
    emailOtpExpire: Date,

    // 🔐 FORGOT PASSWORD
    resetOtp: String,
    resetOtpExpire: Date,
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
