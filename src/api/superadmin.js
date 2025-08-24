import axios from "./axios";
import API from "./api";

const superadminAPI = {
  // Dashboard
  getDashboard: () => API.get("/superadmin/dashboard"),
  getStatsByAcademicYear: (params) =>
    API.get("/superadmin/stats-by-year", { params }),
  getAnalyticsByAcademicYear: (params) =>
    API.get("/superadmin/analytics-by-year", { params }),

  // Historical reports methods (with tahunAjaranId parameter)
  getSuperadminStatsByAcademicYear: (tahunAjaranId) =>
    API.get("/superadmin/stats-by-year", { params: { tahunAjaranId } }),
  getSystemAnalyticsByAcademicYear: (tahunAjaranId) =>
    API.get("/superadmin/analytics-by-year", { params: { tahunAjaranId } }),

  // User management
  getAllUsers: (params) => API.get("/superadmin/users", { params }),

  // Academic Year Management
  createAcademicYear: (data) => API.post("/academic-years", data),
  updateAcademicYear: (id, data) => API.put(`/academic-years/${id}`, data),
  deleteAcademicYear: (id) => API.delete(`/academic-years/${id}`),
  setActiveAcademicYear: (id) => API.put(`/academic-years/${id}/activate`),
};

export default superadminAPI;
