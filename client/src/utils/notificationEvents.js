export const notificationCountChangedEvent = "notification-count-changed";

export const notifyNotificationCountChanged = () => {
  window.dispatchEvent(new Event(notificationCountChangedEvent));
};
