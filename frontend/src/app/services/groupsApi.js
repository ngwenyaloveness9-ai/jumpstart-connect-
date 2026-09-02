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
  messages: async (groupId, userId) => {
    const query = userId ? `?user_id=${userId}` : "";
    const res = await api.get(`/chat/group/${groupId}/messages${query}`);
    return res.data;
  },

  // Get members of a group/workspace
  getMembers: async (groupId) => {
    const res = await api.get(`/chat/groups/${groupId}/members`);
    return res.data.members;
  },

  // Send a message to all members of a group as direct messages
  contactDepartment: async (formData) => {
    const res = await api.post("/chat/department/contact", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  },

  // Create a new group/workspace
  create: async (data) => {
    const res = await api.post("/chat/groups/create", data);
    return res.data;
  },

  // Update a group
  update: async (groupId, data) => {
    const res = await api.put(`/chat/workspaces/${groupId}`, data);
    return res.data;
  },

  // Delete a group
  remove: async (groupId, userId) => {
    const res = await api.delete(`/chat/workspaces/${groupId}`, { data: { user_id: userId } });
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

  deleteMessage: async (messageId) => {
    const res = await api.delete(`/chat/group/message/${messageId}`);
    return res.data;
  },

  updateMessage: async (messageId, message) => {
    const res = await api.patch(`/chat/group/message/${messageId}/edit`, { message });
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
  reactToMessage: async (messageId, userId, emoji) => {
    const res = await api.post("/chat/group/message/reaction", {
        message_id: messageId,
        user_id: userId,
        emoji,
    });

    return res.data;
},
};