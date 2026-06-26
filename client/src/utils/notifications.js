export const isNotificationActive = (notification, now = new Date()) => {
  if (notification.sentAt) {
    return true;
  }

  return new Date(notification.scheduledTime) <= now;
};

export const isNotificationUnreadAndActive = (notification, now = new Date()) => {
  return !notification.isRead && isNotificationActive(notification, now);
};
