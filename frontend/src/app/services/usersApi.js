import { api } from "./api";

export const usersApi = {
  list: async (params = {}) => {
    const res = await api.get("/users/", { params });
    return res.data;
  },

  detail: async (id) => {
    const res = await api.get(`/users/${id}/`);
    return res.data;
  },

  create: async (payload) => {
    const res = await api.post("/employees/create/", payload);
    return res.data;
  },

  update: async (id, payload) => {
    const res = await api.patch(`/users/${id}/`, payload);
    return res.data;
  },

  remove: async (id) => {
    const res = await api.delete(`/users/${id}/`);
    return res.data;
  },

  sendResetOtp: async (id) => {
    const res = await api.post(`/users/${id}/reset-otp/`);
    return res.data;
  },

  sendResetLink: async (id, otp) => {
    const res = await api.post(`/users/${id}/reset-link/`, { otp });
    return res.data;
  },
};