import api from "./api.js";

export const loginUser = (credentials) => api.post("/auth/login", credentials);

export const registerUser = (payload) => api.post("/auth/register", payload);

export const getProfile = () => api.get("/auth/profile");

export const updateProfile = (payload) => api.put("/auth/profile", payload);
