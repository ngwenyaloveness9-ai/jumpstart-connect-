import { api } from "./api";

export const announcementApi = {
    // ---------------------------------------
    // Get all announcements
    // ---------------------------------------
    getAll: async (userId, groupId) => {
        const params = {};
        if (userId) params.user_id = userId;
        if (groupId) params.group_id = groupId;
        const res = await api.get("/announcements/all", { params });
        return res.data;
    },

    // ---------------------------------------
    // Create announcement
    // ---------------------------------------
    create: async (formData) => {
        const res = await api.post(
            "/announcements/create",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return res.data;
    },

    // ---------------------------------------
    // Edit announcement
    // ---------------------------------------
    edit: async (announcementId, data) => {
        const res = await api.patch(
            `/announcements/${announcementId}/edit`,
            data
        );

        return res.data;
    },

    // ---------------------------------------
    // Delete announcement
    // ---------------------------------------
    delete: async (announcementId) => {
        const res = await api.delete(
            `/announcements/${announcementId}`
        );

        return res.data;
    },
};