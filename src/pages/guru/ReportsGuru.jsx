import API from "../../api/api";
import Swal from "sweetalert2";

import { useState, useEffect } from "react";
import {
  FiPlus,
  FiFilter,
  FiSearch,
  FiEye,
  FiCalendar,
  FiUser,
  FiFileText,
  FiAlertTriangle,
  FiAward,
  FiRefreshCw,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import AcademicYearSelector from "../../components/AcademicYearSelector";
import teacherAPI from "../../api/teacher";

const ReportsGuru = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({});
  const [summary, setSummary] = useState({
    totalReports: 0,
    violationReports: 0,
    achievementReports: 0,
  });

  const [detailModal, setDetailModal] = useState({
    open: false,
    data: null,
    loading: false,
  });
  // Fungsi ambil detail laporan

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [itemSearchTerm, setItemSearchTerm] = useState("");
  const [itemSearchResults, setItemSearchResults] = useState([]);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    tipe: "",
    bulan: "",
    studentId: "",
    tahunAjaranId: "",
  });

  // Create Report State
  const [formData, setFormData] = useState({
    studentId: "",
    itemId: "",
    tanggal: new Date().toISOString().split("T")[0],
    waktu: "",
    deskripsi: "",
    bukti: "",
  });

  const [students, setStudents] = useState([]);
  const [reportItems, setReportItems] = useState({
    pelanggaran: [],
    prestasi: [],
  });
  const [reportType, setReportType] = useState("pelanggaran");
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    fetchReports();
  }, [filters]);

  useEffect(() => {
    fetchReportItems();
  }, []);

  // Update filters when academic year changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      tahunAjaranId: selectedAcademicYear || "",
      page: 1,
    }));
  }, [selectedAcademicYear]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // Gunakan teacherAPI.getMyReports, params: userId, tahunAjaranId, tipe, bulan, page, limit
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;
      if (!userId) {
        alert(
          "Akun Anda tidak memiliki userId. Silakan logout dan login kembali, atau hubungi admin."
        );
        setLoading(false);
        setReports([]);
        setPagination({});
        setSummary({
          totalReports: 0,
          violationReports: 0,
          achievementReports: 0,
        });
        return;
      }
      const params = { ...filters, userId };
      // Hapus key kosong
      Object.keys(params).forEach(
        (k) => (params[k] === "" || params[k] == null) && delete params[k]
      );
      const response = await teacherAPI.getMyReports(params);
      const data = response.data.data || [];
      setReports(data);
      setPagination(response.data.pagination || {});
      // Hitung summary berdasarkan data yang sudah terfilter
      const totalReports = data.length;
      const violationReports = data.filter(
        (r) => r.tipe === "pelanggaran"
      ).length;
      const achievementReports = data.filter(
        (r) => r.tipe === "prestasi"
      ).length;
      setSummary({ totalReports, violationReports, achievementReports });
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReportDetail = async (id) => {
    setDetailModal({ open: true, data: null, loading: true });
    try {
      const response = await API.get(`/guru/report-detail/${id}`, axiosConfig);
      setDetailModal({ open: true, data: response.data.data, loading: false });
    } catch (error) {
      setDetailModal({ open: false, data: null, loading: false });
      Swal.fire(
        "Gagal memuat detail laporan",
        error?.response?.data?.message || error.message,
        "error"
      );
    }
  };

  const fetchReportItems = async () => {
    try {
      const response = await API.get("/guru/report-items", axiosConfig);
      setReportItems({
        pelanggaran: response.data.data.pelanggaran || [],
        prestasi: response.data.data.prestasi || [],
      });
    } catch (error) {
      console.error("Error fetching report items:", error);
    }
  };

  const searchReportItems = async (query, type) => {
    try {
      if (!query || query.length < 2) {
        setItemSearchResults([]);
        return;
      }
      const response = await API.get(
        `/guru/search-report-items?query=${encodeURIComponent(
          query
        )}&type=${type}`,
        axiosConfig
      );
      setItemSearchResults(response.data.data);
    } catch (error) {
      setItemSearchResults([]);
    }
  };

  const searchStudents = async (query) => {
    try {
      if (!query || query.length < 2) {
        setStudents([]);
        return;
      }
      const response = await API.get(
        `/guru/search-students?query=${encodeURIComponent(query)}`,
        axiosConfig
      );
      setStudents(response.data.data);
    } catch (error) {
      console.error("Error searching students:", error);
    }
  };

  const handleCreateReport = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const data = new FormData();
      data.append("studentId", formData.studentId);
      data.append("itemId", formData.itemId);
      data.append("tanggal", formData.tanggal);
      data.append("waktu", formData.waktu);
      data.append("deskripsi", formData.deskripsi);
      if (formData.bukti) {
        data.append("bukti", formData.bukti);
      }
      await API.post("/guru/report-student", data, {
        headers: {
          Authorization: `Bearer ${token}`,
          // Jangan set Content-Type, biarkan browser yang mengatur
        },
      });

      // Reset form and close modal
      setFormData({
        studentId: "",
        itemId: "",
        tanggal: new Date().toISOString().split("T")[0],
        waktu: "",
        deskripsi: "",
        bukti: "",
      });
      setShowCreateForm(false);
      setSearchTerm("");
      setStudents([]);

      // Refresh reports
      fetchReports();
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Laporan berhasil dibuat!",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Error creating report:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          "Gagal membuat laporan: " +
          (error.response?.data?.error || error.message),
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filtering
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const getTipeColor = (tipe) => {
    if (tipe === "pelanggaran") return "text-red-600 bg-red-100";
    if (tipe === "prestasi") return "text-green-600 bg-green-100";
    return "text-gray-600 bg-gray-100";
  };

  const getTipeIcon = (tipe) => {
    if (tipe === "pelanggaran") return <FiAlertTriangle />;
    if (tipe === "prestasi") return <FiAward />;
    return <FiFileText />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#003366]">Laporan Saya</h2>
          <p className="text-gray-600">
            Kelola laporan pelanggaran dan prestasi siswa
          </p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="bg-[#003366] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#002244] transition-colors"
        >
          <FiPlus /> Buat Laporan
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Laporan</p>
              <p className="text-2xl font-bold text-[#003366]">
                {summary.totalReports || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiFileText className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pelanggaran</p>
              <p className="text-2xl font-bold text-red-600">
                {summary.violationReports || 0}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <FiAlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Prestasi</p>
              <p className="text-2xl font-bold text-green-600">
                {summary.achievementReports || 0}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <FiAward className="text-green-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
          <FiFilter /> Filter Laporan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tahun Ajaran
            </label>
            <AcademicYearSelector
              value={selectedAcademicYear}
              onChange={setSelectedAcademicYear}
              placeholder="Pilih Tahun Ajaran"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe
            </label>
            <select
              value={filters.tipe}
              onChange={(e) => handleFilterChange("tipe", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            >
              <option value="">Semua</option>
              <option value="pelanggaran">Pelanggaran</option>
              <option value="prestasi">Prestasi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bulan
            </label>
            <select
              value={filters.bulan}
              onChange={(e) => handleFilterChange("bulan", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            >
              <option value="">Semua</option>
              {[...Array(12)].map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setFilters((f) => ({ ...f, page: 1 }));
                setTimeout(fetchReports, 0);
              }}
              className="w-full bg-[#003366] text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-[#002244] transition-colors"
            >
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-[#003366] mb-4">
            Daftar Laporan
          </h3>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto"></div>
              <p className="mt-2 text-gray-500">Memuat laporan...</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipe
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Siswa
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Poin
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deskripsi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {reports.map((report) => (
                      <tr
                        key={report.id}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => fetchReportDetail(report.id)}
                      >
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTipeColor(
                              report.tipe
                            )}`}
                          >
                            {getTipeIcon(report.tipe)}
                            {report.tipe === "pelanggaran"
                              ? "Pelanggaran"
                              : report.tipe === "prestasi"
                              ? "Prestasi"
                              : "-"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {report.namaSiswa || "-"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {report.classAtTime || "-"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {report.itemNama || "-"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {report.kategori || "-"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {report.tipe === "pelanggaran" ? (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                              -{report.pointSaat}
                            </span>
                          ) : report.tipe === "prestasi" ? (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                              +{report.pointSaat}
                            </span>
                          ) : (
                            <span className="inline-flex px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                              {report.pointSaat}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(report.tanggal)}
                        </td>
                        <td className="px-4 py-4">
                          <p className="text-sm text-gray-900 max-w-xs truncate">
                            {report.deskripsi || "-"}
                          </p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {reports.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada laporan ditemukan
                </div>
              )}
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t">
                  <div className="text-sm text-gray-700">
                    Menampilkan {(pagination.page - 1) * pagination.limit + 1}{" "}
                    sampai{" "}
                    {Math.min(
                      pagination.page * pagination.limit,
                      pagination.total
                    )}{" "}
                    dari {pagination.total} hasil
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                      className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <FiChevronLeft />
                    </button>
                    <span className="px-3 py-1 text-sm">
                      {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.totalPages}
                      className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                    >
                      <FiChevronRight />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal Detail Laporan (hanya satu, di luar map/table) */}
      {detailModal.open && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6 relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
              onClick={() =>
                setDetailModal({ open: false, data: null, loading: false })
              }
              type="button"
            >
              ×
            </button>
            {detailModal.loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto"></div>
                <p className="mt-2 text-gray-500">Memuat detail laporan...</p>
              </div>
            ) : detailModal.data ? (
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`rounded-full p-2 text-white ${
                      detailModal.data.tipe === "pelanggaran"
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  >
                    {detailModal.data.tipe === "pelanggaran" ? (
                      <FiAlertTriangle size={22} />
                    ) : (
                      <FiAward size={22} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#003366] leading-tight">
                      {detailModal.data.tipe === "pelanggaran"
                        ? "Pelanggaran"
                        : "Prestasi"}
                    </h3>
                    <div className="text-sm text-gray-500">
                      {formatDate(detailModal.data.tanggal)}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
                  <div>
                    <span className="font-semibold text-gray-700">
                      Nama Siswa:
                    </span>{" "}
                    <span className="text-gray-900">
                      {detailModal.data.namaSiswa}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">NISN:</span>{" "}
                    <span className="text-gray-900">
                      {detailModal.data.nisn}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Kelas:</span>{" "}
                    <span className="text-gray-900">
                      {detailModal.data.classAtTime}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      Kategori:
                    </span>{" "}
                    <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold">
                      {detailModal.data.kategori}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Item:</span>{" "}
                    <span className="text-gray-900">
                      {detailModal.data.itemNama}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Poin:</span>{" "}
                    <span
                      className={`font-bold ${
                        detailModal.data.tipe === "pelanggaran"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {detailModal.data.tipe === "pelanggaran"
                        ? `-${detailModal.data.pointSaat}`
                        : `+${detailModal.data.pointSaat}`}
                    </span>
                  </div>
                </div>
                <hr className="my-3" />
                <div className="mb-3">
                  <span className="font-semibold text-gray-700">
                    Deskripsi:
                  </span>
                  <div className="bg-gray-50 rounded p-2 mt-1 text-gray-800 min-h-[40px]">
                    {detailModal.data.deskripsi || (
                      <span className="italic text-gray-400">
                        Tidak ada deskripsi
                      </span>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <span className="font-semibold text-gray-700">Bukti:</span>
                  <div className="mt-2">
                    {detailModal.data.bukti ? (
                      <div className="flex items-center gap-4">
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}${
                            detailModal.data.bukti
                          }`}
                          alt="Bukti"
                          className="w-28 h-28 object-cover border rounded-lg shadow-md bg-white"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "/no-image.png";
                          }}
                        />
                        <a
                          href={`${import.meta.env.VITE_API_BASE_URL}${
                            detailModal.data.bukti
                          }`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline text-sm hover:text-blue-800"
                        >
                          Lihat Bukti
                        </a>
                      </div>
                    ) : (
                      <span className="italic text-gray-400">
                        Tidak ada bukti
                      </span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mt-4">
                  <div>
                    <span className="font-semibold">Dibuat:</span>{" "}
                    {formatDate(detailModal.data.createdAt)}
                  </div>
                  <div>
                    <span className="font-semibold">Diupdate:</span>{" "}
                    {formatDate(detailModal.data.updatedAt)}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-[#003366]">
                  Buat Laporan Baru
                </h3>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreateReport} className="space-y-4">
                {/* Student Search ala laporanPelanggaran */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cari Siswa
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      if (e.target.value.length >= 2) {
                        searchStudents(e.target.value);
                      }
                    }}
                    placeholder="Masukkan nama atau NISN siswa..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                  {students.length > 0 && (
                    <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                      {students.map((student) => (
                        <button
                          key={student.id}
                          type="button"
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              studentId: student.id,
                            }));
                            setSearchTerm(`${student.name} (${student.nisn})`);
                            setStudents([]);
                          }}
                          className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                        >
                          <p className="font-medium">{student.name}</p>
                          <p className="text-sm text-gray-500">
                            {student.nisn} • {student.kodeKelas}{" "}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Report Type & Item Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Laporan
                  </label>
                  <div className="flex gap-4 mb-2">
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                        reportType === "pelanggaran"
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                      onClick={() => {
                        setReportType("pelanggaran");
                        setFormData((prev) => ({ ...prev, itemId: "" }));
                      }}
                    >
                      Pelanggaran
                    </button>
                    <button
                      type="button"
                      className={`px-4 py-2 rounded-lg border text-sm font-medium ${
                        reportType === "prestasi"
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-white text-gray-700 border-gray-300"
                      }`}
                      onClick={() => {
                        setReportType("prestasi");
                        setFormData((prev) => ({ ...prev, itemId: "" }));
                      }}
                    >
                      Prestasi
                    </button>
                  </div>
                  {/* Kategori dan item berdasarkan reportItems */}
                  <input
                    type="text"
                    value={itemSearchTerm}
                    onChange={(e) => {
                      setItemSearchTerm(e.target.value);
                      searchReportItems(e.target.value, reportType);
                    }}
                    placeholder={`Cari bentuk ${reportType} atau kategori...`}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent mb-2"
                  />
                  {itemSearchTerm.length >= 2 &&
                    itemSearchResults.length > 0 && (
                      <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto mb-2 bg-white z-10 relative">
                        {itemSearchResults.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                itemId: item.id,
                              }));
                              setItemSearchTerm(item.label);
                              setItemSearchResults([]);
                            }}
                            className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <span className="font-medium">{item.label}</span>
                          </button>
                        ))}
                      </div>
                    )}

                  {/* Score Impact Indicator */}
                  {formData.itemId &&
                    (() => {
                      let point = 0;
                      let tipe = reportType;
                      const found = itemSearchResults.find(
                        (i) => i.id === parseInt(formData.itemId)
                      );
                      if (found) {
                        point = found.point;
                        tipe = found.tipe;
                      }
                      return (
                        <div
                          className={`mt-2 p-2 rounded-lg text-sm ${
                            tipe === "pelanggaran"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : "bg-green-50 text-green-700 border border-green-200"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {tipe === "pelanggaran" ? (
                              <>
                                <span className="font-semibold">
                                  ⚠️ Dampak:
                                </span>
                                <span>
                                  Skor siswa akan <strong>dikurangi</strong>{" "}
                                  {point} poin
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="font-semibold">
                                  ✅ Dampak:
                                </span>
                                <span>
                                  Skor siswa akan <strong>ditambah</strong>{" "}
                                  {point} poin
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal
                    </label>
                    <input
                      type="date"
                      value={formData.tanggal}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tanggal: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Waktu (Opsional)
                    </label>
                    <input
                      type="time"
                      value={formData.waktu}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          waktu: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deskripsi
                  </label>
                  <textarea
                    value={formData.deskripsi}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        deskripsi: e.target.value,
                      }))
                    }
                    rows={3}
                    placeholder="Jelaskan detail kejadian..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
                </div>

                {/* Evidence ala laporanPelanggaran */}
                <div className="border border-gray-200 rounded-lg p-4 mb-4 mt-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Upload Bukti Gambar
                  </h4>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <FiPlus className="w-8 h-8 mb-4 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">
                            Klik untuk upload
                          </span>{" "}
                          atau drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, JPEG (MAX. 5MB)
                        </p>
                        {formData.bukti && (
                          <p className="text-xs text-blue-600 mt-2">
                            Dipilih: {formData.bukti.name || formData.bukti}
                          </p>
                        )}
                      </div>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          setFormData((prev) => ({ ...prev, bukti: file }));
                        }}
                      />
                    </label>
                    {formData.bukti && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, bukti: null }))
                        }
                        className="ml-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                      >
                        <FiPlus size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || !formData.studentId}
                    className="px-4 py-2 bg-[#003366] text-white rounded-lg hover:bg-[#002244] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {submitting ? "Menyimpan..." : "Simpan Laporan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsGuru;
