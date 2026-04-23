import api from "../api/axios";

export const getPublishedPapers = async () => {
  const res = await api.get("/api/papers/published");
  return res.data;
};