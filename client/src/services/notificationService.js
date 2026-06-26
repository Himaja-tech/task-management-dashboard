import api from "./api.js";

export const getNotifications = () => api.get("/notifications");

export const markNotificationRead = (notificationId) => api.patch(`/notifications/${notificationId}/read`);

export const scheduleNotification = (payload) => api.post("/notifications/schedule", payload);
