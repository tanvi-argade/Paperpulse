import api from "../api/axios";

export const createPayment = async (paperId) => {
  const res = await api.post("/api/payments/create", { paper_id: paperId });
  return res.data;
};

export const simulatePayment = async (paperId, status) => {
  const res = await api.patch("/api/payments/pay", { paper_id: paperId, status });
  return res.data;
};

export const getPaymentInfo = async (paperId) => {
  const res = await api.get(`/api/payments/${paperId}`);
  return res.data;
};
