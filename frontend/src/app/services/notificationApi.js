import { api } from "./api";

export const notificationApi = {
    list: async () => {
        const res = await api.get("/notifications/");
        return res.data;
    },

    markAsRead: async (notificationId) => {
        const res = await api.patch("/notifications/", {
            notificationId,
        });
        return res.data;
    },
};
