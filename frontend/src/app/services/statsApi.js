import { api } from "./api";

export const statsApi = {
  getDashboard: async () => {
    const res = await api.get('/stats/dashboard/');
    return res.data;
  }
};
