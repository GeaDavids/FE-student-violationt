import API from "./api";

// Get all reports with filtering and pagination
export const getAllReports = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await API.get(`/master/reports?${queryString}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get report by ID
export const getReportById = async (reportId) => {
  try {
    const response = await API.get(`/master/reports/report/${reportId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create new report
export const createReport = async (reportData) => {
  try {
    const response = await API.post("/master/reports/report", reportData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update report
export const updateReport = async (reportId, reportData) => {
  try {
    const response = await API.put(
      `/master/reports/report/${reportId}`,
      reportData
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete report
export const deleteReport = async (reportId) => {
  try {
    const response = await API.delete(`/master/reports/report/${reportId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all students for selection
export const getAllStudents = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const response = await API.get(`/master/reports/students?${queryString}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get violations (report items with type pelanggaran)
export const getViolations = async () => {
  try {
    const response = await API.get("/master/violations");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get achievements (report items with type prestasi)
export const getAchievements = async () => {
  try {
    const response = await API.get("/master/achievements");
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get categories
export const getCategories = async (tipe) => {
  try {
    const response = await API.get(`/master/kategori?tipe=${tipe}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get report items by category
export const getReportItems = async (kategoriId) => {
  try {
    const response = await API.get(`/master/violations/kategori/${kategoriId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
