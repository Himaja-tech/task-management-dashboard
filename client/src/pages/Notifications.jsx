import React from "react";
import { BellRing, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import EmptyState from "../components/common/EmptyState.jsx";
import Layout from "../components/layout/Layout.jsx";
import { getNotifications, markNotificationRead } from "../services/notificationService.js";
import { notifyNotificationCountChanged } from "../utils/notificationEvents.js";
import { isNotificationActive } from "../utils/notifications.js";

function Notifications() {
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    const { data } = await getNotifications();
    setNotifications(data.notifications);
  };

  useEffect(() => {
    loadNotifications();
    const interval = window.setInterval(loadNotifications, 5000);
    return () => window.clearInterval(interval);
  }, []);

  const markRead = async (id) => {
    await markNotificationRead(id);
    await loadNotifications();
    notifyNotificationCountChanged();
  };

  return (
    <Layout title="Notifications" eyebrow="Reminder inbox">
      <section className="panel">
        <div className="panel-header">
          <h2>In-app reminders</h2>
          <BellRing size={18} />
        </div>
        {notifications.length === 0 ? (
          <EmptyState title="No notifications yet" text="Reminder history is stored here after you schedule task alerts." />
        ) : (
          <div className="notification-list">
            {notifications.map((notification) => {
              const isActive = isNotificationActive(notification);
              const statusText = notification.sentAt ? `sent ${new Date(notification.sentAt).toLocaleString()}` : isActive ? "active now" : "upcoming";
              const className = ["notification", notification.isRead ? "read" : "", isActive ? "active" : "upcoming"].filter(Boolean).join(" ");

              return (
                <article key={notification._id} className={className}>
                  <div>
                    <strong>{notification.message}</strong>
                    <span>
                      Reminder {new Date(notification.scheduledTime).toLocaleString()} - {statusText}
                    </span>
                  </div>
                  {!notification.isRead && isActive && (
                    <button className="icon-button" onClick={() => markRead(notification._id)} title="Mark as read" type="button">
                      <CheckCheck size={17} />
                    </button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </Layout>
  );
}

export default Notifications;
