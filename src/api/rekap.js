// Preview data poin siswa (JSON)
export const previewPoinSiswa = async (params = {}) => {
  return API.get("/master/rekap/preview-poin-siswa", { params });
};
// Export data poin siswa (Excel)

import axios from "axios";
import API from "./api";

export const getTahunAjaranNonAktif = async () => {
  const res = await API.get("/master/rekap/tahun-nonaktif");
  return res.data;
};

export const getTahunAjaran = async () => {
  const res = await API.get("/master/rekap/tahun-ajaran");
  return res.data;
};

export const exportPoinSiswa = async (params = {}) => {
  // params: { kelas, tahunAjaranId }
  return API.get("/master/rekap/poin-siswa", {
    params,
    responseType: "blob",
  });
};
// Fetch options kelas dan tahun ajaran untuk filter rekap
export const getRekapOptions = async () => {
  const res = await API.get("/master/rekap/options");
  return res.data;
};
