import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

export default function VerifyRegisterOtp() {
  const navigate = useNavigate();

  // ✅ GET EMAIL SAVED DURING REGISTER
  const email = localStorage.getItem("registerEmail");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp) {
      setError("OTP is required");
      return;
    }

    try {
      setLoading(true);

      console.log("📨 Verifying OTP:", { email, otp });

      // ✅ CORRECT BACKEND ROUTE
      const res = await API.post("/auth/verify-register-otp", {
        email: email.toLowerCase().trim(),
        otp: otp.trim(),
      });

      console.log("✅ Verify response:", res.data);

      // ✅ CLEAN UP
      localStorage.removeItem("registerEmail");

      alert("Email verified successfully 🎉");
      navigate("/login");
    } catch (err) {
      console.error("❌ Verify OTP error:", err);
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // ❌ NO EMAIL → BLOCK ACCESS
  if (!email) {
    return (
      <p className="text-center mt-10 text-red-500">
        Invalid access. Please register again.
      </p>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-card w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Verify Email</h2>

        {error && <div className="error-box mb-4">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <input
            type="text"
            className="neon-input"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <button className="neon-btn w-full" disabled={loading}>
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
