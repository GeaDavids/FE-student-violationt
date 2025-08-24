import axios from "axios";

export const getTahunAjaranNonAktif = async () => {
  const res = await axios.get("/api/master/rekap/tahun-nonaktif");
  return res.data;
};

export const getTahunAjaran = async () => {
  const res = await axios.get("/api/master/rekap/tahun-ajaran");
  return res.data;
};
