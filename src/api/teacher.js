import axios from "./axios";
import API from "./api";

const teacherAPI = {
  // Dashboard
  getDashboard: () => API.get("/guru/dashboard"),
  getClassStudents: () => API.get("/guru/my-class-students"),
  getClassStatistics: () => API.get("/guru/class-statistics"),

  // Reports
  reportStudent: (data) => API.post("/guru/report-student", data),
  getMyReports: (params) => API.get("/guru/my-reports", { params }),
  getReportsByAcademicYear: (params) =>
    API.get("/guru/reports-by-academic-year", { params }),
  getAcademicYearStats: (params) =>
    API.get("/guru/academic-year-stats", { params }),

  // Profile
  getProfile: () => API.get("/guru/profile"),
  updateProfile: (data) => API.put("/guru/profile", data),

  // Data for reporting
  getViolations: () => API.get("/guru/violations"),
  getAchievements: () => API.get("/guru/achievements"),
  searchStudents: (params) => API.get("/guru/search-students", { params }),

  // Academic Years
  getAcademicYears: () => API.get("/guru/academic-years"),
  getCurrentAcademicYear: () => API.get("/guru/current-academic-year"),
};

export default teacherAPI;
