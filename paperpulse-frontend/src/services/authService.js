import api from "../api/axios";

export const registerUser = async (data) => {
  const res = await api.post("/api/auth/register", data);
  return res.data;
};