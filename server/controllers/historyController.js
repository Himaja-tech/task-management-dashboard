import { store } from "../utils/dataStore.js";
import { getRangeBounds, isTaskOverdue } from "../utils/time.js";

const sortHistory = (tasks, sort) => {
  const sorted = [...tasks];

  if (sort === "priority") {
    const rank = { High: 1, Medium: 2, Low: 3 };
    return sorted.sort((a, b) => rank[a.priority] - rank[b.priority] || new Date(b.dueDate) - new Date(a.dueDate));
  }

  if (sort === "category") {
    return sorted.sort((a, b) => a.category.localeCompare(b.category) || new Date(b.dueDate) - new Date(a.dueDate));
  }

  return sorted.sort((a, b) => new Date(b.completedAt || b.dueDate) - new Date(a.completedAt || a.dueDate));
};

export const getHistory = async (req, res, next) => {
  try {
    const { range = "today", from, to, status = "all", sort = "date" } = req.query;
    const { start, end } = getRangeBounds(range, from, to);
    const tasks = await store.listTasks(req.user._id, {});
    const history = sortHistory(
      tasks
        .map((task) => ({ ...task, isOverdue: isTaskOverdue(task) }))
        .filter((task) => {
          const completedAt = task.completedAt ? new Date(task.completedAt) : null;
          const dueDate = new Date(task.dueDate);
          return (completedAt && completedAt >= start && completedAt <= end) || (dueDate >= start && dueDate <= end);
        })
        .filter((task) => status === "all" || (status === "overdue" ? task.isOverdue : task.status === status)),
      sort
    );

    const analytics = {
      total: history.length,
      completed: history.filter((task) => task.status === "completed").length,
      pending: history.filter((task) => task.status === "pending").length,
      overdue: history.filter((task) => task.isOverdue).length,
      highPriority: history.filter((task) => task.priority === "High").length
    };

    res.json({ range: { start, end }, analytics, tasks: history });
  } catch (error) {
    next(error);
  }
};
