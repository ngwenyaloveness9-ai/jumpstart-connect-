import { api } from "./api";

export const announcementApi = {
    // ---------------------------------------
    // Get all announcements
    // ---------------------------------------
    getAll: async () => {
        const res = await api.get("/announcements/all");
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