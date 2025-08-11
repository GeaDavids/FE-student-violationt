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

      setForm({
        tahun: "",
        status: "aktif",
      });
      setFormVisible(false);
      setEditingId(null);
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
          <FiCalendar /> Kelola Angkatan
        </h2>
        <button
          onClick={() => {
            setForm({
              tahun: "",
              status: "aktif",
            });
            setEditingId(null);
            setFormVisible(true);
          }}
          className="bg-[#003366] text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-[#004080] transition-colors"
        >
          <FiPlus /> Tambah Angkatan
        </button>
      </div>

      {/* Filter Section */}
      <div className="flex mb-6 gap-4">
        <div className="flex items-center border rounded-lg px-3 py-2 w-full md:w-1/2 bg-white">
          <FiSearch className="mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari angkatan berdasarkan tahun..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={handleFilterStatus}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#003366] focus:border-transparent"
        >
          <option value="">Semua Status</option>
          {statusList.slice(1).map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            fetchAngkatan();
            resetFilters();
          }}
          className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2 transition-colors"
        >
          <FiRefreshCw /> Reset
        </button>
      </div>

      {formVisible && (
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border">
          <h3 className="text-lg font-semibold text-[#003366] mb-4">
            {editingId ? "Edit Angkatan" : "Tambah Angkatan Baru"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tahun Angkatan
              </label>
              <select
                name="tahun"
                value={form.tahun}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              >
                <option value="">Pilih Tahun</option>
                {yearOptions.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              >
                <option value="aktif">Aktif</option>
                <option value="lulus">Lulus</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-[#003366] hover:bg-[#004080] text-white px-4 py-2 rounded-lg transition-colors flex-1"
              >
                {editingId ? "Update" : "Tambah"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormVisible(false);
                  setEditingId(null);
                  setForm({
                    tahun: "",
                    status: "aktif",
                  });
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
          <p className="mt-4 text-gray-500">Memuat data angkatan...</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-[#003366] to-[#004080] text-white">
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Tahun Angkatan
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider">
                    Status
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
                {filteredAngkatan.length > 0 ? (
                  filteredAngkatan.map((angkatan, index) => (
                    <tr
                      key={angkatan.id}
                      className={`${
                        index % 2 === 0 ? "bg-white" : "bg-gray-50"
                      } hover:bg-blue-50 transition-colors duration-200`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {angkatan.tahun}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(angkatan)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => viewStudents(angkatan)}
                          className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                        >
                          <FiUsers className="w-4 h-4" />
                          <span>{angkatan.jumlahSiswa || 0}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleDetail(angkatan)}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                            title="Lihat Detail"
                          >
                            <FiEye className="w-3 h-3" />
                            Detail
                          </button>
                          <button
                            onClick={() => handleEdit(angkatan)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center gap-1"
                            title="Edit"
                          >
                            <FiEdit2 className="w-3 h-3" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(angkatan.id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-200 flex items-center gap-1"
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
                    <td colSpan="4" className="px-6 py-12 text-center">
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
                            d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h8m-8 0V7h8v4m-8 0l-2 9h12l-2-9"
                          />
                        </svg>
                        <p className="text-lg font-medium">
                          Tidak ada data angkatan
                        </p>
                        <p className="text-sm text-gray-400">
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
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                Angkatan Aktif
              </h3>
              <p className="text-3xl font-bold text-green-600">
                {dataAngkatan.filter((a) => a.status === "aktif").length}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiAward className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                Angkatan Lulus
              </h3>
              <p className="text-3xl font-bold text-blue-600">
                {dataAngkatan.filter((a) => a.status === "lulus").length}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiUsers className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-700 mb-1">
                Total Angkatan
              </h3>
              <p className="text-3xl font-bold text-purple-600">
                {dataAngkatan.length}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FiCalendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KelolaAngkatan;
