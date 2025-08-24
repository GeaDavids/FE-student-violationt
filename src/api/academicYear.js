import axios from "./axios";
import API from "./api";

const academicYearAPI = {
  // Get all academic years
  getAll: () => API.get("/academic-years"),

  // Get current active academic year
  getCurrent: () => API.get("/academic-years/current"),

  // Get academic year with fallback (active or most recent)
  getFallback: (tahunAjaranId = null) => {
    const params = tahunAjaranId ? { tahunAjaranId } : {};
    return API.get("/academic-years/fallback", { params });
  },

  // Create academic year (superadmin only)
  create: (data) => API.post("/academic-years", data),

  // Update academic year (superadmin only)
  update: (id, data) => API.put(`/academic-years/${id}`, data),

  // Delete academic year (superadmin only)
  delete: (id) => API.delete(`/academic-years/${id}`),

  // Set active academic year (superadmin only)
  setActive: (id) => API.put(`/academic-years/${id}/activate`),

  // Transition academic year (superadmin only)
  transition: (newYearId, closeCurrentYear = true) =>
    API.post("/academic-years/transition", { newYearId, closeCurrentYear }),
};

export default academicYearAPI;