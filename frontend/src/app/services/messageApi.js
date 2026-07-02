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
    const res = await api.get(
        `/chat/conversation/${currentUserId}/${otherUserId}`
    );

    console.log("CONVERSATION RESPONSE:", res.data);

    return res.data;
},
  // Send a direct message
  sendMessage: async ({ senderId, receiverId, message }) => {
    const res = await api.post("/chat/send", {
      sender_id: senderId,
      receiver_id: receiverId,
      message,
    });

    return res.data;
  },
};