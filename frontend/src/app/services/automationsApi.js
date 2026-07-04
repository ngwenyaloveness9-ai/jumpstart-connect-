import { api } from "./api";

export const automationsApi = {
  list: async () => {
    const res = await api.get("/automations/");
    return res.data;
  },
  create: async (payload) => {
    const res = await api.post("/automations/", payload);
    return res.data;
  },
  update: async (id, payload) => {
    const res = await api.patch(`/automations/${id}/`, payload);
    return res.data;
  },
  remove: async (id) => {
    const res = await api.delete(`/automations/${id}/`);
    return res.data;
  },
};
