import axios from "./axios";

const teacherAPI = {
  // Dashboard
  getDashboard: () => axios.get("/guru/dashboard"),
  getClassStudents: () => axios.get("/guru/my-class-students"),
  getClassStatistics: () => axios.get("/guru/class-statistics"),

  // Reports
  reportStudent: (data) => axios.post("/guru/report-student", data),
  getMyReports: (params) => axios.get("/guru/my-reports", { params }),
  getReportsByAcademicYear: (params) =>
    axios.get("/guru/reports-by-academic-year", { params }),
  getAcademicYearStats: (params) =>
    axios.get("/guru/academic-year-stats", { params }),

  // Profile
  getProfile: () => axios.get("/guru/profile"),
  updateProfile: (data) => axios.put("/guru/profile", data),

  // Data for reporting
  getViolations: () => axios.get("/guru/violations"),
  getAchievements: () => axios.get("/guru/achievements"),
  searchStudents: (params) => axios.get("/guru/search-students", { params }),

  // Academic Years
  getAcademicYears: () => axios.get("/guru/academic-years"),
  getCurrentAcademicYear: () => axios.get("/guru/current-academic-year"),
};

export default teacherAPI;
