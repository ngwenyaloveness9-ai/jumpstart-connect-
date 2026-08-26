import { api } from "./api";

export const leaveApi = {
  list: async () => (await api.get("/leave/")).data,
  create: async (payload) => (await api.post("/leave/", payload, { headers: { "Content-Type": "multipart/form-data" } })).data,
  updateStatus: async (id, status, declineReason = "") => (await api.patch(`/leave/${id}/`, { status, declineReason })).data,
};