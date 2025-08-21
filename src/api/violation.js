import axios from "./axios";

const violationAPI = {
  // Get all violations
  getAllViolations: () => axios.get("/violations"),

  // Get violation detail
  getViolationDetail: (id) => axios.get(`/violations/${id}`),

  // Create new violation
  createViolation: (data) => axios.post("/violations", data),

  // Update violation
  updateViolation: (id, data) => axios.put(`/violations/${id}`, data),

  // Delete violation
  deleteViolation: (id) => axios.delete(`/violations/${id}`),
};

export default violationAPI;
