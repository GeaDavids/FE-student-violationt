import axios from "./axios";

const studentAPI = {
  // Dashboard
  getDashboardByAcademicYear: (params) =>
    axios.get("/student/dashboard", { params }),

  // Reports
  getReportsByAcademicYear: (params) =>
    axios.get("/student/reports", { params }),

  // Profile
  getProfile: () => axios.get("/student/profile"),

  // Academic Years
  getAcademicYears: () => axios.get("/student/academic-years"),
  getCurrentAcademicYear: () => axios.get("/student/current-academic-year"),
};

export default studentAPI;
