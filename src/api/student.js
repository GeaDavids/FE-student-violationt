import axios from "./axios";
import API from "./api";

const studentAPI = {
  // Dashboard
  getDashboardByAcademicYear: (params) =>
    API.get("/student/dashboard", { params }),

  // Reports
  getReportsByAcademicYear: (params) => API.get("/student/reports", { params }),

  // Profile
  getProfile: () => API.get("/student/profile"),

  // Academic Years
  getAcademicYears: () => API.get("/student/academic-years"),
  getCurrentAcademicYear: () => API.get("/student/current-academic-year"),
};

export default studentAPI;