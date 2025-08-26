import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiHome,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiUsers,
  FiX,
} from "react-icons/fi";

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
      const res = await axios.get(
        "/api/superadmin/masterdata/teachers",
        axiosConfig
      );
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

    let waliKelasIdNum = null;
    if (form.waliKelasId && form.waliKelasId !== "") {
      const parsed = parseInt(form.waliKelasId);
      waliKelasIdNum = isNaN(parsed) ? null : parsed;
    }

    const payload = {
      kodeKelas: form.kodeKelas,
      namaKelas: form.namaKelas,
      waliKelasId: waliKelasIdNum,
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

  const handleCloseModal = () => {
    setFormVisible(false);
    setForm({ kodeKelas: "", namaKelas: "", waliKelasId: "" });
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header Section */}
      <div className="mb-6">
        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2 mb-4">
          <FiHome className="text-lg text-blue-600" /> Kelola Kelas
        </h2>

        {/* Search and Action Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-1 gap-4 w-full md:w-auto">
            <div className="flex items-center border rounded-lg px-3 py-2 flex-1 md:max-w-md bg-white shadow-sm">
              <FiSearch className="mr-2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Cari kelas berdasarkan nama, kode, atau wali kelas..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full outline-none text-sm"
              />
            </div>
            <button
              onClick={async () => {
                await fetchKelas();
                setSearchTerm("");
              }}
              className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors shadow-sm whitespace-nowrap"
            >
              <FiRefreshCw className="text-sm" /> Reset
            </button>
          </div>

          <button
            onClick={() => {
              setForm({ kodeKelas: "", namaKelas: "", waliKelasId: "" });
              setFormVisible(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 font-medium whitespace-nowrap"
          >
            <FiPlus className="text-sm" /> Tambah Kelas
          </button>
        </div>
      </div>

      {/* Modal Form Section */}
      {formVisible && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white rounded-t-xl border-b border-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white">
                    <FiPlus className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Tambah Kelas Baru
                    </h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      Lengkapi data kelas untuk ditambahkan ke sistem
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200 group"
                >
                  <FiX className="text-lg text-gray-500 group-hover:text-gray-700" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kode Kelas <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="kodeKelas"
                      placeholder="Contoh: XII-RPL-1"
                      value={form.kodeKelas}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Kelas <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="namaKelas"
                      placeholder="Contoh: XII RPL 1"
                      value={form.namaKelas}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Wali Kelas
                    </label>
                    <select
                      name="waliKelasId"
                      value={form.waliKelasId}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                    >
                      <option value="">Pilih Wali Kelas (Opsional)</option>
                      {guruList.map((guru) => (
                        <option key={guru.id} value={guru.id}>
                          {guru.name || guru.nama} - {guru.nip}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  >
                    Tambah Kelas
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-3 text-gray-500 text-sm">Memuat data kelas...</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr
                  className="text-gray-700"
                  style={{ backgroundColor: "oklch(96.7% 0.003 264.542)" }}
                >
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Kode Kelas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Nama Kelas
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                    Wali Kelas
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">
                    Siswa
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">
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
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs font-semibold text-gray-900">
                          {kelas.kodeKelas}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs font-medium text-gray-900">
                          {kelas.namaKelas}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs text-gray-700">
                          {kelas.waliKelas || (
                            <span className="text-gray-400 italic text-xs">
                              Belum ditentukan
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() =>
                            viewStudents(kelas.id, kelas.namaKelas)
                          }
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition-colors text-xs bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-md"
                        >
                          <FiUsers className="w-3 h-3" />
                          <span>{kelas.jumlahSiswa || 0}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() =>
                            navigate("/superadmin/detail-kelas", {
                              state: {
                                kelas: kelas,
                                fromPage: "kelola-kelas",
                              },
                            })
                          }
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1.5 mx-auto shadow-sm"
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
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg
                          className="w-12 h-12 mb-3 text-gray-300"
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
                        <p className="text-sm font-medium mb-1">
                          Tidak ada data kelas
                        </p>
                        <p className="text-xs text-gray-400">
                          Kelas yang Anda cari tidak ditemukan atau belum ada
                          data
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
