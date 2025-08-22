import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiFileText,
  FiSearch,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiAward,
  FiAlertTriangle,
  FiRefreshCw,
  FiDownload,
} from "react-icons/fi";

const LaporanPelanggaran = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    studentId: "",
    classroomId: "",
    tipe: "",
    kategori: "",
    startDate: "",
    endDate: "",
  });

  // Pagination state
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

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return "-";
    const time = new Date(timeString);
    if (isNaN(time.getTime())) return "-";
    return time.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch all reports with filters
  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      // Add filters to params
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      const res = await axios.get(`/api/master/reports?${params}`, axiosConfig);

      setReports(res.data.data);
      setPagination({
        ...pagination,
        page: res.data.pagination.page,
        total: res.data.pagination.total,
        totalPages: res.data.pagination.totalPages,
      });
    } catch (err) {
      console.error("Error fetching reports:", err);
      Swal.fire("Error!", "Gagal mengambil data laporan", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch helper data
  const fetchHelperData = async () => {
    try {
      const classroomsRes = await axios.get(
        "/api/superadmin/masterdata/classrooms",
        axiosConfig
      );
      setClassrooms(classroomsRes.data.data || []);
    } catch (err) {
      console.error("Error fetching helper data:", err);
    }
  };

  useEffect(() => {
    fetchHelperData();
    fetchReports(1);
  }, []);

  useEffect(() => {
    fetchReports(1);
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // View detail
  const viewDetail = (report) => {
    navigate(`/reports/detail/${report.id}`);
  };

  // Handle delete report
  const handleDelete = async (report) => {
    const result = await Swal.fire({
      title: "Hapus Laporan?",
      text: `Yakin ingin menghapus laporan ${
        report.item?.tipe === "pelanggaran" ? "pelanggaran" : "prestasi"
      } untuk ${report.student.nama}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(
          `/api/master/reports/report/${report.id}`,
          axiosConfig
        );
        Swal.fire("Terhapus!", "Laporan berhasil dihapus", "success");
        fetchReports(pagination.page);
      } catch (err) {
        console.error("Error deleting report:", err);
        const message = err.response?.data?.error || "Gagal menghapus laporan";
        Swal.fire("Error!", message, "error");
      }
    }
  };

  // Export data
  const handleExport = () => {
    Swal.fire("Info", "Fitur export akan segera tersedia", "info");
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#003366] flex items-center gap-3">
          <FiFileText className="text-blue-600" />
          Laporan Siswa
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiDownload /> Export
          </button>
          <button
            onClick={() => navigate("/reports/add")}
            className="bg-[#003366] hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiPlus /> Tambah Laporan
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="search"
              placeholder="Cari nama siswa..."
              value={filters.search}
              onChange={handleFilterChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            name="classroomId"
            value={filters.classroomId}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Kelas</option>
            {classrooms.map((kelas) => (
              <option key={kelas.id} value={kelas.id}>
                {kelas.namaKelas}
              </option>
            ))}
          </select>

          <select
            name="tipe"
            value={filters.tipe}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Semua Tipe</option>
            <option value="pelanggaran">Pelanggaran</option>
            <option value="prestasi">Prestasi</option>
          </select>

          <button
            onClick={() => fetchReports(1)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Mulai
            </label>
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Akhir
            </label>
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#003366] text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Siswa</th>
                <th className="px-6 py-4 text-left font-semibold">Tipe</th>
                <th className="px-6 py-4 text-left font-semibold">
                  Pelanggaran/Prestasi
                </th>
                <th className="px-6 py-4 text-left font-semibold">Tanggal</th>
                <th className="px-6 py-4 text-left font-semibold">Poin</th>
                <th className="px-6 py-4 text-left font-semibold">Pelapor</th>
                <th className="px-6 py-4 text-left font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {report.student?.nama}
                        </p>
                        <p className="text-sm text-gray-600">
                          {report.student?.kelas} • {report.student?.nisn}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          report.item?.tipe === "pelanggaran"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {report.item?.tipe === "pelanggaran" ? (
                          <FiAlertTriangle className="mr-1" />
                        ) : (
                          <FiAward className="mr-1" />
                        )}
                        {report.item?.tipe === "pelanggaran"
                          ? "Pelanggaran"
                          : "Prestasi"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {report.item?.nama}
                        </p>
                        <p className="text-sm text-gray-600">
                          {report.item?.kategori}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900">
                          {formatDateForDisplay(report.tanggal)}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatTimeForDisplay(report.waktu)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                          report.item?.tipe === "pelanggaran"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {report.item?.tipe === "pelanggaran" ? "-" : "+"}
                        {report.pointSaat}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900">{report.reporter}</p>
                        <p className="text-sm text-gray-600 capitalize">
                          {report.reporterRole}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => viewDetail(report)}
                          className="bg-blue-100 text-blue-700 p-2 rounded hover:bg-blue-200 transition-colors"
                          title="Lihat Detail"
                        >
                          <FiEye size={16} />
                        </button>
                        <button
                          onClick={() => navigate(`/reports/edit/${report.id}`)}
                          className="bg-yellow-100 text-yellow-700 p-2 rounded hover:bg-yellow-200 transition-colors"
                          title="Edit"
                        >
                          <FiEdit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(report)}
                          className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200 transition-colors"
                          title="Hapus"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center">
                      <FiFileText className="text-4xl text-gray-300 mb-2" />
                      <p>Tidak ada data laporan</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              dari {pagination.total} data
            </div>
            <div className="flex gap-2">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchReports(page)}
                  className={`px-3 py-1 rounded ${
                    page === pagination.page
                      ? "bg-[#003366] text-white"
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
  );
};

export default LaporanPelanggaran;
