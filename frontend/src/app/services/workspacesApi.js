import { api } from "./api";

export const workspacesApi = {
  list: async (params = {}) => {
    const res = await api.get('/workspaces/', { params });
    return res.data;
  },
};
