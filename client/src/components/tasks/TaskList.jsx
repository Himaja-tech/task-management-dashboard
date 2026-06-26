import React from "react";
import EmptyState from "../common/EmptyState.jsx";
import TaskCard from "./TaskCard.jsx";

function TaskList({ tasks, onComplete, onEdit, onDelete, emptyTitle = "No matching tasks", emptyText = "Try adjusting filters or add a fresh task." }) {
  if (tasks.length === 0) {
    return <EmptyState title={emptyTitle} text={emptyText} />;
  }

  return (
    <div className="task-table">
      {tasks.map((task) => (
        <TaskCard key={task._id} task={task} onComplete={onComplete} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default TaskList;
