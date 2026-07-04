import { api } from "./api";

export const integrationsApi = {
  list: async (params = {}) => {
    const res = await api.get('/integrations/', { params });
    return res.data;
  }
};
