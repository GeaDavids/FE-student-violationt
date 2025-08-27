import API from "./api";

const laporanAPI = {
  preview: (params) => API.get("master/rekap/preview-laporan", { params }),
};

export default laporanAPI;
