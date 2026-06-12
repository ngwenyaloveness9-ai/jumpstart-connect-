import { api } from "./api";

export const usersApi = {
  list: async (params = {}) => {
    const res = await api.get('/users/', { params });
    return res.data;
  },
  detail: async (id) => {
    const res = await api.get(`/users/${id}/`);
    return res.data;
  }
};
