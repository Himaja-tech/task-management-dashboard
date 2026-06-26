import React from "react";
import { Bell, CalendarDays, CheckCircle2, Edit3, Languages, ListTodo, LockKeyhole, LogOut, Mail, Moon, Save, Sun, Target, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useTheme } from "../context/ThemeContext.jsx";
import { getTasks } from "../services/taskService.js";

const formatDate = (date) => {
  if (!date) {
    return "Not available";
  }

  return new Date(date).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const buildUsername = (name = "user") => `@${name.toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18) || "user"}`;

function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [tasks, setTasks] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [dailyReminder, setDailyReminder] = useState(() => localStorage.getItem("profile_daily_reminder") !== "false");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    username: "",
    bio: "",
    language: "English"
  });

  useEffect(() => {
    getTasks().then(({ data }) => setTasks(data.tasks)).catch(() => setTasks([]));
  }, []);

  useEffect(() => {
    const name = user?.name || "";
    setEmailNotifications(user?.emailNotifications !== false);
    setForm({
      name,
      email: user?.email || "",
      username: user?.username || buildUsername(name),
      bio: user?.bio || "Planning calmer days, one focused task at a time.",
      language: user?.language || "English"
    });
  }, [user]);

  useEffect(() => {
    localStorage.setItem("profile_daily_reminder", String(dailyReminder));
  }, [dailyReminder]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => task.status === "completed").length;
    const pending = tasks.filter((task) => task.status === "pending").length;
    const completionRate = total ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, completionRate };
  }, [tasks]);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const cancelEdit = () => {
    const name = user?.name || "";
    setIsEditing(false);
    setMessage("");
    setForm({
      name,
      email: user?.email || "",
      username: user?.username || buildUsername(name),
      bio: user?.bio || "Planning calmer days, one focused task at a time.",
      language: user?.language || "English"
    });
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      await updateProfile(form);
      setIsEditing(false);
      setMessage("Profile updated.");
    } catch (error) {
      setMessage(error.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const toggleEmailNotifications = async () => {
    const nextValue = !emailNotifications;
    setEmailNotifications(nextValue);

    try {
      await updateProfile({ ...form, emailNotifications: nextValue });
    } catch (error) {
      setEmailNotifications(!nextValue);
      setMessage("Unable to update email notification preference.");
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <Layout title="Profile" eyebrow="WorkPulse account">
      <form className="personal-profile" onSubmit={saveProfile}>
        <section className="personal-profile-header">
          <div className="profile-photo">{form.name.slice(0, 1).toUpperCase() || "W"}</div>
          <div className="personal-profile-heading">
            {isEditing ? (
              <input className="profile-name-input" name="name" value={form.name} onChange={updateField} required />
            ) : (
              <h2>{form.name || "WorkPulse User"}</h2>
            )}
            {isEditing ? (
              <input className="profile-username-input" name="username" value={form.username} onChange={updateField} placeholder="@username" />
            ) : (
              <span>{form.username || buildUsername(form.name)}</span>
            )}
            {isEditing ? (
              <textarea className="profile-bio-input" name="bio" value={form.bio} onChange={updateField} maxLength={240} />
            ) : (
              <p>{form.bio}</p>
            )}
          </div>
          {!isEditing && (
            <button className="secondary-button profile-header-edit" type="button" onClick={() => setIsEditing(true)}>
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </section>

        {message && <p className={message.includes("Unable") ? "form-error" : "form-success"}>{message}</p>}

        <section className={isEditing ? "profile-section-card editing-card" : "profile-section-card"}>
          <div className="profile-section-header">
            <div>
              <h2>Personal Information</h2>
              <p>{isEditing ? "Update your profile details, then save your changes." : "Your basic WorkPulse profile details."}</p>
            </div>
            {isEditing ? (
              <div className="profile-edit-actions">
                <button className="secondary-button" type="button" onClick={cancelEdit}>
                  <X size={16} /> Cancel
                </button>
                <button className="primary-button" type="submit" disabled={saving}>
                  <Save size={16} /> {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            ) : (
              <button className="secondary-button" type="button" onClick={() => setIsEditing(true)}>
                <Edit3 size={16} /> Edit
              </button>
            )}
          </div>
          <div className="profile-info-grid">
            <ProfileInfo icon={UserRound} label="Name" name="name" value={form.name} editable={isEditing} onChange={updateField} />
            <ProfileInfo icon={Mail} label="Email" name="email" type="email" value={form.email} editable={isEditing} onChange={updateField} />
            <ProfileInfo icon={Languages} label="Preferred Language" name="language" value={form.language} editable={isEditing} onChange={updateField} />
          </div>
        </section>

        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <h2>Productivity Summary</h2>
              <p>A quick view of your task progress.</p>
            </div>
          </div>
          <div className="profile-stats-grid">
            <ProfileStat icon={ListTodo} label="Total Tasks" value={stats.total} />
            <ProfileStat icon={CheckCircle2} label="Completed Tasks" value={stats.completed} />
            <ProfileStat icon={CalendarDays} label="Pending Tasks" value={stats.pending} />
            <ProfileStat icon={Target} label="Completion Rate" value={`${stats.completionRate}%`} />
          </div>
        </section>

        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <h2>Preferences</h2>
              <p>Personal settings for your daily workflow.</p>
            </div>
          </div>
          <div className="preference-list">
            <PreferenceToggle icon={isDark ? Moon : Sun} label="Dark Mode" enabled={isDark} onChange={toggleTheme} />
            <PreferenceToggle icon={Bell} label="Daily Reminder" enabled={dailyReminder} onChange={() => setDailyReminder((value) => !value)} />
            <PreferenceToggle icon={Mail} label="Email Notifications" enabled={emailNotifications} onChange={toggleEmailNotifications} />
          </div>
        </section>

        <section className="profile-section-card">
          <div className="profile-section-header">
            <div>
              <h2>Account Actions</h2>
              <p>Manage your profile and access.</p>
            </div>
          </div>
          <div className="security-actions">
            <button className="secondary-button" type="button" onClick={() => setIsEditing(true)}>
              <Edit3 size={16} /> Edit Profile
            </button>
            <button className="secondary-button" type="button">
              <LockKeyhole size={16} /> Change Password
            </button>
            <button className="secondary-button danger-button" type="button" onClick={handleLogout}>
              <LogOut size={16} /> Logout
            </button>
          </div>
        </section>
      </form>
    </Layout>
  );
}

function ProfileInfo({ icon: Icon, label, name, value, type = "text", editable = false, onChange }) {
  return (
    <div className="profile-info-item">
      <span>
        <Icon size={16} /> {label}
      </span>
      {editable && name ? <input name={name} type={type} value={value} onChange={onChange} required={name === "name" || name === "email"} /> : <strong>{value}</strong>}
    </div>
  );
}

function ProfileStat({ icon: Icon, label, value }) {
  return (
    <article className="profile-stat-card">
      <span>
        <Icon size={18} />
      </span>
      <div>
        <strong>{value}</strong>
        <p>{label}</p>
      </div>
    </article>
  );
}

function PreferenceToggle({ icon: Icon, label, enabled, onChange }) {
  return (
    <div className="preference-row">
      <span>
        <Icon size={17} /> {label}
      </span>
      <button className={enabled ? "toggle-switch enabled" : "toggle-switch"} type="button" onClick={onChange} aria-pressed={enabled}>
        <span />
      </button>
    </div>
  );
}

export default Profile;
