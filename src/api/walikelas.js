import axios from "./axios";
import API from "./api";
const walikelasAPI = {
  // Cek apakah user adalah wali kelas
  checkIsWaliKelas: async () => {
    try {
      const res = await API.get("/walikelas/check");
      return res.data?.isWaliKelas === true;
    } catch {
      return false;
    }
  },
};

export default walikelasAPI;
