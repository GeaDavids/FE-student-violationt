import axios from "./axios";

const walikelasAPI = {
  // Cek apakah user adalah wali kelas
  checkIsWaliKelas: async () => {
    try {
      const res = await axios.get("/walikelas/check");
      return res.data?.isWaliKelas === true;
    } catch {
      return false;
    }
  },
};

export default walikelasAPI;
