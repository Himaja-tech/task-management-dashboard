import React from "react";
import { useEffect, useMemo, useState } from "react";
import Layout from "../components/layout/Layout.jsx";
import TaskForm from "../components/tasks/TaskForm.jsx";
import TaskList from "../components/tasks/TaskList.jsx";
import { completeTask as completeTaskRequest, createTask, deleteTask as deleteTaskRequest, getTasks, updateTask } from "../services/taskService.js";
import { notifyNotificationCountChanged } from "../utils/notificationEvents.js";

const filterDefaults = {
  search: "",
  status: "all",
  priority: "all",
  category: "all",
  date: "",
  sort: "newest"
};

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filters, setFilters] = useState(filterDefaults);
  const [editingTask, setEditingTask] = useState(null);
  const [message, setMessage] = useState("");

  const query = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      }
    });
    return params.toString();
  }, [filters]);

  const loadTasks = async () => {
    const { data } = await getTasks(query);
    setTasks(data.tasks);
  };

  useEffect(() => {
    loadTasks().catch(() => setMessage("Unable to load tasks."));
  }, [query]);

  useEffect(() => {
    if (!message) {
      return undefined;
    }

    const timer = window.setTimeout(() => setMessage(""), 2200);
    return () => window.clearTimeout(timer);
  }, [message]);

  const updateFilter = (event) => {
    setFilters((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const saveTask = async (payload) => {
    if (editingTask) {
      await updateTask(editingTask._id, payload);
      setMessage("Task updated.");
      setEditingTask(null);
    } else {
      await createTask(payload);
      setMessage("Task added.");
    }

    await loadTasks();
    notifyNotificationCountChanged();
  };

  const completeTask = async (taskId) => {
    await completeTaskRequest(taskId);
    setMessage("Task completed.");
    await loadTasks();
    notifyNotificationCountChanged();
  };

  const deleteTask = async (taskId) => {
    await deleteTaskRequest(taskId);
    setMessage("Task deleted.");
    await loadTasks();
    notifyNotificationCountChanged();
  };

  return (
    <Layout title="Tasks" eyebrow="Task command center">
      <section className="panel task-form-panel">
        <TaskForm editingTask={editingTask} onCancel={() => setEditingTask(null)} onSubmit={saveTask} />
      </section>

      {message && (
        <div className="toast-message" role="status" aria-live="polite">
          {message}
        </div>
      )}

      <section className="panel">
        <div className="panel-header"> </div>
        <h1> Today's Tasks</h1>
        <TaskList
          tasks={tasks}
          onComplete={completeTask}
          onEdit={setEditingTask}
          onDelete={deleteTask}
          emptyTitle="No tasks due today"
          emptyText="Tasks scheduled for today will appear here as soon as you add them."
        />
      </section>
    </Layout>
  );
}

export default Tasks;
