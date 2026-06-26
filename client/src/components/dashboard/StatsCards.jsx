import React from "react";
import StatCard from "./StatCard.jsx";

function StatsCards({ stats }) {
  return (
    <section className="stats-grid">
      <StatCard label="Total tasks" value={stats.total} detail="All active records" />
      <StatCard label="Completed" value={stats.completed} tone="green" detail={`${stats.progress}% progress`} />
      <StatCard label="Pending" value={stats.pending} tone="amber" detail={`${stats.today} due today`} />
      <StatCard label="Overdue" value={stats.overdue} tone="red" detail="Needs attention" />
    </section>
  );
}

export default StatsCards;
