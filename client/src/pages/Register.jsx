import React from "react";
import { Activity } from "lucide-react";
import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

function Register() {
  const navigate = useNavigate();
  const { isAuthenticated, register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
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
      await register(form);
      navigate("/login", {
        replace: true,
        state: {
          email: form.email,
          message: "Account created. Please login to continue."
        }
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to reach the backend server. Start the API server, then try registering again."
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
        <p className="eyebrow">Create your workspace</p>
        <h1>Start tracking focused work.</h1>
        <p className="auth-copy">Create an employee workspace for tasks, reminders, history, and productivity insights.</p>
        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Name</label>
            <input id="name" name="name" value={form.name} onChange={updateField} required autoComplete="name" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" value={form.email} onChange={updateField} required autoComplete="email" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" value={form.password} onChange={updateField} required minLength={8} autoComplete="new-password" />
          </div>
          {error && <p className="form-error">{error}</p>}
          <button className="primary-button full-width" type="submit" disabled={loading}>
            {loading ? "Working..." : "Create account"}
          </button>
        </form>
        <p className="auth-switch">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;
