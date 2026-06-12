import { api } from "./api";

export const webhooksApi = {
  list: async (params = {}) => {
    const res = await api.get('/webhooks/', { params });
    return res.data;
  }
};
