import React from "react";
import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { Activity } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login } = useAuth();
  const [form, setForm] = useState({ email: location.state?.email || "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(form);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reach the backend server. Start the API server, then try logging in again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div className="auth-brand">
          <div className="brand-icon">
            <Activity size={24} />
          </div>
          <span>Task Manager and Productivity Dashboard</span>
        </div>
        <p className="eyebrow">Welcome back</p>
        <h1>Sign in to track your progress.</h1>
        <p className="auth-copy">Plan tasks, catch reminders, and understand where your workday is gaining momentum.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={updateField} required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={updateField} required autoComplete="current-password" />
          </div>
          {location.state?.message && <p className="form-success">{location.state.message}</p>}
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button full-width" type="submit" disabled={loading}>
            {loading ? "Working..." : "Login"}
          </button>
        </form>
        <p className="auth-switch">
          New user? <Link to="/register">Register</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;
