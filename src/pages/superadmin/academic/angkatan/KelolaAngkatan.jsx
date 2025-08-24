import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiAward,
  FiEdit2,
  FiTrash2,
  FiUsers,
  FiEye,
  FiX,
} from "react-icons/fi";

const KelolaAngkatan = () => {
  const navigate = useNavigate();
  const [dataAngkatan, setDataAngkatan] = useState([]);
  const [filteredAngkatan, setFilteredAngkatan] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    tahun: "",
    status: "aktif",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const token = localStorage.getItem("token");

  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const statusList = [
    { value: "", label: "Semua Status", color: "" },
    { value: "aktif", label: "Aktif", color: "bg-green-100 text-green-800" },
    { value: "lulus", label: "Lulus", color: "bg-blue-100 text-blue-800" },
  ];

  const fetchAngkatan = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "/api/superadmin/masterdata/angkatan",
        axiosConfig
      );
      console.log("Data angkatan:", res.data);
      setDataAngkatan(res.data.data || []);
      setFilteredAngkatan(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data angkatan:", err);
      Swal.fire("Error!", "Gagal mengambil data angkatan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAngkatan();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      tahun: form.tahun,
      status: form.status,
    };

    console.log("Payload:", payload);

    try {
      if (editingId) {
        await axios.put(
          `/api/superadmin/masterdata/angkatan/${editingId}`,
          payload,
          axiosConfig
        );
        Swal.fire("Berhasil!", "Data angkatan berhasil diperbarui.", "success");
      } else {
        await axios.post(
          "/api/superadmin/masterdata/angkatan",
          payload,
          axiosConfig
        );
        Swal.fire(
          "Berhasil!",
          "Data angkatan baru berhasil ditambahkan.",
          "success"
        );
      }

      handleCloseModal();
      fetchAngkatan();
    } catch (err) {
      console.error("Error:", err.response || err);
      let errorMessage = "Terjadi kesalahan saat menyimpan data angkatan.";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      Swal.fire("Gagal", errorMessage, "error");
    }
  };

  const handleEdit = (angkatan) => {
    setEditingId(angkatan.id);
    setForm({
      tahun: angkatan.tahun,
      status: angkatan.status,
    });
    setFormVisible(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data angkatan tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `/api/superadmin/masterdata/angkatan/${id}`,
            axiosConfig
          );
          Swal.fire("Terhapus!", "Data angkatan telah dihapus.", "success");
          fetchAngkatan();
        } catch (err) {
          console.error("Delete error:", err.response || err);
          Swal.fire("Gagal", "Gagal menghapus data angkatan.", "error");
        }
      }
    });
  };

  const handleDetail = (angkatan) => {
    navigate("/superadmin/detail-angkatan", {
      state: {
        angkatan: angkatan,
        fromPage: "kelola-angkatan",
      },
    });
  };

  const viewStudents = (angkatan) => {
    // Navigate to student list for this angkatan
    navigate("/superadmin/pilih-kelas", {
      state: {
        filterAngkatan: angkatan.id,
        angkatanName: `Angkatan ${angkatan.tahun}`,
      },
    });
  };

  const handleCloseModal = () => {
    setFormVisible(false);
    setEditingId(null);
    setShowYearDropdown(false);
    setForm({
      tahun: "",
      status: "aktif",
    });
  };

  const handleYearSelect = (year) => {
    setForm((prev) => ({ ...prev, tahun: year }));
    setShowYearDropdown(false);
  };

  const handleYearDropdownClick = () => {
    setShowYearDropdown(true);
  };

  const handleYearDropdownClose = () => {
    setShowYearDropdown(false);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    applyFilters(value, filterStatus);
  };

  const handleFilterStatus = (e) => {
    const value = e.target.value;
    setFilterStatus(value);
    applyFilters(searchTerm, value);
  };

  const applyFilters = (search, status) => {
    let filtered = dataAngkatan.filter((angkatan) => {
      const tahun = angkatan.tahun.toString();

      const matchSearch = tahun.includes(search);

      // Filter berdasarkan status
      let matchStatus = true;
      if (status && status !== "") {
        matchStatus = angkatan.status === status;
      }

      return matchSearch && matchStatus;
    });
    setFilteredAngkatan(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilteredAngkatan(dataAngkatan);
  };

  const getStatusBadge = (angkatan) => {
    let color = "";
    let label = "";

    if (angkatan.status === "lulus") {
      color = "bg-blue-100 text-blue-800";
      label = "Lulus";
    } else {
      color = "bg-green-100 text-green-800";
      label = "Aktif";
    }

    return (
      <span className={`${color} px-2 py-1 rounded-full text-xs font-medium`}>
        {label}
      </span>
    );
  };

  // Generate tahun options
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear + 2; i >= currentYear - 10; i--) {
    yearOptions.push(i);
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Header Section */}
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg shadow-md">
            <FiCalendar className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Kelola Angkatan
            </h1>
            <p className="text-gray-600 text-xs">
              Kelola data tahun angkatan siswa di sistem
            </p>
          </div>
        </div>

        {/* Search and Action Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-1 gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <FiSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari angkatan berdasarkan tahun..."
                value={searchTerm}
                onChange={handleSearch}
                className="block w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 shadow-sm"
              />
            </div>

            <div className="relative">
              <select
                value={filterStatus}
                onChange={handleFilterStatus}
                className="appearance-none bg-white border border-gray-300 px-3 py-2 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 shadow-sm cursor-pointer text-sm min-w-[120px]"
              >
                <option value="">Semua Status</option>
                {statusList.slice(1).map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <svg
                  className="w-4 h-4 text-gray-400"
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

            <button
              onClick={() => {
                fetchAngkatan();
                resetFilters();
              }}
              className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded-lg text-xs flex items-center gap-1.5 transition-colors shadow-sm whitespace-nowrap"
            >
              <FiRefreshCw className="text-xs" /> Reset
            </button>
          </div>

          <button
            onClick={() => {
              setForm({
                tahun: "",
                status: "aktif",
              });
              setEditingId(null);
              setFormVisible(true);
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 font-medium text-sm whitespace-nowrap"
          >
            <FiPlus className="text-sm" />
            Tambah Angkatan
          </button>
        </div>
      </div>

      {/* Modal Form Section */}
      {formVisible && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[90vh] overflow-visible relative">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white rounded-t-xl border-b border-gray-200 px-6 py-4 z-20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white">
                    <FiPlus className="text-lg" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">
                      {editingId ? "Edit Angkatan" : "Tambah Angkatan Baru"}
                    </h3>
                    <p className="text-sm text-gray-600 mt-0.5">
                      {editingId
                        ? "Perbarui data angkatan"
                        : "Lengkapi data angkatan untuk ditambahkan ke sistem"}
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
            <div className="p-6 relative z-30">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="relative z-40">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Tahun Angkatan <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={handleYearDropdownClick}
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm bg-white cursor-pointer text-left flex justify-between items-center"
                      >
                        <span
                          className={
                            form.tahun ? "text-gray-900" : "text-gray-500"
                          }
                        >
                          {form.tahun || "Pilih Tahun Angkatan"}
                        </span>
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="relative z-30">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status Angkatan <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm appearance-none bg-white cursor-pointer"
                      style={{
                        position: "relative",
                        zIndex: 30,
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 12px center",
                        backgroundSize: "16px",
                        paddingRight: "40px",
                      }}
                    >
                      <option value="aktif">Aktif</option>
                      <option value="lulus">Lulus</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                  >
                    {editingId ? "Update Angkatan" : "Tambah Angkatan"}
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
          <p className="mt-3 text-gray-500 text-sm">Memuat data angkatan...</p>
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
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide w-1/4">
                    Tahun Angkatan
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide w-1/4">
                    Status
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide w-1/4">
                    Siswa
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide w-1/4">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredAngkatan.length > 0 ? (
                  filteredAngkatan.map((angkatan, index) => (
                    <tr
                      key={angkatan.id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition-colors duration-200`}
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-xs font-semibold text-gray-900">
                          {angkatan.tahun}
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span
                          className={`${
                            angkatan.status === "lulus"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          } px-2 py-1 rounded-full text-xs font-medium`}
                        >
                          {angkatan.status === "lulus" ? "Lulus" : "Aktif"}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => viewStudents(angkatan)}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium transition-colors text-xs bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-md"
                        >
                          <FiUsers className="w-3 h-3" />
                          <span>{angkatan.jumlahSiswa || 0}</span>
                        </button>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => handleDetail(angkatan)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 shadow-sm"
                            title="Lihat Detail"
                          >
                            <FiEye className="w-3 h-3" />
                            Detail
                          </button>
                          <button
                            onClick={() => handleEdit(angkatan)}
                            className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 shadow-sm"
                            title="Edit"
                          >
                            <FiEdit2 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(angkatan.id)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-2.5 py-1.5 rounded-md text-xs font-medium transition-all duration-200 flex items-center gap-1 shadow-sm"
                            title="Hapus"
                          >
                            <FiTrash2 className="w-3 h-3" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg
                          className="w-10 h-10 mb-3 text-gray-300"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h8m-8 0V7h8v4m-8 0l-2 9h12l-2-9"
                          />
                        </svg>
                        <p className="text-sm font-medium mb-1">
                          Tidak ada data angkatan
                        </p>
                        <p className="text-xs text-gray-400">
                          Angkatan yang Anda cari tidak ditemukan
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

      {/* Statistics */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Angkatan Aktif
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {dataAngkatan.filter((a) => a.status === "aktif").length}
              </p>
            </div>
            <div className="bg-green-100 p-2.5 rounded-full">
              <FiAward className="w-5 h-5 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Angkatan Lulus
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {dataAngkatan.filter((a) => a.status === "lulus").length}
              </p>
            </div>
            <div className="bg-blue-100 p-2.5 rounded-full">
              <FiUsers className="w-5 h-5 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Total Angkatan
              </h3>
              <p className="text-2xl font-bold text-purple-600">
                {dataAngkatan.length}
              </p>
            </div>
            <div className="bg-purple-100 p-2.5 rounded-full">
              <FiCalendar className="w-5 h-5 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Custom Year Dropdown Modal */}
      {showYearDropdown && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60]"
          onClick={handleYearDropdownClose}
        >
          <div
            className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-sm max-h-[60vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-white rounded-t-xl border-b border-gray-200 px-4 py-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">
                  Pilih Tahun Angkatan
                </h3>
                <button
                  onClick={handleYearDropdownClose}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <FiX className="text-lg text-gray-500" />
                </button>
              </div>
            </div>

            {/* Year Options */}
            <div className="p-2">
              {yearOptions.map((year) => (
                <button
                  key={year}
                  onClick={() => handleYearSelect(year)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 ${
                    form.tahun === year
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                      : "text-gray-700"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaAngkatan;
