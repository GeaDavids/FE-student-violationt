<<<<<<< HEAD
=======
// Preview data poin siswa (JSON)
export const previewPoinSiswa = async (params = {}) => {
  return API.get("/master/rekap/preview-poin-siswa", { params });
};
// Export data poin siswa (Excel)
>>>>>>> main

import axios from "axios";
import API from "./api";

export const getTahunAjaranNonAktif = async () => {
<<<<<<< HEAD
  const res = await API.get("/api/master/rekap/tahun-nonaktif");
=======
  const res = await API.get("/master/rekap/tahun-nonaktif");
>>>>>>> main
  return res.data;
};

export const getTahunAjaran = async () => {
<<<<<<< HEAD
  const res = await API.get("/api/master/rekap/tahun-ajaran");
=======
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
>>>>>>> main
  return res.data;
};
