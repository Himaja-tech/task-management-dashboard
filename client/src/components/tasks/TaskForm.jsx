import React from "react";
import { Bell, Calendar, FileText, Flag, Plus, Tag, X } from "lucide-react";
import { useEffect, useState } from "react";

const categories = ["Development", "Meeting", "Documentation", "Testing", "Research", "Client Work", "Others"];
const priorities = ["High", "Medium", "Low"];

const initialForm = {
  title: "",
  notes: "",
  priority: "Medium",
  category: "Development",
  dueDate: "",
  dueTime: "",
  reminderMinutesBefore: "5"
};

function TaskForm({ editingTask, onCancel, onSubmit }) {
  const [form, setForm] = useState(initialForm);

  const dateTimeValue = form.dueDate && form.dueTime ? `${form.dueDate}T${form.dueTime}` : "";

  useEffect(() => {
    if (!editingTask) {
      setForm(initialForm);
      return;
    }

    setForm({
      title: editingTask.title,
      notes: editingTask.notes || "",
      priority: editingTask.priority,
      category: editingTask.category,
      dueDate: editingTask.dueDate?.slice(0, 10),
      dueTime: editingTask.dueTime,
      reminderMinutesBefore: editingTask.reminderMinutesBefore !== null && editingTask.reminderMinutesBefore !== undefined ? String(editingTask.reminderMinutesBefore) : ""
    });
  }, [editingTask]);

  const updateField = (event) => {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  };

  const updateDateTime = (event) => {
    if (!event.target.value) {
      setForm((current) => ({ ...current, dueDate: "", dueTime: "" }));
      return;
    }

    const [dueDate, dueTime] = event.target.value.split("T");
    setForm((current) => ({ ...current, dueDate, dueTime }));
  };

  const cancelForm = () => {
    setForm(initialForm);
    onCancel();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit(form);
    setForm(initialForm);
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="task-form-header">
        <div>
          <p className="task-form-eyebrow">{editingTask ? "Edit task" : "New task"}</p>
          <h2>{editingTask ? "Update your queue" : "Add to your queue"}</h2>
        </div>
        <button className="task-form-close" type="button" onClick={cancelForm} aria-label="Cancel task entry">
          <X size={20} />
        </button>
      </div>

      <div className="field full-line">
        <label htmlFor="title">Task title</label>
        <input id="title" name="title" value={form.title} onChange={updateField} required placeholder="What needs doing?" />
      </div>
      <div className="field">
        <label htmlFor="priority">
          <Flag size={14} /> Priority
        </label>
        <select id="priority" name="priority" value={form.priority} onChange={updateField}>
          {priorities.map((priority) => (
            <option key={priority}>{priority}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="category">
          <Tag size={14} /> Category
        </label>
        <select id="category" name="category" value={form.category} onChange={updateField}>
          {categories.map((category) => (
            <option key={category}>{category}</option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="dueDateTime">
          <Calendar size={14} /> Due date & time
        </label>
        <input id="dueDateTime" name="dueDateTime" type="datetime-local" value={dateTimeValue} onChange={updateDateTime} required />
      </div>
      <div className="field compact-field">
        <label htmlFor="reminderMinutesBefore">
          <Bell size={14} /> Reminder
        </label>
        <select id="reminderMinutesBefore" name="reminderMinutesBefore" value={form.reminderMinutesBefore} onChange={updateField}>
          <option value="">No reminder</option>
          <option value="5">5 min before</option>
          <option value="15">15 min before</option>
          <option value="30">30 min before</option>
          <option value="60">1 hour before</option>
        </select>
      </div>
      <div className="field full-line">
        <label htmlFor="notes">
          <FileText size={14} /> Notes
        </label>
        <textarea id="notes" name="notes" value={form.notes} onChange={updateField} placeholder="Acceptance criteria, links, references..." />
      </div>
      <div className="form-actions">
        <button className="secondary-button" type="button" onClick={cancelForm}>
          Cancel
        </button>
        <button className="primary-button" type="submit">
          {!editingTask && <Plus size={18} />}
          {editingTask ? "Save task" : "Add Task"}
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
