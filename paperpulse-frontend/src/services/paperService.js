import api from "../api/axios";

export const getAcceptedPapers = async () => {
  const res = await api.get("/api/papers/accepted");
  return res.data;
};