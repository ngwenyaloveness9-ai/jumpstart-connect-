import { api } from "./api";

export const messageApi = {

  // =============================
  // PRIVATE CHAT
  // =============================

  getThreads: async (userId) => {
    const res = await api.get(`/chat/inbox/${userId}`);
    return res.data;
  },

  getContacts: async (userId) => {
    const res = await api.get(`/chat/contacts/${userId}`);
    return res.data;
  },

  getThread: async (currentUserId, otherUserId) => {
    const res = await api.get(
      `/chat/conversation/${currentUserId}/${otherUserId}`
    );
    return res.data;
  },

  sendMessage: async ({
    senderId,
    receiverId,
    message,
    attachments = [],
  }) => {

    const formData = new FormData();

    formData.append("sender_id", senderId);
    formData.append("receiver_id", receiverId);
    formData.append("message", message || "");

    attachments.forEach(file => {
      formData.append("attachments", file);
    });

    const res = await api.post("/chat/send", formData);

    return res.data;
  },

  shareAttachment: async ({
    senderId,
    receiverId,
    attachmentId,
    message = "",
  }) => {

    const res = await api.post("/chat/share", {
      sender_id: senderId,
      receiver_id: receiverId,
      attachment_id: attachmentId,
      message,
    });

    return res.data;
  },

  updateMessage: async (messageId, senderId, message) => {
    const res = await api.patch(`/chat/message/${messageId}/edit`, {
      sender_id: senderId,
      message,
    });
    return res.data;
  },

  deleteMessage: async (messageId, senderId) => {
    const res = await api.delete(`/chat/message/${messageId}`, {
      data: { sender_id: senderId },
    });
    return res.data;
  },

  reactToMessage: async (messageId, userId, emoji) => {
    const res = await api.post("/chat/message/reaction", {
      message_id: messageId,
      user_id: userId,
      emoji,
    });
    return res.data;
  },

  // =============================
  // GROUP CHAT
  // =============================

  getGroups: async (userId) => {
    const res = await api.get(`/chat/groups/${userId}`);
    return res.data;
  },

  getGroupMessages: async (groupId) => {
    const res = await api.get(
      `/chat/group/${groupId}/messages`
    );
    return res.data;
  },

  sendGroupMessage: async ({
    groupId,
    senderId,
    message,
    attachments = [],
  }) => {

    const formData = new FormData();

    formData.append("group_id", groupId);
    formData.append("sender_id", senderId);
    formData.append("message", message || "");

    attachments.forEach(file => {
      formData.append("attachments", file);
    });

    const res = await api.post(
      "/chat/group/send",
      formData
    );

    return res.data;
  },

  // =============================
  // CONTACT DEPARTMENT
  // =============================

  contactDepartment: async (payload) => {
    const res = await api.post(
      "/chat/department/contact",
      payload
    );

    return res.data;
  },
};