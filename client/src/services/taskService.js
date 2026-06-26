import api from "./api.js";

export const getTasks = (query = "") => api.get(`/tasks${query ? `?${query}` : ""}`);

export const createTask = (payload) => api.post("/tasks", payload);

export const updateTask = (taskId, payload) => api.put(`/tasks/${taskId}`, payload);

export const deleteTask = (taskId) => api.delete(`/tasks/${taskId}`);

export const completeTask = (taskId) => api.patch(`/tasks/${taskId}/complete`);

export const getHistory = (query = "") => api.get(`/history${query ? `?${query}` : ""}`);
