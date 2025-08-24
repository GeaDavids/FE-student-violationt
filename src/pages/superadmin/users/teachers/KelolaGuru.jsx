import { useEffect, useState } from "react";
import axios from "axios";
import { FiUsers, FiPlus, FiSearch, FiX } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const KelolaGuru = () => {
  const navigate = useNavigate();
  const [dataGuru, setDataGuru] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    nip: "",
    noHp: "",
    role: "guru",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const token = localStorage.getItem("token");

  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchGuru = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) {
        params.append("search", search);
      }

      if (roleFilter !== "all") {
        params.append("role", roleFilter);
      }

      const res = await axios.get(
        `/api/superadmin/teachers/all?${params}`,
        axiosConfig
      );

      setDataGuru(res.data.data);
      setPagination({
        ...pagination,
        page: res.data.pagination.page,
        total: res.data.pagination.total,
        totalPages: res.data.pagination.totalPages,
      });
    } catch (err) {
      console.error("Gagal mengambil data guru:", err);
      Swal.fire("Error!", "Gagal mengambil data guru", "error");
    }
  };

  useEffect(() => {
    fetchGuru(1);
  }, [search, roleFilter]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleCloseModal = () => {
    setFormVisible(false);
    setErrorMsg("");
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.name.trim() || !form.email.trim() || !form.nip.trim()) {
      setErrorMsg("Nama, email, dan NIP tidak boleh kosong.");
      Swal.fire("Gagal", "Nama, email, dan NIP tidak boleh kosong.", "error");
      return;
    }

    const payload = {
      nama: form.name,
      email: form.email,
      nip: form.nip,
      noHp: form.noHp,
      role: form.role,
    };

    try {
      // Menggunakan endpoint teacher management yang sudah dibuat
      await axios.post("/api/superadmin/teachers", payload, axiosConfig);

      const roleLabel = form.role === "bk" ? "BK" : "Guru";
      Swal.fire(
        "Berhasil!",
        `${roleLabel} baru berhasil ditambahkan!`,
        "success"
      );

      setForm({ name: "", email: "", nip: "", noHp: "", role: "guru" });
      handleCloseModal();
      fetchGuru(1);
    } catch (err) {
      let msg = "Terjadi kesalahan saat menyimpan.";
      if (
        err.response &&
        err.response.data &&
        (err.response.data.error || err.response.data.message)
      ) {
        msg = err.response.data.error || err.response.data.message;
      }
      setErrorMsg(msg);
      Swal.fire("Gagal", msg, "error");
    }
  };

  return (
    <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-4 mb-4">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg shadow-md">
                <FiUsers className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Kelola Guru & BK
                </h1>
                <p className="text-gray-600 mt-0.5 text-xs">
                  Kelola data guru dan konselor BK di sistem
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setForm({
                  name: "",
                  email: "",
                  nip: "",
                  noHp: "",
                  role: "guru",
                });
                setFormVisible(true);
              }}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all duration-300 transform hover:scale-105 hover:shadow-lg font-medium text-sm"
            >
              <FiPlus className="text-sm" />
              Tambah Guru/BK
            </button>
          </div>
        </div>

        {/* Filter dan Search */}
        <div className="bg-gradient-to-r from-white to-gray-50 rounded-lg shadow-md border border-gray-100 p-4 mb-4">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-4 w-4 text-blue-500" />
                </div>
                <input
                  type="text"
                  placeholder="Cari nama, email, atau NIP..."
                  value={search}
                  onChange={handleSearchChange}
                  className="block w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md text-sm"
                />
              </div>

              <div className="relative">
                <select
                  value={roleFilter}
                  onChange={handleRoleFilterChange}
                  className="appearance-none bg-white border border-gray-300 px-3 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer min-w-[120px] text-sm"
                >
                  <option value="all">Semua Role</option>
                  <option value="guru">Guru</option>
                  <option value="bk">BK</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-blue-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    ></path>
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex items-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-sm">
              <FiUsers className="w-3 h-3 mr-1.5" />
              <span className="text-xs font-semibold">
                Total: {pagination.total} data
              </span>
            </div>
          </div>
        </div>

        {/* Modern Modal */}
        {formVisible && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={handleBackdropClick}
          >
            <div className="bg-white rounded-xl w-full max-w-2xl mx-auto shadow-xl border border-gray-200 overflow-hidden">
              {/* Header dengan tema biru */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600">
                      <FiUsers className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-800">
                        Tambah Guru/BK Baru
                      </h3>
                      <p className="text-sm text-blue-600">
                        Lengkapi data untuk menambahkan pengguna baru
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-1.5 hover:bg-white/50 rounded-lg transition-colors duration-200 group"
                  >
                    <FiX className="text-lg text-gray-500 group-hover:text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Masukkan nama lengkap"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="Masukkan email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        NIP
                      </label>
                      <input
                        type="text"
                        name="nip"
                        placeholder="Masukkan NIP"
                        value={form.nip}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all duration-200"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        No. HP (Opsional)
                      </label>
                      <input
                        type="text"
                        name="noHp"
                        placeholder="Masukkan nomor HP"
                        value={form.noHp}
                        onChange={handleChange}
                        className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all duration-200"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Role
                    </label>
                    <select
                      name="role"
                      value={form.role}
                      onChange={handleChange}
                      className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent text-sm transition-all duration-200"
                    >
                      <option value="guru">Guru</option>
                      <option value="bk">BK</option>
                    </select>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    >
                      Simpan Data
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

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-hidden">
            <table className="w-full table-fixed">
              <thead>
                <tr
                  className="text-gray-700"
                  style={{ backgroundColor: "oklch(96.7% 0.003 264.542)" }}
                >
                  <th className="px-3 py-2.5 text-left font-semibold w-36 text-xs uppercase tracking-wide">
                    NIP
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold w-40 text-xs uppercase tracking-wide">
                    NAMA
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold w-44 hidden md:table-cell text-xs uppercase tracking-wide">
                    EMAIL
                  </th>
                  <th className="px-3 py-2.5 text-left font-semibold w-32 text-xs uppercase tracking-wide">
                    NO. HP
                  </th>
                  <th className="px-3 py-2.5 text-center font-semibold w-20 text-xs uppercase tracking-wide">
                    ROLE
                  </th>
                  <th className="px-3 py-2.5 text-center font-semibold w-28 text-xs uppercase tracking-wide">
                    WALI KELAS
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {dataGuru.length > 0 ? (
                  dataGuru.map((guru) => (
                    <tr
                      key={guru.id}
                      className="hover:bg-gray-50 transition-colors duration-150"
                    >
                      <td className="px-3 py-2.5 whitespace-nowrap w-36">
                        <div className="text-sm font-semibold text-gray-900">
                          {guru.nip || "-"}
                        </div>
                      </td>
                      <td
                        className="px-3 py-2.5 cursor-pointer hover:text-blue-600 transition-colors duration-200 w-40"
                        onClick={() =>
                          navigate("/superadmin/detail-guru", {
                            state: {
                              guru: guru,
                              fromPage: "kelola-guru",
                            },
                          })
                        }
                      >
                        <div className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate">
                          {guru.nama}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap hidden md:table-cell w-44">
                        <div
                          className="text-sm text-gray-600 truncate"
                          title={guru.email}
                        >
                          {guru.email}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap w-32">
                        <div className="text-sm text-gray-900 font-mono">
                          {guru.noHp || "-"}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-center w-20">
                        <span
                          className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold ${
                            guru.role === "bk"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {guru.role === "bk" ? "BK" : "Guru"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-center w-28">
                        {guru.waliKelas ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white min-w-[60px] text-center">
                            {guru.waliKelas}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-8 text-gray-500">
                      <div className="flex flex-col items-center">
                        <FiUsers className="text-3xl text-gray-300 mb-3" />
                        <h3 className="text-base font-semibold text-gray-600 mb-1">
                          Tidak Ada Data Guru
                        </h3>
                        <p className="text-sm">
                          Belum ada data guru/BK terdaftar.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-4 py-3 bg-gray-50 border-t flex justify-between items-center">
              <div className="text-xs text-gray-600">
                Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                dari {pagination.total} data
              </div>
              <div className="flex gap-1">
                {Array.from(
                  { length: pagination.totalPages },
                  (_, i) => i + 1
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => fetchGuru(page)}
                    className={`px-2.5 py-1 rounded text-xs ${
                      page === pagination.page
                        ? "bg-blue-600 text-white"
                        : "bg-white text-gray-600 border hover:bg-gray-50"
                    } transition-colors`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default KelolaGuru;
