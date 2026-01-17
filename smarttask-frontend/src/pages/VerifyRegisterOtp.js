import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api";

export default function VerifyRegisterOtp() {
  const navigate = useNavigate();
  const email = localStorage.getItem("registerEmail");

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      await API.post("/auth/verify-register-otp", {
        email,
        otp: otp.trim(),
      });

      localStorage.removeItem("registerEmail");

      alert("Email verified successfully 🎉");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  if (!email) return <p className="text-center mt-10">Register again</p>;

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={submit} className="glass-card space-y-4">
        <h2 className="text-xl font-semibold">Verify OTP</h2>

        <input
          className="neon-input"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          required
        />

        <button className="neon-btn w-full" disabled={loading}>
          {loading ? "Verifying..." : "Verify OTP"}
        </button>

        {error && <p className="error-box">{error}</p>}
      </form>
    </div>
  );
}
