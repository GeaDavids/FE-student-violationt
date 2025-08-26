import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  FiX,
  FiUser,
  FiUpload,
  FiImage,
} from "react-icons/fi";

import {
  getAllReports,
  createReport,
  getAllStudents,
  getViolations,
  getAchievements,
  deleteReport,
} from "../../api/reports";
import { getAllClassrooms } from "../../api/classroom";

const LaporanPelanggaran = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // --- TambahLaporan-style form state ---
  const [students, setStudents] = useState([]);
  const [violations, setViolations] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [form, setForm] = useState({
    studentId: "",
    tipe: "pelanggaran",
    itemId: "",
    tanggal: new Date().toISOString().split("T")[0],
    waktu: "",
    deskripsi: "",
    bukti: "",
  });
  const [evidenceForm, setEvidenceForm] = useState({
    file: null,
    tipe: "image",
  });
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const fileInputRef = useRef();

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

  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  // Fetch students, violations, achievements, classrooms
  const fetchHelperData = async () => {
    try {
      setFormLoading(true);
      const [studentsRes, violationsRes, achievementsRes, classroomsRes] =
        await Promise.all([
          getAllStudents({ limit: 1000 }),
          getViolations(),
          getAchievements(),
          getAllClassrooms(),
        ]);
      setStudents(studentsRes.data || []);
      setViolations(violationsRes || []);
      setAchievements(achievementsRes || []);
      setClassrooms(classroomsRes.data || []);
    } catch (error) {
      console.error("Error fetching helper data:", error);
    } finally {
      setFormLoading(false);
    }
  };

  // --- Student search logic ---
  const handleStudentSearch = (e) => {
    const value = e.target.value;
    setStudentSearch(value);
    if (value.trim() === "") {
      setFilteredStudents([]);
      setShowStudentDropdown(false);
      return;
    }
    const filtered = students.filter(
      (student) =>
        student.nama.toLowerCase().includes(value.toLowerCase()) ||
        student.nisn.toLowerCase().includes(value.toLowerCase()) ||
        (student.kelas?.toLowerCase?.() || "").includes(value.toLowerCase())
    );
    setFilteredStudents(filtered);
    setShowStudentDropdown(true);
  };
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setStudentSearch(
      `${student.nama} - ${student.kelas?.namaKelas || ""} (${student.nisn})`
    );
    setForm((prev) => ({ ...prev, studentId: student.id.toString() }));
    setShowStudentDropdown(false);
  };
  const clearStudentSelection = () => {
    setSelectedStudent(null);
    setStudentSearch("");
    setForm((prev) => ({ ...prev, studentId: "" }));
    setShowStudentDropdown(false);
  };

  // --- Evidence logic ---
  const handleEvidenceFormChange = (e) => {
    const { name, value } = e.target;
    setEvidenceForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        Swal.fire("Error!", "Hanya file gambar yang diperbolehkan", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire("Error!", "Ukuran file maksimal 5MB", "error");
        return;
      }
      setEvidenceForm((prev) => ({ ...prev, file }));
    }
  };
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "bukti");
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );
      if (!response.ok) throw new Error("Upload failed");
      const result = await response.json();
      return result.filePath;
    } catch (error) {
      throw error;
    }
  };
  const addEvidence = async () => {
    if (!evidenceForm.file) {
      Swal.fire("Error!", "Silakan pilih file gambar terlebih dahulu", "error");
      return;
    }
    try {
      setUploadLoading(true);
      const filePath = await uploadFile(evidenceForm.file);
      setForm((prev) => ({
        ...prev,
        bukti: filePath,
      }));
      setEvidenceForm({ file: null, tipe: "image" });
      if (fileInputRef.current) fileInputRef.current.value = "";
      Swal.fire("Berhasil!", "File berhasil diupload", "success");
    } catch (error) {
      console.error("Error uploading file:", error);
      Swal.fire("Error!", "Gagal mengupload file", "error");
    } finally {
      setUploadLoading(false);
    }
  };
  const removeEvidence = () => {
    setForm((prev) => ({
      ...prev,
      bukti: "",
    }));
  };

  // --- Form change logic ---
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // --- Get current items (pelanggaran/prestasi) ---
  const getCurrentItems = () => {
    return form.tipe === "pelanggaran" ? violations : achievements;
  };

  // --- Submit logic ---
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!selectedStudent) {
      Swal.fire("Error!", "Silakan pilih siswa terlebih dahulu", "error");
      return;
    }
    if (!form.itemId) {
      Swal.fire("Error!", "Silakan pilih item pelanggaran/prestasi", "error");
      return;
    }
    try {
      setFormLoading(true);
      const reportData = {
        studentId: parseInt(form.studentId),
        itemId: parseInt(form.itemId),
        tanggal: form.tanggal,
        waktu: form.waktu || null,
        deskripsi: form.deskripsi || null,
        bukti: form.bukti || null,
      };
      await createReport(reportData);
      Swal.fire("Berhasil!", "Laporan berhasil ditambahkan", "success");
      setShowAddModal(false);
      setForm({
        studentId: "",
        tipe: "pelanggaran",
        itemId: "",
        tanggal: new Date().toISOString().split("T")[0],
        waktu: "",
        deskripsi: "",
        bukti: "",
      });
      setSelectedStudent(null);
      setStudentSearch("");
      setShowStudentDropdown(false);
      fetchReports(pagination.page);
    } catch (error) {
      console.error("Error creating report:", error);
      const message = error.response?.data?.error || "Gagal membuat laporan";
      Swal.fire("Error!", message, "error");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowAddModal(false);
    setForm({
      studentId: "",
      tipe: "pelanggaran",
      itemId: "",
      tanggal: new Date().toISOString().split("T")[0],
      waktu: "",
      deskripsi: "",
      bukti: "",
    });
    setSelectedStudent(null);
    setStudentSearch("");
    setShowStudentDropdown(false);
    setEvidenceForm({ file: null, tipe: "image" });
  };

  // Handle backdrop click
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  // Fetch all reports with filters
  const fetchReports = async (page = 1) => {
    try {
      setLoading(true);
      const params = {
        page: page.toString(),
        limit: pagination.limit.toString(),
        ...filters,
      };
      // Remove empty filters and classroomId if empty (for 'Semua Kelas')
      Object.keys(params).forEach((key) => {
        if (!params[key] || (key === "classroomId" && params[key] === "")) {
          delete params[key];
        }
      });
      const response = await getAllReports(params);
      setReports(response.data || []);
      setPagination({
        ...pagination,
        page: response.pagination?.page || page,
        total: response.pagination?.total || 0,
        totalPages: response.pagination?.totalPages || 1,
      });
    } catch (err) {
      console.error("Error fetching reports:", err);
      Swal.fire("Error!", "Gagal mengambil data laporan", "error");
    } finally {
      setLoading(false);
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
        await deleteReport(report.id);
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
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
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
            onClick={() => {
              setShowAddModal(true);
              fetchHelperData();
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
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
            <thead
              className="text-gray-700"
              style={{ backgroundColor: "oklch(96.7% 0.003 264.542)" }}
            >
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Siswa
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Tipe
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Pelanggaran/Prestasi
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Tanggal
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Poin
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide">
                  Pelapor
                </th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {reports.length > 0 ? (
                reports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {report.student?.nama}
                        </p>
                        <p className="text-xs text-gray-600">
                          {report.student?.kelas} • {report.student?.nisn}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          report.item?.tipe === "pelanggaran"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {report.item?.tipe === "pelanggaran" ? (
                          <FiAlertTriangle className="mr-1 w-3 h-3" />
                        ) : (
                          <FiAward className="mr-1 w-3 h-3" />
                        )}
                        {report.item?.tipe === "pelanggaran"
                          ? "Pelanggaran"
                          : "Prestasi"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">
                          {report.item?.nama}
                        </p>
                        <p className="text-xs text-gray-600">
                          {report.item?.kategori}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-900 text-sm">
                          {formatDateForDisplay(report.tanggal)}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatTimeForDisplay(report.waktu)}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${
                          report.item?.tipe === "pelanggaran"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {report.item?.tipe === "pelanggaran" ? "-" : "+"}
                        {report.pointSaat}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-gray-900 text-sm">
                          {report.reporter}
                        </p>
                        <p className="text-xs text-gray-600 capitalize">
                          {report.reporterRole}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          onClick={() => viewDetail(report)}
                          className="bg-blue-100 text-blue-700 p-1.5 rounded hover:bg-blue-200 transition-colors"
                          title="Lihat Detail"
                        >
                          <FiEye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => navigate(`/reports/edit/${report.id}`)}
                          className="bg-yellow-100 text-yellow-700 p-1.5 rounded hover:bg-yellow-200 transition-colors"
                          title="Edit"
                        >
                          <FiEdit3 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDelete(report)}
                          className="bg-red-100 text-red-700 p-1.5 rounded hover:bg-red-200 transition-colors"
                          title="Hapus"
                        >
                          <FiTrash2 className="w-3 h-3" />
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
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
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

      {/* Modal Tambah Laporan */}
      {showAddModal && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleBackdropClick}
        >
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                  <FiFileText className="text-blue-600" />
                  Tambah Laporan Baru
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>
            {/* Form Content */}
            <form onSubmit={handleSubmitForm} className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Student Search */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pilih Siswa <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={handleStudentSearch}
                      placeholder="Cari siswa berdasarkan nama, NISN, atau kelas..."
                      required={!selectedStudent}
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    {selectedStudent && (
                      <button
                        type="button"
                        onClick={clearStudentSelection}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <FiX />
                      </button>
                    )}
                    {showStudentDropdown && filteredStudents.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                        {filteredStudents.map((student) => (
                          <button
                            key={student.id}
                            type="button"
                            onClick={() => handleSelectStudent(student)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                          >
                            <div>
                              <p className="font-medium text-gray-900">
                                {student.nama}
                              </p>
                              <p className="text-sm text-gray-600">
                                {student.kelas?.namaKelas ||
                                  student.kelas ||
                                  ""}{" "}
                                • NISN: {student.nisn}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                {/* Report Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Laporan <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tipe"
                    value={form.tipe}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="pelanggaran">🚫 Pelanggaran</option>
                    <option value="prestasi">🏆 Prestasi</option>
                  </select>
                </div>
              </div>
              {/* Item Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {form.tipe === "pelanggaran"
                    ? "Jenis Pelanggaran *"
                    : "Jenis Prestasi *"}
                </label>
                <select
                  name="itemId"
                  value={form.itemId}
                  onChange={handleFormChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">
                    Pilih{" "}
                    {form.tipe === "pelanggaran" ? "Pelanggaran" : "Prestasi"}
                  </option>
                  {getCurrentItems().length > 0 ? (
                    getCurrentItems().map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.nama} ({item.point} poin) - {item.kategori?.nama}
                      </option>
                    ))
                  ) : (
                    <option disabled>
                      Tidak ada data{" "}
                      {form.tipe === "pelanggaran" ? "pelanggaran" : "prestasi"}
                    </option>
                  )}
                </select>
              </div>
              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal *
                  </label>
                  <input
                    type="date"
                    name="tanggal"
                    value={form.tanggal}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Waktu (Opsional)
                  </label>
                  <input
                    type="time"
                    name="waktu"
                    value={form.waktu}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi Detail (Opsional)
                </label>
                <textarea
                  name="deskripsi"
                  value={form.deskripsi}
                  onChange={handleFormChange}
                  rows="4"
                  placeholder="Jelaskan detail kejadian, kondisi, atau informasi tambahan..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {/* Evidence */}
              <div className="border border-gray-200 rounded-lg p-4 mb-4 mt-4">
                <h4 className="font-medium text-gray-900 mb-3">
                  Upload Bukti Gambar
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <div className="flex items-center justify-center w-full">
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <FiUpload className="w-8 h-8 mb-4 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">
                              Klik untuk upload
                            </span>{" "}
                            atau drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, JPEG (MAX. 5MB)
                          </p>
                          {evidenceForm.file && (
                            <p className="text-xs text-blue-600 mt-2">
                              Dipilih: {evidenceForm.file.name}
                            </p>
                          )}
                        </div>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFileChange}
                          ref={fileInputRef}
                        />
                      </label>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <select
                      name="tipe"
                      value={evidenceForm.tipe}
                      onChange={handleEvidenceFormChange}
                      className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="image">Gambar</option>
                      <option value="document">Dokumen</option>
                      <option value="video">Video</option>
                      <option value="other">Lainnya</option>
                    </select>
                    <button
                      type="button"
                      onClick={addEvidence}
                      disabled={
                        !evidenceForm.file || uploadLoading || form.bukti
                      }
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1"
                    >
                      {uploadLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Upload...
                        </>
                      ) : (
                        <>
                          <FiPlus size={16} />
                          Tambah
                        </>
                      )}
                    </button>
                  </div>
                </div>
                {/* Evidence Preview */}
                {form.bukti && (
                  <div className="space-y-2 mt-4">
                    <h4 className="font-medium text-gray-900">Bukti:</h4>
                    <div className="relative border border-gray-200 rounded-lg p-3 bg-gray-50 w-48">
                      <div className="aspect-square mb-2 bg-gray-100 rounded-lg overflow-hidden">
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}${
                            form.bukti
                          }`}
                          alt="Bukti"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='0.3em'%3EGambar tidak dapat dimuat%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={removeEvidence}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
              {/* Modal Footer */}
              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200 rounded-b-xl flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  disabled={formLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {formLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <FiPlus size={16} />
                      Simpan Laporan
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaporanPelanggaran;
