import axios from "./axios";

const bkAPI = {
  // Dashboard
  getDashboard: () => axios.get("/bk/dashboard"),
  getDashboardByAcademicYear: (params) =>
    axios.get("/bk/dashboard-by-year", { params }),

  // Students monitoring
  getStudents: (params) => axios.get("/bk/students", { params }),
  getStudentsByAcademicYear: (params) =>
    axios.get("/bk/students-by-year", { params }),
  getStudentDetail: (studentId) => axios.get(`/bk/students/${studentId}`),

  // Trends and analytics
  getViolationTrends: (params) => axios.get("/bk/violation-trends", { params }),
  getViolationTrendsByAcademicYear: (params) =>
    axios.get("/bk/violation-trends-by-year", { params }),

  // Historical reports for rekap laporan
  getHistoricalStats: (params) => axios.get("/bk/historical-stats", { params }),
  getRecentReports: (params) => axios.get("/bk/recent-reports", { params }),

  // Classrooms
  getClassrooms: () => axios.get("/bk/classrooms"),
};

export default bkAPI;
