import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Email is required");
      return;
    }

    try {
      setLoading(true);

      const normalizedEmail = email.trim().toLowerCase();
      console.log("📨 Sending forgot-password:", normalizedEmail);

      const res = await API.post("/auth/forgot-password", {
        email: normalizedEmail,
      });

      console.log("✅ Backend response:", res.data);

      // ✅ BACKEND DOES NOT SEND success FLAG
      setMessage(res.data.message || "OTP sent to your email 📧");

      // ✅ ALWAYS navigate on 200 OK
      navigate("/verify-reset-otp", {
        state: { email: normalizedEmail },
      });
    } catch (err) {
      console.error("❌ Forgot password error:", err);
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-card w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4">Forgot Password</h2>

        {message && <div className="success-box mb-4">{message}</div>}
        {error && <div className="error-box mb-4">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            className="neon-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit" className="neon-btn w-full" disabled={loading}>
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      </div>
    </div>
  );
}
