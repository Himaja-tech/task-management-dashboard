import React from "react";
import { Bell, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../components/common/EmptyState.jsx";
import StatsCards from "../components/dashboard/StatsCards.jsx";
import WelcomeCard from "../components/dashboard/WelcomeCard.jsx";
import Layout from "../components/layout/Layout.jsx";
import api from "../services/api.js";

const todayKey = new Date().toISOString().slice(0, 10);

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      const [taskResponse, notificationResponse] = await Promise.all([api.get("/tasks"), api.get("/notifications")]);
      setTasks(taskResponse.data.tasks);
      setNotifications(notificationResponse.data.notifications);
      setLoading(false);
    };

    loadDashboard().catch(() => setLoading(false));
  }, []);

  const stats = useMemo(() => {
    const completed = tasks.filter((task) => task.status === "completed").length;
    const pending = tasks.filter((task) => task.status === "pending").length;
    const overdue = tasks.filter((task) => task.isOverdue).length;
    const today = tasks.filter((task) => task.dueDate?.slice(0, 10) === todayKey).length;
    const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
    const focusScore = Math.max(0, progress - overdue * 5);

    return { total: tasks.length, completed, pending, overdue, today, progress, focusScore };
  }, [tasks]);

  const upcomingReminders = notifications
    .filter((notification) => !notification.sentAt)
    .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
    .slice(0, 4);

  const recentActivity = tasks
    .slice()
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 5);

  return (
    <Layout
      title="Dashboard"
      eyebrow="Personal productivity"
      actions={
        <Link className="primary-button compact" to="/tasks">
          <Plus size={16} /> New task
        </Link>
      }
    >
      <StatsCards stats={stats} />
      <WelcomeCard focusScore={stats.focusScore} progress={stats.progress} />

      <div className="content-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Upcoming reminders</h2>
            <Bell size={18} />
          </div>
          {upcomingReminders.length === 0 ? (
            <EmptyState title="No upcoming reminders" text="Tasks with reminder times will appear here automatically." />
          ) : (
            <div className="activity-list">
              {upcomingReminders.map((notification) => (
                <article key={notification._id}>
                  <strong>{notification.message}</strong>
                  <span>{new Date(notification.scheduledTime).toLocaleString()}</span>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Recent activity</h2>
          </div>
          {loading ? (
            <EmptyState title="Loading activity" text="Fetching your task pulse." />
          ) : recentActivity.length === 0 ? (
            <EmptyState title="No activity yet" text="Create your first task to start building history." />
          ) : (
            <div className="activity-list">
              {recentActivity.map((task) => (
                <article key={task._id}>
                  <strong>{task.title}</strong>
                  <span>
                    {task.status} · {task.priority} · due {new Date(task.dueDate).toLocaleDateString()} {task.dueTime}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </Layout>
  );
}

export default Dashboard;
