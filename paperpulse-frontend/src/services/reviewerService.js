import api from "../api/axios";

export const getAssignedPapers = async () => {
  const res = await api.get("/api/reviewer/papers");
  return res.data;
};

export const submitReview = async (data) => {
  const res = await api.post("/api/reviewer/review", data);
  return res.data;
};