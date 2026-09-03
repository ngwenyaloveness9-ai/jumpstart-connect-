/* eslint-disable no-unused-labels */
import { api } from "./api";

export const authApi = {
  login: async (credentials) => {
    const res = await api.post("/auth/login/", credentials);
    return res.data;
  },

  createPassword: async (data) => {
    const res = await api.post("/auth/create-password/", data);
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

  updateProfile: async (payload) => {
    const res = await api.patch("/auth/me/", payload);
    return res.data;
  },

  logout: async () => {
    const res = await api.post("/auth/logout/");
    return res.data;
  }
};