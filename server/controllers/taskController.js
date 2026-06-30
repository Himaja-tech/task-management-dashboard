import { store } from "../utils/dataStore.js";
import { getReminderDate, isTaskOverdue } from "../utils/time.js";

const normalizeReminderMinutes = (value) => {
  if (value === "" || value === null || value === undefined) {
    return null;
  }

  const normalized = Number(value);
  if (Number.isNaN(normalized)) {
    throw new Error("Invalid reminderMinutesBefore: must be a number of minutes before the due time.");
  }

  return normalized;
};

const createOrUpdateReminder = async (task, userId) => {
  await store.deleteNotifications({ taskId: task._id, userId, pendingOnly: true });

  if (!task.reminderTime || task.status === "completed") {
    return;
  }

  await store.createNotification({
    userId,
    taskId: task._id,
    message: `Reminder: ${task.title} is due at ${task.dueTime}.`,
    type: "reminder",
    scheduledTime: task.reminderTime
  });
};

const enrichTask = (task) => ({
  ...task,
  isOverdue: isTaskOverdue(task)
});

export const getTasks = async (req, res, next) => {
  try {
    const tasks = await store.listTasks(req.user._id, req.query);
    res.json({ tasks: tasks.map(enrichTask) });
  } catch (error) {
    next(error);
  }
};

export const createTask = async (req, res, next) => {
  try {
    const { title, notes, priority, category, dueDate, dueTime, reminderMinutesBefore } = req.body;
    const normalizedReminderMinutes = normalizeReminderMinutes(reminderMinutesBefore);
    const reminderTime = getReminderDate(dueDate, dueTime, normalizedReminderMinutes);

    if (normalizedReminderMinutes !== null && !reminderTime) {
      throw new Error("Unable to compute reminder time. Check due date, due time, and reminder minutes.");
    }

    const task = await store.createTask({
      userId: req.user._id,
      title,
      notes,
      priority,
      category,
      dueDate,
      dueTime,
      reminderTime,
      reminderMinutesBefore: normalizedReminderMinutes
    });

    await createOrUpdateReminder(task, req.user._id);

    res.status(201).json({ task: enrichTask(task) });
  } catch (error) {
    next(error);
  }
};

export const getTask = async (req, res, next) => {
  try {
    const task = await store.findTask(req.user._id, req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    res.json({ task: enrichTask(task) });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const existingTask = await store.findTask(req.user._id, req.params.id);

    if (!existingTask) {
      return res.status(404).json({ message: "Task not found." });
    }

    const { title, notes, priority, category, status, dueDate, dueTime, reminderMinutesBefore } = req.body;
    const nextDueDate = dueDate || new Date(existingTask.dueDate).toISOString().slice(0, 10);
    const nextDueTime = dueTime || existingTask.dueTime;
    const nextStatus = status ?? existingTask.status;
    const normalizedReminderMinutes = normalizeReminderMinutes(reminderMinutesBefore);
    const reminderTime = getReminderDate(nextDueDate, nextDueTime, normalizedReminderMinutes);
    if (normalizedReminderMinutes !== null && !reminderTime) {
      throw new Error("Unable to compute reminder time. Check due date, due time, and reminder minutes.");
    }

    const updates = {
      title: title ?? existingTask.title,
      notes: notes ?? existingTask.notes,
      priority: priority ?? existingTask.priority,
      category: category ?? existingTask.category,
      dueDate: dueDate ?? existingTask.dueDate,
      dueTime: dueTime ?? existingTask.dueTime,
      status: nextStatus,
      completedAt: nextStatus === "completed" ? existingTask.completedAt || new Date() : null,
      reminderTime,
      reminderMinutesBefore: normalizedReminderMinutes
    };

    const task = await store.updateTask(req.user._id, req.params.id, updates);
    await createOrUpdateReminder(task, req.user._id);

    res.json({ task: enrichTask(task) });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await store.deleteTask(req.user._id, req.params.id);

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    await store.deleteNotifications({ taskId: task._id, userId: req.user._id });
    res.json({ message: "Task deleted." });
  } catch (error) {
    next(error);
  }
};

export const completeTask = async (req, res, next) => {
  try {
    const task = await store.updateTask(req.user._id, req.params.id, {
      status: "completed",
      completedAt: new Date()
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    await store.deleteNotifications({ taskId: task._id, userId: req.user._id, pendingOnly: true });

    res.json({ task: { ...task, isOverdue: false } });
  } catch (error) {
    next(error);
  }
};
