import axios from "axios";
import API from "./api";

export const getTahunAjaranNonAktif = async () => {
  const res = await API.get("/api/master/rekap/tahun-nonaktif");
  return res.data;
};

export const getTahunAjaran = async () => {
  const res = await API.get("/api/master/rekap/tahun-ajaran");
  return res.data;
};
