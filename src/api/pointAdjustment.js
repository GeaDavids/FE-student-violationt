// Get detail point adjustment by id
export const getPointAdjustmentDetail = async (id) => {
  const response = await API.get(`/bk/adjustments/${id}`);
  return response.data;
};

// Update point adjustment (alasan, keterangan, bukti)
export const updatePointAdjustment = async (id, updateData) => {
  let dataToSend = updateData;
  let config = {};
  if (updateData instanceof FormData) {
    config.headers = { "Content-Type": "multipart/form-data" };
  }
  const response = await API.put(`/bk/adjustments/${id}`, dataToSend, config);
  return response.data;
};
import API from "./api";

// Get students for monitoring (with pagination)
export const getStudentsForMonitoring = async ({
  page = 1,
  limit = 10,
  classroomId,
  search,
  sortBy = "totalScore",
  sortOrder = "desc",
  minScore,
  maxScore,
} = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
    sortBy,
    sortOrder,
  });

  if (classroomId) params.append("classroomId", classroomId.toString());
  if (search) params.append("search", search);
  if (minScore) params.append("minScore", minScore.toString());
  if (maxScore) params.append("maxScore", maxScore.toString());

  const response = await API.get(
    `/bk/monitoring/students?${params.toString()}`
  );
  return response.data;
};

// Get student monitoring detail
export const getStudentMonitoringDetail = async (studentId) => {
  const response = await API.get(`/bk/monitoring/students/${studentId}`);
  return response.data;
};

// Create point adjustment
export const createPointAdjustment = async (studentId, adjustmentData) => {
  // Jika adjustmentData adalah FormData, kirim sebagai multipart
  let dataToSend = adjustmentData;
  let config = {};
  if (adjustmentData instanceof FormData) {
    config.headers = { "Content-Type": "multipart/form-data" };
  }
  const response = await API.post(
    `/bk/students/${studentId}/adjust-points`,
    dataToSend,
    config
  );
  return response.data;
};

// Get all point adjustments with filters
export const getAllPointAdjustments = async ({
  page = 1,
  limit = 10,
  studentId,
  teacherId,
  startDate,
  endDate,
} = {}) => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (studentId) params.append("studentId", studentId.toString());
  if (teacherId) params.append("teacherId", teacherId.toString());
  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await API.get(`/bk/adjustments?${params.toString()}`);
  return response.data;
};

// Get adjustment statistics
export const getAdjustmentStatistics = async ({ startDate, endDate } = {}) => {
  const params = new URLSearchParams();

  if (startDate) params.append("startDate", startDate);
  if (endDate) params.append("endDate", endDate);

  const response = await API.get(
    `/bk/adjustments/statistics?${params.toString()}`
  );
  return response.data;
};
