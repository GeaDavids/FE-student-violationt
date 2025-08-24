import API from "./api";

const violationAPI = {
  // Get all violations
  getAllViolations: () => API.get("/master/violations"),

  // Get violation detail
  getViolationDetail: (id) => API.get(`/master/violations/${id}`),

  // Create new violation
  createViolation: (data) => API.post("/master/violations", data),

  // Update violation
  updateViolation: (id, data) => API.put(`/master/violations/${id}`, data),

  // Delete violation
  deleteViolation: (id) => API.delete(`/master/violations/${id}`),
};

export default violationAPI;
