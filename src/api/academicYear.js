import axios from "./axios";

const academicYearAPI = {
  // Get all academic years
  getAll: () => axios.get("/academic-years"),

  // Get current active academic year
  getCurrent: () => axios.get("/academic-years/current"),

  // Get academic year with fallback (active or most recent)
  getFallback: (tahunAjaranId = null) => {
    const params = tahunAjaranId ? { tahunAjaranId } : {};
    return axios.get("/academic-years/fallback", { params });
  },

  // Create academic year (superadmin only)
  create: (data) => axios.post("/academic-years", data),

  // Update academic year (superadmin only)
  update: (id, data) => axios.put(`/academic-years/${id}`, data),

  // Delete academic year (superadmin only)
  delete: (id) => axios.delete(`/academic-years/${id}`),

  // Set active academic year (superadmin only)
  setActive: (id) => axios.put(`/academic-years/${id}/activate`),

  // Transition academic year (superadmin only)
  transition: (newYearId, closeCurrentYear = true) =>
    axios.post("/academic-years/transition", { newYearId, closeCurrentYear }),
};

export default academicYearAPI;
