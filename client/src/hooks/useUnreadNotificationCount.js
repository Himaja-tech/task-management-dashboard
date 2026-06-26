import { useEffect, useState } from "react";
import { getNotifications } from "../services/notificationService.js";
import { notificationCountChangedEvent } from "../utils/notificationEvents.js";
import { isNotificationUnreadAndActive } from "../utils/notifications.js";

export const useUnreadNotificationCount = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  const loadUnreadCount = async () => {
    try {
      const { data } = await getNotifications();
      const now = new Date();
      setUnreadCount(data.notifications.filter((notification) => isNotificationUnreadAndActive(notification, now)).length);
    } catch (error) {
      setUnreadCount(0);
    }
  };

  useEffect(() => {
    loadUnreadCount();
    window.addEventListener(notificationCountChangedEvent, loadUnreadCount);
    window.addEventListener("focus", loadUnreadCount);
    const interval = window.setInterval(loadUnreadCount, 5000);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener(notificationCountChangedEvent, loadUnreadCount);
      window.removeEventListener("focus", loadUnreadCount);
    };
  }, []);

  return unreadCount;
};
