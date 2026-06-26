import { store } from "./dataStore.js";
import { sendReminderEmail } from "./email.js";

export const deliverReminderEmails = async (notifications) => {
  if (process.env.EMAIL_REMINDERS_ENABLED !== "true" || notifications.length === 0) {
    return;
  }

  await Promise.allSettled(
    notifications.map(async (notification) => {
      const user = await store.findUserById(notification.userId);

      if (!user?.email || user.emailNotifications === false) {
        return false;
      }

      return sendReminderEmail({
        to: user.email,
        subject: "WorkPulse task reminder",
        text: notification.message
      });
    })
  );
};

export const processDueNotifications = async (now = new Date()) => {
  const dueNotifications = await store.markAllDueNotificationsSent(now);
  await deliverReminderEmails(dueNotifications);
  return dueNotifications;
};
