import { api } from "./api";

export const projectsApi = {
  list: async (params = {}) => (await api.get("/projects/", { params })).data,
  get: async (id) => (await api.get(`/projects/${id}/`)).data,
  create: async (payload) => (await api.post("/projects/", payload)).data,
  update: async (id, payload) => (await api.patch(`/projects/${id}/`, payload)).data,
  members: async () => (await api.get("/projects/members/")).data,
  tasks: async (params = {}) => (await api.get("/project-tasks/", { params })).data,
  createTask: async (payload) => (await api.post("/project-tasks/", payload)).data,
  updateTask: async (id, payload) => (await api.patch(`/project-tasks/${id}/`, payload)).data,
  comment: async (taskId, body) => (await api.post(`/project-tasks/${taskId}/comments/`, { body })).data,
  attach: async (taskId, file) => {
    const payload = new FormData();
    payload.append("file", file);
    return (await api.post(`/project-tasks/${taskId}/attachments/`, payload)).data;
  },
  calendar: async (params = {}) => (await api.get("/project-calendar/", { params })).data,
};