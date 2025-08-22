import axios from "./axios";

const kategoriAPI = {
  // Get all kategori
  getAll: () => axios.get("/master/kategori"),

  // Get kategori by type
  getByType: (tipe) => axios.get(`/master/kategori/tipe/${tipe}`),

  // Get kategori by id
  getById: (id) => axios.get(`/master/kategori/${id}`),

  // Create kategori
  create: (data) => axios.post("/master/kategori", data),

  // Update kategori
  update: (id, data) => axios.put(`/master/kategori/${id}`, data),

  // Delete kategori
  delete: (id) => axios.delete(`/master/kategori/${id}`),
};

export default kategoriAPI;
