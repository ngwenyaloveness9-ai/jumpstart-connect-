import { api } from "./api";

export const messageApi = {
  // Get inbox for the logged-in user
  getThreads: async (userId) => {
    const res = await api.get(`/chat/inbox/${userId}`);
    return res.data;
  },

  // Get all active users that can be messaged
  getContacts: async (userId) => {
    const res = await api.get(`/chat/contacts/${userId}`);
    return res.data;
  },

  // Get conversation between two users
  getThread: async (currentUserId, otherUserId) => {
    const res = await api.get(`/chat/conversation/${currentUserId}/${otherUserId}`);

    console.log("CONVERSATION RESPONSE:", res.data);

    return res.data;
  },

  // Send a direct message with optional attachments
  sendMessage: async ({ senderId, receiverId, message, attachments = [] }) => {
    const formData = new FormData();
    formData.append("sender_id", senderId);
    formData.append("receiver_id", receiverId);
    formData.append("message", message || "");

    attachments.forEach((file) => {
      formData.append("attachments", file);
    });

    const res = await api.post("/chat/send", formData);
    return res.data;
  },

  // Share an existing attachment with another user
  shareAttachment: async ({ senderId, receiverId, attachmentId, message = "" }) => {
    const res = await api.post("/chat/share", {
      sender_id: senderId,
      receiver_id: receiverId,
      attachment_id: attachmentId,
      message,
    });
    return res.data;
  }
};