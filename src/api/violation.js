import axios from "./axios";

const violationAPI = {
  // Get all violations
  getAllViolations: () => axios.get("/master/violations"),

  // Get violation detail
  getViolationDetail: (id) => axios.get(`/master/violations/${id}`),

  // Create new violation
  createViolation: (data) => axios.post("/master/violations", data),

  // Update violation
  updateViolation: (id, data) => axios.put(`/master/violations/${id}`, data),

  // Delete violation
  deleteViolation: (id) => axios.delete(`/master/violations/${id}`),
};

export default violationAPI;
