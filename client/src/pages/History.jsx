import React from "react";
import { useEffect, useMemo, useState } from "react";
import EmptyState from "../components/common/EmptyState.jsx";
import StatCard from "../components/dashboard/StatCard.jsx";
import Layout from "../components/layout/Layout.jsx";
import { getHistory } from "../services/taskService.js";

function History() {
  const [filters, setFilters] = useState({ range: "today", from: "", to: "", status: "all", sort: "date" });
  const [history, setHistory] = useState({ analytics: {}, tasks: [] });

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    return params.toString();
  }, [filters]);

  useEffect(() => {
    getHistory(query).then(({ data }) => setHistory(data));
  }, [query]);

  const updateFilter = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  return (
    <Layout title="History" eyebrow="Date-range analytics">
      <section className="stats-grid">
        <StatCard label="In range" value={history.analytics.total || 0} />
        <StatCard label="Completed" value={history.analytics.completed || 0} tone="green" />
        <StatCard label="Pending" value={history.analytics.pending || 0} tone="amber" />
        <StatCard label="Overdue" value={history.analytics.overdue || 0} tone="red" />
      </section>

      <section className="panel">
        <div className="filters-grid">
          <div className="field">
            <label htmlFor="range">Range</label>
            <select id="range" name="range" value={filters.range} onChange={updateFilter}>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7days">Last 7 days</option>
              <option value="last30days">Last 30 days</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="from">From</label>
            <input id="from" name="from" type="date" value={filters.from} onChange={updateFilter} />
          </div>
          <div className="field">
            <label htmlFor="to">To</label>
            <input id="to" name="to" type="date" value={filters.to} onChange={updateFilter} />
          </div>
          <div className="field">
            <label htmlFor="statusHistory">Status</label>
            <select id="statusHistory" name="status" value={filters.status} onChange={updateFilter}>
              <option value="all">All</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="sortHistory">Sort</label>
            <select id="sortHistory" name="sort" value={filters.sort} onChange={updateFilter}>
              <option value="date">Date</option>
              <option value="priority">Priority</option>
              <option value="category">Category</option>
            </select>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Task history</h2>
        </div>
        {history.tasks.length === 0 ? (
          <EmptyState title="No history for this view" text="Completed and due tasks appear here by date range." />
        ) : (
          <div className="task-table">
            {history.tasks.map((task) => (
              <article key={task._id} className="task-row">
                <div>
                  <div className="task-title-line">
                    <strong>{task.title}</strong>
                    <span className={`pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
                    <span className="pill neutral">{task.category}</span>
                  </div>
                  <p>{task.notes || "No notes added."}</p>
                  <small>
                    Status: {task.status} · completed{" "}
                    {task.completedAt ? new Date(task.completedAt).toLocaleString() : "not yet"} · due{" "}
                    {new Date(task.dueDate).toLocaleDateString()} {task.dueTime}
                  </small>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}

export default History;
