import { api } from "./api";

export const authApi = {
  login: async (credentials) => {
    const res = await api.post("/auth/login/", credentials);
    return res.data;
  },
  me: async () => {
    const res = await api.get("/auth/me/");
    return res.data;
  },
  logout: async () => {
    const res = await api.post("/auth/logout/");
    return res.data;
  }
};
