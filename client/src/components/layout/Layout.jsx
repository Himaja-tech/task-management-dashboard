import React from "react";
import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

function Layout({ children, title, eyebrow, actions }) {
  return (
    <div className="app-shell">
      <Sidebar />
      <main className="main-panel">
        <Navbar title={title} eyebrow={eyebrow} actions={actions} />
        {children}
      </main>
    </div>
  );
}

export default Layout;
