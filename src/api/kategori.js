import axios from "./axios";
import API from "./api";

const kategoriAPI = {
  // Get all kategori
  getAll: () => API.get("/master/kategori"),

  // Get kategori by type
  getByType: (tipe) => API.get(`/master/kategori/tipe/${tipe}`),

  // Get kategori by id
  getById: (id) => API.get(`/master/kategori/${id}`),

  // Create kategori
  create: (data) => API.post("/master/kategori", data),

  // Update kategori
  update: (id, data) => API.put(`/master/kategori/${id}`, data),

  // Delete kategori
  delete: (id) => API.delete(`/master/kategori/${id}`),
};

export default kategoriAPI;