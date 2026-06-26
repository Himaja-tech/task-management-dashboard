import React from "react";
import { createContext, useContext, useMemo, useState } from "react";
import { loginUser, registerUser, updateProfile as updateProfileRequest } from "../services/authService.js";

const AuthContext = createContext(null);
const tokenKey = "task_manager_productivity_dashboard_token";
const userKey = "task_manager_productivity_dashboard_user";
const legacyTokenKey = "workpulse_token";
const legacyUserKey = "workpulse_user";

const getSavedUser = () => {
  try {
    const savedUser = localStorage.getItem(userKey) || localStorage.getItem(legacyUserKey);
    return savedUser ? JSON.parse(savedUser) : null;
  } catch (error) {
    localStorage.removeItem(userKey);
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(legacyUserKey);
    localStorage.removeItem(legacyTokenKey);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getSavedUser);
  const [token, setToken] = useState(() => localStorage.getItem(tokenKey) || localStorage.getItem(legacyTokenKey));

  const saveSession = (payload) => {
    localStorage.setItem(tokenKey, payload.token);
    localStorage.setItem(userKey, JSON.stringify(payload.user));
    localStorage.removeItem(legacyTokenKey);
    localStorage.removeItem(legacyUserKey);
    setToken(payload.token);
    setUser(payload.user);
  };

  const login = async (credentials) => {
    const { data } = await loginUser(credentials);
    saveSession(data);
    return data;
  };

  const register = async (payload) => {
    const { data } = await registerUser(payload);
    return data;
  };

  const updateProfile = async (payload) => {
    const { data } = await updateProfileRequest(payload);
    saveSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);
    localStorage.removeItem(legacyTokenKey);
    localStorage.removeItem(legacyUserKey);
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      updateProfile,
      logout
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
