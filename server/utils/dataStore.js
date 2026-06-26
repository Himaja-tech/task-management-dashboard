import bcrypt from "bcryptjs";
import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import Notification from "../models/Notification.js";
import Task from "../models/Task.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, "..", "data");
const dataFile = path.join(dataDir, "task-manager-data.json");

let storageMode = "file";
let saveQueue = Promise.resolve();

const memory = {
  users: [],
  tasks: [],
  notifications: []
};

const reviveDates = (items, fields) => {
  items.forEach((item) => {
    fields.forEach((field) => {
      if (item[field]) {
        item[field] = new Date(item[field]);
      }
    });
  });
};

export const loadFileStore = async () => {
  try {
    const raw = await fs.readFile(dataFile, "utf8");
    const parsed = JSON.parse(raw);

    memory.users = Array.isArray(parsed.users) ? parsed.users : [];
    memory.tasks = Array.isArray(parsed.tasks) ? parsed.tasks : [];
    memory.notifications = Array.isArray(parsed.notifications) ? parsed.notifications : [];

    reviveDates(memory.users, ["createdAt", "updatedAt"]);
    reviveDates(memory.tasks, ["dueDate", "reminderTime", "completedAt", "createdAt", "updatedAt"]);
    reviveDates(memory.notifications, ["scheduledTime", "sentAt", "createdAt", "updatedAt"]);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.warn(`Unable to load local data store: ${error.message}`);
    }
  }
};

const saveFileStore = async () => {
  if (storageMode !== "file") {
    return;
  }

  saveQueue = saveQueue
    .then(async () => {
      await fs.mkdir(dataDir, { recursive: true });
      await fs.writeFile(dataFile, JSON.stringify(memory, null, 2));
    })
    .catch((error) => {
      console.warn(`Unable to save local data store: ${error.message}`);
    });

  await saveQueue;
};

const createId = () => {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
};

const publicUser = (user) => {
  if (!user) {
    return null;
  }

  const plain = user.toObject ? user.toObject() : { ...user };
  delete plain.password;
  return plain;
};

const toPlain = (doc) => {
  return doc?.toObject ? doc.toObject() : doc;
};

export const setStorageMode = (mode) => {
  storageMode = mode;
};

export const getStorageMode = () => storageMode;

const priorityRank = {
  High: 1,
  Medium: 2,
  Low: 3
};

const sortTasks = (tasks, sort = "newest") => {
  const sorted = [...tasks];

  if (sort === "oldest") {
    return sorted.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  if (sort === "priority") {
    return sorted.sort((a, b) => priorityRank[a.priority] - priorityRank[b.priority] || new Date(a.dueDate) - new Date(b.dueDate));
  }

  if (sort === "dueDate") {
    return sorted.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate) || a.dueTime.localeCompare(b.dueTime));
  }

  return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};

const filterTasks = (tasks, query = {}) => {
  return tasks
    .filter((task) => !query.status || query.status === "all" || task.status === query.status)
    .filter((task) => !query.priority || query.priority === "all" || task.priority === query.priority)
    .filter((task) => !query.category || query.category === "all" || task.category === query.category)
    .filter((task) => {
      if (!query.date) {
        return true;
      }

      return new Date(task.dueDate).toISOString().slice(0, 10) === query.date;
    })
    .filter((task) => {
      if (!query.search) {
        return true;
      }

      const searchable = `${task.title} ${task.notes || ""}`.toLowerCase();
      return searchable.includes(query.search.toLowerCase());
    });
};

const buildMongoTaskQuery = (userId, query = {}) => {
  const filters = { userId };

  if (query.status && query.status !== "all") {
    filters.status = query.status;
  }

  if (query.priority && query.priority !== "all") {
    filters.priority = query.priority;
  }

  if (query.category && query.category !== "all") {
    filters.category = query.category;
  }

  if (query.date) {
    const start = new Date(query.date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(query.date);
    end.setHours(23, 59, 59, 999);
    filters.dueDate = { $gte: start, $lte: end };
  }

  if (query.search) {
    filters.$or = [
      { title: { $regex: query.search, $options: "i" } },
      { notes: { $regex: query.search, $options: "i" } }
    ];
  }

  return filters;
};

const mongoSort = (sort) => {
  const sorts = {
    oldest: { createdAt: 1 },
    priority: { priority: 1, dueDate: 1 },
    dueDate: { dueDate: 1, dueTime: 1 },
    newest: { createdAt: -1 }
  };

  return sorts[sort] || sorts.newest;
};

export const store = {
  async findUserByEmail(email, { includePassword = false } = {}) {
    if (storageMode === "mongo") {
      const query = User.findOne({ email });
      return includePassword ? query.select("+password") : query.select("-password");
    }

    const user = memory.users.find((item) => item.email === email.toLowerCase());
    return includePassword ? user || null : publicUser(user);
  },

  async findUserById(userId) {
    if (storageMode === "mongo") {
      return User.findById(userId).select("-password");
    }

    return publicUser(memory.users.find((user) => user._id === userId));
  },

  async createUser({ name, email, password }) {
    if (storageMode === "mongo") {
      return User.create({ name, email, password });
    }

    const now = new Date();
    const user = {
      _id: createId(),
      name,
      email: email.toLowerCase(),
      password: await bcrypt.hash(password, 12),
      role: "employee",
      createdAt: now,
      updatedAt: now
    };
    memory.users.push(user);
    await saveFileStore();
    return publicUser(user);
  },

  async updateUser(userId, updates) {
    const allowedUpdates = {
      name: updates.name,
      email: updates.email?.toLowerCase(),
      username: updates.username,
      bio: updates.bio,
      timeZone: updates.timeZone,
      language: updates.language,
      emailNotifications: updates.emailNotifications,
      phone: updates.phone,
      department: updates.department,
      role: updates.role,
      employeeId: updates.employeeId,
      location: updates.location
    };

    Object.keys(allowedUpdates).forEach((key) => {
      if (allowedUpdates[key] === undefined) {
        delete allowedUpdates[key];
      }
    });

    if (storageMode === "mongo") {
      return User.findByIdAndUpdate(userId, allowedUpdates, { new: true, runValidators: true }).select("-password");
    }

    const user = memory.users.find((item) => item._id === userId);
    if (!user) {
      return null;
    }

    Object.assign(user, allowedUpdates, { updatedAt: new Date() });
    await saveFileStore();
    return publicUser(user);
  },

  async comparePassword(user, candidatePassword) {
    if (!user) {
      return false;
    }

    if (storageMode === "mongo" && user.comparePassword) {
      return user.comparePassword(candidatePassword);
    }

    return bcrypt.compare(candidatePassword, user.password);
  },

  async listTasks(userId, query = {}) {
    if (storageMode === "mongo") {
      const docs = await Task.find(buildMongoTaskQuery(userId, query)).sort(mongoSort(query.sort));
      return docs.map(toPlain);
    }

    return sortTasks(filterTasks(memory.tasks.filter((task) => task.userId === userId), query), query.sort);
  },

  async createTask(payload) {
    if (storageMode === "mongo") {
      return toPlain(await Task.create(payload));
    }

    const now = new Date();
    const task = {
      _id: createId(),
      ...payload,
      dueDate: new Date(payload.dueDate),
      status: payload.status || "pending",
      completedAt: payload.completedAt || null,
      createdAt: now,
      updatedAt: now
    };
    memory.tasks.unshift(task);
    await saveFileStore();
    return task;
  },

  async findTask(userId, taskId) {
    if (storageMode === "mongo") {
      return toPlain(await Task.findOne({ _id: taskId, userId }));
    }

    return memory.tasks.find((task) => task._id === taskId && task.userId === userId) || null;
  },

  async updateTask(userId, taskId, updates) {
    if (storageMode === "mongo") {
      const task = await Task.findOneAndUpdate({ _id: taskId, userId }, updates, { new: true, runValidators: true });
      return toPlain(task);
    }

    const task = memory.tasks.find((item) => item._id === taskId && item.userId === userId);
    if (!task) {
      return null;
    }

    Object.assign(task, updates, {
      dueDate: updates.dueDate ? new Date(updates.dueDate) : task.dueDate,
      updatedAt: new Date()
    });
    await saveFileStore();
    return task;
  },

  async deleteTask(userId, taskId) {
    if (storageMode === "mongo") {
      return toPlain(await Task.findOneAndDelete({ _id: taskId, userId }));
    }

    const index = memory.tasks.findIndex((task) => task._id === taskId && task.userId === userId);
    if (index === -1) {
      return null;
    }

    const [task] = memory.tasks.splice(index, 1);
    await saveFileStore();
    return task;
  },

  async deleteNotifications({ userId, taskId, pendingOnly = false }) {
    if (storageMode === "mongo") {
      const query = { userId };
      if (taskId) {
        query.taskId = taskId;
      }
      if (pendingOnly) {
        query.sentAt = null;
      }
      await Notification.deleteMany(query);
      return;
    }

    memory.notifications = memory.notifications.filter((notification) => {
      const matchesUser = notification.userId === userId;
      const matchesTask = !taskId || notification.taskId === taskId;
      const matchesPending = !pendingOnly || !notification.sentAt;
      return !(matchesUser && matchesTask && matchesPending);
    });
    await saveFileStore();
  },

  async createNotification(payload) {
    if (storageMode === "mongo") {
      return toPlain(await Notification.create(payload));
    }

    const now = new Date();
    const notification = {
      _id: createId(),
      isRead: false,
      sentAt: null,
      createdAt: now,
      updatedAt: now,
      ...payload,
      scheduledTime: new Date(payload.scheduledTime)
    };
    memory.notifications.unshift(notification);
    await saveFileStore();
    return notification;
  },

  async markDueNotificationsSent(userId, now = new Date()) {
    if (storageMode === "mongo") {
      const dueNotifications = await Notification.find({
        userId,
        scheduledTime: { $lte: now },
        sentAt: null
      }).populate("taskId", "title dueTime");

      await Promise.all(
        dueNotifications.map(async (notification) => {
          notification.sentAt = now;
          await notification.save();
        })
      );

      return dueNotifications.map(toPlain);
    }

    const dueNotifications = memory.notifications
      .filter((notification) => notification.userId === userId && !notification.sentAt && notification.scheduledTime <= now)
      .map((notification) => {
        notification.sentAt = now;
        notification.updatedAt = now;
        return notification;
      });

    if (dueNotifications.length > 0) {
      await saveFileStore();
    }

    return dueNotifications;
  },

  async markAllDueNotificationsSent(now = new Date()) {
    if (storageMode === "mongo") {
      const dueNotifications = await Notification.find({
        scheduledTime: { $lte: now },
        sentAt: null
      });

      await Promise.all(
        dueNotifications.map(async (notification) => {
          notification.sentAt = now;
          await notification.save();
        })
      );

      return dueNotifications.map(toPlain);
    }

    const dueNotifications = memory.notifications
      .filter((notification) => !notification.sentAt && notification.scheduledTime <= now)
      .map((notification) => {
        notification.sentAt = now;
        notification.updatedAt = now;
        return notification;
      });

    if (dueNotifications.length > 0) {
      await saveFileStore();
    }

    return dueNotifications;
  },

  async listNotifications(userId) {
    if (storageMode === "mongo") {
      const docs = await Notification.find({ userId }).sort({ scheduledTime: -1, createdAt: -1 }).limit(80).populate("taskId", "title status dueDate dueTime");
      return docs.map(toPlain);
    }

    return memory.notifications
      .filter((notification) => notification.userId === userId)
      .sort((a, b) => new Date(b.scheduledTime) - new Date(a.scheduledTime) || new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 80);
  },

  async markNotificationRead(userId, notificationId) {
    if (storageMode === "mongo") {
      return toPlain(await Notification.findOneAndUpdate({ _id: notificationId, userId }, { isRead: true }, { new: true }));
    }

    const notification = memory.notifications.find((item) => item._id === notificationId && item.userId === userId);
    if (!notification) {
      return null;
    }

    notification.isRead = true;
    notification.updatedAt = new Date();
    await saveFileStore();
    return notification;
  }
};
