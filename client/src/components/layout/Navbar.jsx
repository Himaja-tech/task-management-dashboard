import React from "react";
import { useAuth } from "../../context/AuthContext.jsx";
import NotificationBadge from "./NotificationBadge.jsx";

function Navbar({ title, eyebrow, actions }) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        {actions}
        <NotificationBadge />
        <div className="user-chip">
          <span>{user?.name?.slice(0, 1).toUpperCase()}</span>
          <div>
            <strong>{user?.name}</strong>
            <small>{user?.role}</small>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
