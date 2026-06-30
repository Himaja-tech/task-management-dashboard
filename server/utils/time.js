const ISO_DATETIME_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

export const isValidIsoDatetimeString = (value) => {
  if (typeof value !== "string") {
    return false;
  }

  if (!ISO_DATETIME_REGEX.test(value)) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
};

export const normalizeIsoDatetimeString = (value) => {
  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) {
      throw new Error("Invalid Date object provided for scheduledTime.");
    }
    return value.toISOString();
  }

  if (typeof value === "string") {
    if (!isValidIsoDatetimeString(value)) {
      throw new Error("scheduledTime must be a valid ISO 8601 datetime string like YYYY-MM-DDTHH:mm:ssZ.");
    }
    return new Date(value).toISOString();
  }

  throw new Error("scheduledTime must be an ISO 8601 datetime string.");
};

export const combineDueDateTime = (dueDate, dueTime) => {
  if (!dueDate || !dueTime) {
    return null;
  }

  return new Date(`${dueDate}T${dueTime}:00`);
};

export const getReminderDate = (dueDate, dueTime, minutesBefore) => {
  const dueAt = combineDueDateTime(dueDate, dueTime);

  if (!dueAt || Number.isNaN(dueAt.getTime()) || minutesBefore === "" || minutesBefore === null || minutesBefore === undefined) {
    return null;
  }

  return new Date(dueAt.getTime() - Number(minutesBefore) * 60 * 1000);
};

export const getRangeBounds = (range, from, to) => {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);

  const end = new Date(now);
  end.setHours(23, 59, 59, 999);

  if (from && to) {
    const customStart = new Date(from);
    customStart.setHours(0, 0, 0, 0);
    const customEnd = new Date(to);
    customEnd.setHours(23, 59, 59, 999);
    return { start: customStart, end: customEnd };
  }

  if (range === "yesterday") {
    start.setDate(start.getDate() - 1);
    end.setDate(end.getDate() - 1);
    return { start, end };
  }

  if (range === "last7days") {
    start.setDate(start.getDate() - 6);
    return { start, end };
  }

  if (range === "last30days") {
    start.setDate(start.getDate() - 29);
    return { start, end };
  }

  return { start, end };
};

export const isTaskOverdue = (task) => {
  if (task.status === "completed") {
    return false;
  }

  const datePart = task.dueDate.toISOString().slice(0, 10);
  return new Date(`${datePart}T${task.dueTime}:00`).getTime() < Date.now();
};
