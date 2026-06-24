/* eslint-disable no-unused-labels */
import { api } from "./api";

export const authApi = {
  login: async (credentials) => {
    const res = await api.post("/auth/login/", credentials);
    return res.data;
  },

  verifyOtp: async (data) => {
    const res = await api.post("/auth/verify-otp/", data);
    return res.data;
  },

  createPassword: async (data) => {
    const res = await api.post("/auth/create-password/", data);
    return res.data;
  },

  forgotPassword: async (data) => {
    const res = await api.post("/auth/forgot-password/", data);
    return res.data;
  },

  resetPassword: async (data) => {
    const res = await api.post("/auth/reset-password/", data);
    return res.data;
  },

  me: async () => {
    const res = await api.get("/auth/me/");
    return res.data;
  },

  logout: async () => {
    const res = await api.post("/auth/logout/");
    return res.data;
  }
};