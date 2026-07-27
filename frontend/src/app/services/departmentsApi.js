import api from "./api";

export const departmentsApi = {
    list: async () => {
        const { data } = await api.get("/departments/");
        return data;
    },
};
