import React from "react";
import { Check, Pencil, Trash2 } from "lucide-react";

function TaskCard({ task, onComplete, onEdit, onDelete }) {
  return (
    <article className={task.isOverdue ? "task-row overdue-row" : "task-row"}>
      <div>
        <div className="task-title-line">
          <strong>{task.title}</strong>
          <span className={`pill ${task.priority.toLowerCase()}`}>{task.priority}</span>
          {task.isOverdue && <span className="pill danger">Overdue</span>}
        </div>
        <p>{task.notes || "No notes added."}</p>
        <small>
          {task.category} - {task.status} - due {new Date(task.dueDate).toLocaleDateString()} {task.dueTime}
        </small>
      </div>
      <div className="row-actions">
        {task.status !== "completed" && (
          <button className="icon-button" onClick={() => onComplete(task._id)} title="Mark complete" type="button">
            <Check size={17} />
          </button>
        )}
        <button className="icon-button" onClick={() => onEdit(task)} title="Edit task" type="button">
          <Pencil size={17} />
        </button>
        <button className="icon-button danger-button" onClick={() => onDelete(task._id)} title="Delete task" type="button">
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}

export default TaskCard;
