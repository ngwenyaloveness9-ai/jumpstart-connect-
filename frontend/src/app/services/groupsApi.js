import { api } from "./api";

export const groupsApi = {
  // ==========================
  // GROUPS
  // ==========================

  // List all groups for a user
  list: async (userId) => {
    const res = await api.get(`/chat/groups/${userId}`);
    return res.data;
  },

  // Get one group's messages
  messages: async (groupId) => {
    const res = await api.get(`/chat/group/${groupId}/messages`);
    return res.data;
  },

  // Create a new group/workspace
  create: async (data) => {
    const res = await api.post("/chat/groups/create", data);
    return res.data;
  },

  // Update a group
  update: async (groupId, data) => {
    const res = await api.put(`/chat/groups/${groupId}`, data);
    return res.data;
  },

  // Delete a group
  remove: async (groupId) => {
    const res = await api.delete(`/chat/groups/${groupId}`);
    return res.data;
  },

  // ==========================
  // MESSAGES
  // ==========================

  sendMessage: async (formData) => {
    const res = await api.post("/chat/group/send", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  },

  // ==========================
  // DEPARTMENTS
  // ==========================

  // List all departments
  departments: async () => {
    const res = await api.get("/departments");
    return res.data;
  },

  // Create a department
  createDepartment: async (data) => {
    const res = await api.post("/departments", data);
    return res.data;
  },

  // Update a department
  updateDepartment: async (id, data) => {
    const res = await api.put(`/departments/${id}`, data);
    return res.data;
  },

  // Delete a department
  deleteDepartment: async (id) => {
    const res = await api.delete(`/departments/${id}`);
    return res.data;
  },
};