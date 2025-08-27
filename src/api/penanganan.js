import API from "./api";

// Get riwayat penanganan siswa by NISN (with optional tahunAjaranId)
export const getRiwayatPenanganan = async (nisn, tahunAjaranId) => {
  let url = `master/penanganan/riwayat/${nisn}`;
  if (tahunAjaranId && tahunAjaranId !== "all") {
    url += `?tahunAjaranId=${tahunAjaranId}`;
  }
  const response = await API.get(url);
  return response.data;
};

// Get detail penanganan by id
export const getDetailPenanganan = async (id) => {
  const response = await API.get(`master/penanganan/riwayat/detail/${id}`);
  return response.data;
};
