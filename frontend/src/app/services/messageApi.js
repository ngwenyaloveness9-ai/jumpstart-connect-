import { api, retryableGet } from "./api";

export const messageApi = {
  // Fetch all message threads
  getThreads: async () => {
    return retryableGet("/messages/threads/");
  },

  // Fetch a specific thread with all messages
  getThread: async (threadId) => {
    const res = await api.get(`/messages/threads/${threadId}/`);
    return res.data;
  },

  // Send a message with optional attachments
  sendMessage: async (threadId, { text, author, authorEmail, contactEmail, attachments }) => {
    const formData = new FormData();
    formData.append("text", text);
    if (author) formData.append("author", author);
    if (authorEmail) formData.append("author_email", authorEmail);
    formData.append("contact_email", contactEmail || "");

    if (attachments && attachments.length > 0) {
      attachments.forEach((file) => {
        formData.append("attachments", file);
      });
    }

    const res = await api.post(`/messages/threads/${threadId}/messages/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
  },

  // Mark a thread as read
  markThreadAsRead: async (threadId) => {
    const res = await api.patch(`/messages/threads/${threadId}/mark-read/`);
    return res.data;
  },
};
