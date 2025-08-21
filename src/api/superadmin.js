import axios from "./axios";

const superadminAPI = {
  // Dashboard
  getDashboard: () => axios.get("/superadmin/dashboard"),
  getStatsByAcademicYear: (params) =>
    axios.get("/superadmin/stats-by-year", { params }),
  getAnalyticsByAcademicYear: (params) =>
    axios.get("/superadmin/analytics-by-year", { params }),

  // Historical reports methods (with tahunAjaranId parameter)
  getSuperadminStatsByAcademicYear: (tahunAjaranId) =>
    axios.get("/superadmin/stats-by-year", { params: { tahunAjaranId } }),
  getSystemAnalyticsByAcademicYear: (tahunAjaranId) =>
    axios.get("/superadmin/analytics-by-year", { params: { tahunAjaranId } }),

  // User management
  getAllUsers: (params) => axios.get("/superadmin/users", { params }),

  // Academic Year Management
  createAcademicYear: (data) => axios.post("/academic-years", data),
  updateAcademicYear: (id, data) => axios.put(`/academic-years/${id}`, data),
  deleteAcademicYear: (id) => axios.delete(`/academic-years/${id}`),
  setActiveAcademicYear: (id) => axios.put(`/academic-years/${id}/activate`),
};

export default superadminAPI;
