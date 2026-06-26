import { store } from "../utils/dataStore.js";
import { deliverReminderEmails } from "../utils/deliverNotifications.js";
import { getReminderDate } from "../utils/time.js";

export const getNotifications = async (req, res, next) => {
  try {
    const dueNotifications = await store.markDueNotificationsSent(req.user._id, new Date());
    await deliverReminderEmails(dueNotifications);

    const notifications = await store.listNotifications(req.user._id);
    res.json({ notifications });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await store.markNotificationRead(req.user._id, req.params.id);

    if (!notification) {
      return res.status(404).json({ message: "Notification not found." });
    }

    res.json({ notification });
  } catch (error) {
    next(error);
  }
};

export const scheduleNotification = async (req, res, next) => {
  try {
    const { taskId, reminderMinutesBefore } = req.body;
    const task = await store.findTask(req.user._id, taskId);

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    const dueDate = new Date(task.dueDate).toISOString().slice(0, 10);
    const reminderTime = getReminderDate(dueDate, task.dueTime, reminderMinutesBefore);
    const normalizedReminderMinutes = reminderMinutesBefore === "" || reminderMinutesBefore === null || reminderMinutesBefore === undefined ? null : Number(reminderMinutesBefore);

    await store.updateTask(req.user._id, task._id, { reminderTime, reminderMinutesBefore: normalizedReminderMinutes });
    await store.deleteNotifications({ userId: req.user._id, taskId: task._id, pendingOnly: true });

    if (!reminderTime) {
      return res.json({ notification: null });
    }

    const notification = await store.createNotification({
      userId: req.user._id,
      taskId: task._id,
      message: `Reminder: ${task.title} is due at ${task.dueTime}.`,
      type: "reminder",
      scheduledTime: reminderTime
    });

    res.status(201).json({ notification });
  } catch (error) {
    next(error);
  }
};
