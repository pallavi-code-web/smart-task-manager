import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../utils/api";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await API.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });

      // ✅ MUST: store token
      localStorage.setItem("token", res.data.token);

      // ✅ Optional but good
      localStorage.setItem("user", JSON.stringify(res.data.user));

      // ✅ Go to dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2">
      {/* LEFT BRAND SECTION */}
      <div className="hidden md:flex flex-col justify-center px-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-fuchsia-600 text-white">
        <h1 className="text-5xl font-bold mb-6">SmartTask ✨</h1>
        <p className="text-xl leading-relaxed opacity-90">
          Focus better.
          <br />
          Achieve more.
          <br />
          One task at a time.
        </p>
      </div>

      {/* RIGHT LOGIN CARD */}
      <div className="flex items-center justify-center px-6">
        <div className="glass-card w-full max-w-md">
          <h2 className="text-2xl font-semibold mb-2">Welcome back</h2>
          <p className="text-sm text-muted mb-6">
            Login to continue your journey
          </p>

          {error && <div className="error-box mb-4">{error}</div>}

          <form onSubmit={submit} className="space-y-4">
            <input
              type="email"
              className="neon-input"
              placeholder="Email address"
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

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-indigo-500 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="neon-btn w-full"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login →"}
            </button>
          </form>

          {/* Register */}
          <p className="mt-6 text-sm text-muted text-center">
            New here?{" "}
            <Link to="/register" className="link-accent">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
