import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../utils/api";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp || !newPassword) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await API.post("/auth/reset-password", {
        email,
        otp,
        newPassword,
      });

      alert("Password reset successful 🎉");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ If user directly opens page without email
  if (!email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-500">Invalid access. Please retry forgot password.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-card w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Reset Password</h2>

        {error && <div className="error-box mb-4">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <input
            className="neon-input"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <input
            type="password"
            className="neon-input"
            placeholder="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />

          <button className="neon-btn w-full" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
