import React from "react";
import { Bell } from "lucide-react";
import { Link } from "react-router-dom";
import { useUnreadNotificationCount } from "../../hooks/useUnreadNotificationCount.js";

function NotificationBadge() {
  const unreadCount = useUnreadNotificationCount();

  return (
    <Link className="notification-bell" to="/notifications" aria-label={`${unreadCount} unread notifications`}>
      <Bell size={22} fill="currentColor" />
      {unreadCount > 0 && <span className="notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
    </Link>
  );
}

export default NotificationBadge;
