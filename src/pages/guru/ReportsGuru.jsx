import { useState, useEffect } from "react";
import axios from "axios";
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
  const [summary, setSummary] = useState({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(null);
  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    tipe: "",
    startDate: "",
    endDate: "",
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
  const [violations, setViolations] = useState([]);
  const [achievements, setAchievements] = useState([]);
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
    fetchViolations();
    fetchAchievements();
  }, []);

  // Update filters when academic year changes
  useEffect(() => {
    if (selectedAcademicYear) {
      setFilters((prev) => ({
        ...prev,
        tahunAjaranId: selectedAcademicYear,
        page: 1,
      }));
    }
  }, [selectedAcademicYear]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      // Use academic year specific endpoint if academic year is selected
      const endpoint = filters.tahunAjaranId
        ? `/api/guru/reports-by-academic-year?${params.toString()}`
        : `/api/guru/my-reports?${params.toString()}`;

      const response = await axios.get(endpoint, axiosConfig);

      setReports(response.data.data);
      setPagination(response.data.pagination);
      setSummary(response.data.summary);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchViolations = async () => {
    try {
      const response = await axios.get("/api/guru/violations", axiosConfig);
      setViolations(response.data.violations);
    } catch (error) {
      console.error("Error fetching violations:", error);
    }
  };

  const fetchAchievements = async () => {
    try {
      const response = await axios.get("/api/guru/achievements", axiosConfig);
      setAchievements(response.data.achievements);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    }
  };

  const searchStudents = async (query) => {
    try {
      const response = await axios.get(
        `/api/guru/search-students?query=${query}&limit=20`,
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
      await axios.post("/api/guru/report-student", formData, axiosConfig);

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
      alert("Laporan berhasil dibuat!");
    } catch (error) {
      console.error("Error creating report:", error);
      alert(
        "Gagal membuat laporan: " +
          (error.response?.data?.error || error.message)
      );
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
              <option value="violation">Pelanggaran</option>
              <option value="achievement">Prestasi</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dari Tanggal
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => handleFilterChange("startDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sampai Tanggal
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => handleFilterChange("endDate", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={fetchReports}
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
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-4 py-4 whitespace-nowrap">
                          {(() => {
                            // Prefer report.tipe, fallback to item.kategori.tipe, fallback to item.tipe
                            const tipe =
                              report.tipe ||
                              report.item?.kategori?.tipe ||
                              report.item?.tipe;
                            return (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getTipeColor(
                                  tipe
                                )}`}
                              >
                                {getTipeIcon(tipe)}
                                {tipe === "pelanggaran"
                                  ? "Pelanggaran"
                                  : tipe === "prestasi"
                                  ? "Prestasi"
                                  : "-"}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {report.student.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {report.student.nisn} • {report.student.className}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {report.item?.nama}
                            </p>
                            <p className="text-sm text-gray-500">
                              {report.item?.kategori?.nama || "-"}
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {(() => {
                            const tipe =
                              report.tipe ||
                              report.item?.kategori?.tipe ||
                              report.item?.tipe;
                            if (tipe === "pelanggaran") {
                              return (
                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                                  -{report.pointSaat}
                                </span>
                              );
                            } else if (tipe === "prestasi") {
                              return (
                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                                  +{report.pointSaat}
                                </span>
                              );
                            } else {
                              return (
                                <span className="inline-flex px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                                  {report.pointSaat}
                                </span>
                              );
                            }
                          })()}
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

      {/* Create Report Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
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
                {/* Student Search */}
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
                            {student.nisn} • {student.className}
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
                  <select
                    value={formData.itemId}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        itemId: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                    required
                  >
                    <option value="">
                      Pilih{" "}
                      {reportType === "pelanggaran"
                        ? "pelanggaran"
                        : "prestasi"}
                    </option>
                    {(reportType === "pelanggaran"
                      ? violations
                      : achievements
                    ).map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nama} ({reportType === "pelanggaran" ? "-" : "+"}
                        {item.point} poin)
                      </option>
                    ))}
                  </select>

                  {/* Score Impact Indicator */}
                  {formData.itemId && (
                    <div
                      className={`mt-2 p-2 rounded-lg text-sm ${
                        reportType === "pelanggaran"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-green-50 text-green-700 border border-green-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {reportType === "pelanggaran" ? (
                          <>
                            <span className="font-semibold">⚠️ Dampak:</span>
                            <span>
                              Skor siswa akan <strong>dikurangi</strong>{" "}
                              {violations.find(
                                (v) => v.id === parseInt(formData.itemId)
                              )?.point || 0}{" "}
                              poin
                            </span>
                          </>
                        ) : (
                          <>
                            <span className="font-semibold">✅ Dampak:</span>
                            <span>
                              Skor siswa akan <strong>ditambah</strong>{" "}
                              {achievements.find(
                                (a) => a.id === parseInt(formData.itemId)
                              )?.point || 0}{" "}
                              poin
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
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

                {/* Evidence */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bukti (Opsional)
                  </label>
                  <input
                    type="text"
                    value={formData.bukti}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        bukti: e.target.value,
                      }))
                    }
                    placeholder="URL foto/dokumen bukti..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
                  />
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
