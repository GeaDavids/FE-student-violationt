import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiHome, FiPlus, FiSearch, FiRefreshCw, FiUsers } from "react-icons/fi";

const KelolaKelas = () => {
  const navigate = useNavigate();
  const [dataKelas, setDataKelas] = useState([]);
  const [filteredKelas, setFilteredKelas] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    kodeKelas: "",
    namaKelas: "",
    waliKelasId: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchKelas = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "/api/superadmin/masterdata/classrooms",
        axiosConfig
      );
      console.log("Data kelas:", res.data);
      setDataKelas(res.data.data || []); // Mengambil array data dari response
      setFilteredKelas(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data kelas:", err);
      Swal.fire("Error!", "Gagal mengambil data kelas", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchGuru = async () => {
    try {
      const res = await axios.get("/api/superadmin/teachers/all", axiosConfig);
      setGuruList(res.data.data || []); // Mengambil array data dari response
    } catch (err) {
      console.error("Gagal mengambil data guru:", err);
    }
  };

  useEffect(() => {
    fetchKelas();
    fetchGuru();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      kodeKelas: form.kodeKelas,
      namaKelas: form.namaKelas,
      waliKelasId: form.waliKelasId ? parseInt(form.waliKelasId) : null,
    };

    console.log("Payload:", payload);

    try {
      await axios.post(
        "/api/superadmin/masterdata/classrooms",
        payload,
        axiosConfig
      );
      Swal.fire("Berhasil!", "Kelas baru berhasil ditambahkan.", "success");

      setForm({ kodeKelas: "", namaKelas: "", waliKelasId: "" });
      setFormVisible(false);
      fetchKelas();
    } catch (err) {
      console.error("Error:", err.response || err);
      let errorMessage = "Terjadi kesalahan saat menyimpan data kelas.";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      Swal.fire("Gagal", errorMessage, "error");
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = dataKelas.filter(
      (kelas) =>
        kelas.namaKelas.toLowerCase().includes(value) ||
        kelas.kodeKelas.toLowerCase().includes(value) ||
        (kelas.waliKelas || "").toLowerCase().includes(value)
    );
    setFilteredKelas(filtered);
  };

  const viewStudents = (kelasId, namaKelas) => {
    Swal.fire({
      title: `Siswa di Kelas ${namaKelas}`,
      text: "Fitur ini akan menampilkan daftar siswa di kelas tersebut",
      icon: "info",
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
          <FiHome /> Kelola Kelas
        </h2>
        <button
          onClick={() => {
            setForm({ kodeKelas: "", namaKelas: "", waliKelasId: "" });
            setFormVisible(true);
          }}
          className="bg-[#003366] text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-[#004080] transition-colors"
        >
          <FiPlus /> Tambah Kelas
        </button>
      </div>

      <div className="flex mb-6 gap-4">
        <div className="flex items-center border rounded-lg px-3 py-2 w-full md:w-1/2 bg-white">
          <FiSearch className="mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kelas berdasarkan nama, kode, atau wali kelas..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full outline-none"
          />
        </div>
        <button
          onClick={async () => {
            await fetchKelas();
            setSearchTerm("");
          }}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <FiRefreshCw /> Reset
        </button>
      </div>

      {formVisible && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border">
          <h3 className="text-lg font-semibold text-[#003366] mb-4">
            Tambah Kelas Baru
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Kode Kelas
              </label>
              <input
                type="text"
                name="kodeKelas"
                placeholder="XII-RPL-1"
                value={form.kodeKelas}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Kelas
              </label>
              <input
                type="text"
                name="namaKelas"
                placeholder="XII RPL 1"
                value={form.namaKelas}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Wali Kelas
              </label>
              <select
                name="waliKelasId"
                value={form.waliKelasId}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              >
                <option value="">Pilih Wali Kelas</option>
                {guruList.map((guru) => (
                  <option key={guru.id} value={guru.id}>
                    {guru.nama} - {guru.nip}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#003366] hover:bg-[#004080] text-white px-4 py-2 rounded-lg transition-colors flex-1"
              >
                Tambah
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormVisible(false);
                  setForm({ kodeKelas: "", namaKelas: "", waliKelasId: "" });
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat data kelas...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#003366] to-[#004080] text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Kode Kelas
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Nama Kelas
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Wali Kelas
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                    Jumlah Siswa
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredKelas.length > 0 ? (
                  filteredKelas.map((kelas, index) => (
                    <tr
                      key={kelas.id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition-colors duration-200`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {kelas.kodeKelas}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {kelas.namaKelas}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {kelas.waliKelas || (
                            <span className="text-gray-400 italic">
                              Belum ditentukan
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() =>
                            viewStudents(kelas.id, kelas.namaKelas)
                          }
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          <FiUsers className="w-4 h-4" />
                          <span>{kelas.jumlahSiswa || 0}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() =>
                              navigate("/superadmin/detail-kelas", {
                                state: {
                                  kelas: kelas,
                                  fromPage: "kelola-kelas",
                                },
                              })
                            }
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                            title="Lihat Detail"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            Detail
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg
                          className="w-12 h-12 mb-4 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                        <p className="text-lg font-medium">
                          Tidak ada data kelas
                        </p>
                        <p className="text-sm text-gray-400">
                          Kelas yang Anda cari tidak ditemukan
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaKelas;
