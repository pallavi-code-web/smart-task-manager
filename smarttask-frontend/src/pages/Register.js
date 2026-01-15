import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../utils/api";

export default function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      await API.post("/auth/register", {
        name,
        email: email.trim().toLowerCase(),
        password,
      });

      // ✅ SAVE EMAIL FOR OTP PAGE (VERY IMPORTANT)
      localStorage.setItem(
        "registerEmail",
        email.trim().toLowerCase()
      );

      // ✅ GO TO OTP PAGE
      navigate("/verify-register-otp");

    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="glass-card w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-2">
          Create your SmartTask ✨
        </h2>

        {error && <div className="error-box mb-4">{error}</div>}

        <form onSubmit={submit} className="space-y-4">
          <input
            className="neon-input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            className="neon-input"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            className="neon-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="neon-btn w-full" disabled={loading}>
            {loading ? "Sending OTP..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-muted text-center">
          Already have an account?{" "}
          <Link to="/login" className="link-accent">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
