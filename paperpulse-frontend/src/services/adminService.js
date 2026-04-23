import api from "../api/axios";

export const getUsers = async () => {
  const res = await api.get("/api/admin/users");
  return res.data;
};

export const getPapers = async () => {
  const res = await api.get("/api/admin/papers");
  return res.data;
};

export const getAssignments = async () => {
  const res = await api.get("/api/admin/assignments");
  return res.data;
};

export const assignReviewer = async (data) => {
  const res = await api.post("/api/admin/assign-reviewer", data);
  return res.data;
};

export const getPaperReviews = async (paperId) => {
  const res = await api.get(`/api/admin/papers/${paperId}/reviews`);
  return res.data;
};

export const makeDecision = async ({ paper_id, decision }) => {
  const res = await api.patch(
    `/api/admin/papers/${paper_id}/decision`,
    { decision }
  );
  return res.data;
};

export const updateUserRole = async (userId, role) => {
  const res = await api.patch(`/api/admin/users/${userId}/role`, {
    role,
  });
  return res.data;
};