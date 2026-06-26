import React from "react";
import { Bell, CheckSquare, History, LayoutDashboard, LogOut, Moon, Sun, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext.jsx";
import { useUnreadNotificationCount } from "../../hooks/useUnreadNotificationCount.js";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tasks", label: "Tasks", icon: CheckSquare },
  { to: "/history", label: "History", icon: History },
  { to: "/notifications", label: "Notifications", icon: Bell },
  { to: "/profile", label: "Profile", icon: User }
];

function Sidebar() {
  const { isDark, toggleTheme } = useTheme();
  const unreadCount = useUnreadNotificationCount();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">TM</div>
        <div>
          <strong>Task Manager and Productivity Dashboard</strong>
          <span>Productivity OS</span>
        </div>
      </div>
      <nav className="nav-list" aria-label="Primary navigation">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => (isActive ? "active" : "")}>
              <Icon size={18} />
              <span>{item.label}</span>
              {item.to === "/notifications" && unreadCount > 0 && <span className="nav-notification-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>}
            </NavLink>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <button className="icon-text-button" onClick={toggleTheme} type="button">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          <span>{isDark ? "Light mode" : "Dark mode"}</span>
        </button>
        <NavLink to="/logout" className="logout-link">
          <LogOut size={18} />
          <span>Logout</span>
        </NavLink>
      </div>
    </aside>
  );
}

export default Sidebar;
