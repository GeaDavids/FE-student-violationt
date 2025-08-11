import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiFileText,
  FiSearch,
  FiFilter,
  FiEye,
  FiEdit3,
  FiTrash2,
  FiPlus,
  FiCalendar,
  FiUser,
  FiAward,
  FiAlertTriangle,
  FiRefreshCw,
  FiDownload,
} from "react-icons/fi";

const LaporanPelanggaran = () => {
  const [reports, setReports] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [violations, setViolations] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState({});
  const [formVisible, setFormVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Student search state
  const [studentSearch, setStudentSearch] = useState("");
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form state
  const [form, setForm] = useState({
    studentId: "",
    tipe: "violation",
    violationId: "",
    achievementId: "",
    tanggal: "",
    waktu: "",
    deskripsi: "",
    bukti: "",
    pointSaat: "",
  });

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
      const [studentsRes, classroomsRes, violationsRes, achievementsRes] =
        await Promise.all([
          axios.get("/api/master/reports/students", axiosConfig),
          axios.get("/api/superadmin/masterdata/classrooms", axiosConfig),
          axios.get("/api/violations", axiosConfig),
          axios.get("/api/achievements", axiosConfig),
        ]);

      setStudents(studentsRes.data.data || []);
      setFilteredStudents(studentsRes.data.data || []);
      setClassrooms(classroomsRes.data.data || []);
      setViolations(violationsRes.data || []);
      setAchievements(achievementsRes.data || []);

      console.log("Violations loaded:", violationsRes.data);
      console.log("Achievements loaded:", achievementsRes.data);
    } catch (err) {
      console.error("Error fetching helper data:", err);
    }
  };

  // Handle student search
  const handleStudentSearch = (value) => {
    setStudentSearch(value);
    setShowStudentDropdown(true);

    if (!value.trim()) {
      setFilteredStudents(students);
      return;
    }

    const filtered = students.filter(
      (student) =>
        student.nama.toLowerCase().includes(value.toLowerCase()) ||
        student.nisn.includes(value) ||
        (student.kelas &&
          student.kelas.toLowerCase().includes(value.toLowerCase()))
    );
    setFilteredStudents(filtered);
  };

  // Select student from search
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setStudentSearch(`${student.nama} - ${student.kelas}`);
    setForm({ ...form, studentId: student.id.toString() });
    setShowStudentDropdown(false);
  };

  // Clear student selection
  const clearStudentSelection = () => {
    setSelectedStudent(null);
    setStudentSearch("");
    setForm({ ...form, studentId: "" });
    setFilteredStudents(students);
    setShowStudentDropdown(false);
  };

  useEffect(() => {
    fetchHelperData();
    fetchReports(1);
  }, []);

  useEffect(() => {
    fetchReports(1);
  }, [filters]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".student-search-container")) {
        setShowStudentDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Auto-fill point when violation/achievement is selected
    if (name === "violationId" && value) {
      const selectedViolation = violations.find(
        (v) => v.id === parseInt(value)
      );
      if (selectedViolation) {
        setForm({ ...form, [name]: value, pointSaat: selectedViolation.point });
      }
    }

    if (name === "achievementId" && value) {
      const selectedAchievement = achievements.find(
        (a) => a.id === parseInt(value)
      );
      if (selectedAchievement) {
        setForm({
          ...form,
          [name]: value,
          pointSaat: selectedAchievement.point,
        });
      }
    }

    // Clear related fields when type changes
    if (name === "tipe") {
      setForm({
        ...form,
        [name]: value,
        violationId: "",
        achievementId: "",
        pointSaat: "",
      });
    }
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Reset form
  const resetForm = () => {
    setForm({
      studentId: "",
      tipe: "violation",
      violationId: "",
      achievementId: "",
      tanggal: "",
      waktu: "",
      deskripsi: "",
      bukti: "",
      pointSaat: "",
    });
    clearStudentSelection();
    setEditMode(false);
    setSelectedReport(null);
    setFormVisible(false);
  };

  // Handle create/update report
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (submitLoading) return; // Prevent multiple submissions

    if (!form.studentId || !form.tanggal) {
      Swal.fire("Error!", "Siswa dan tanggal wajib diisi", "error");
      return;
    }

    if (form.tipe === "violation" && !form.violationId) {
      Swal.fire("Error!", "Jenis pelanggaran wajib dipilih", "error");
      return;
    }

    if (form.tipe === "achievement" && !form.achievementId) {
      Swal.fire("Error!", "Jenis prestasi wajib dipilih", "error");
      return;
    }

    setSubmitLoading(true);
    try {
      const payload = {
        studentId: parseInt(form.studentId),
        tipe: form.tipe,
        violationId: form.violationId ? parseInt(form.violationId) : null,
        achievementId: form.achievementId ? parseInt(form.achievementId) : null,
        tanggal: form.tanggal, // Keep as YYYY-MM-DD format
        waktu: form.waktu && form.waktu.trim() !== "" ? form.waktu : null,
        deskripsi: form.deskripsi || "",
        bukti: form.bukti || "",
        pointSaat: form.pointSaat ? parseInt(form.pointSaat) : null,
      };

      console.log("Payload being sent:", payload);

      if (editMode) {
        await axios.put(
          `/api/master/reports/report/${selectedReport.id}`,
          payload,
          axiosConfig
        );
        Swal.fire("Berhasil!", "Laporan berhasil diperbarui", "success");
      } else {
        await axios.post("/api/master/reports/report", payload, axiosConfig);
        Swal.fire("Berhasil!", "Laporan berhasil dibuat", "success");
      }

      resetForm();
      fetchReports(pagination.page);
    } catch (err) {
      console.error("Error saving report:", err);
      console.error("Error details:", err.response?.data);
      const message = err.response?.data?.error || "Gagal menyimpan laporan";
      Swal.fire("Error!", message, "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Handle edit report
  const handleEdit = (report) => {
    setForm({
      studentId: report.student.id.toString(),
      tipe: report.tipe,
      violationId: report.violation?.id?.toString() || "",
      achievementId: report.achievement?.id?.toString() || "",
      tanggal: new Date(report.tanggal).toISOString().split("T")[0],
      waktu: report.waktu
        ? new Date(report.waktu).toTimeString().slice(0, 5)
        : "",
      deskripsi: report.deskripsi || "",
      bukti: report.bukti || "",
      pointSaat: report.pointSaat?.toString() || "",
    });

    // Set student search for edit mode
    setSelectedStudent(report.student);
    setStudentSearch(`${report.student.nama} - ${report.student.kelas}`);

    setSelectedReport(report);
    setEditMode(true);
    setFormVisible(true);
  };

  // Handle delete report
  const handleDelete = async (report) => {
    if (deleteLoading[report.id]) return; // Prevent multiple deletions

    const result = await Swal.fire({
      title: "Hapus Laporan?",
      text: `Yakin ingin menghapus laporan ${
        report.tipe === "violation" ? "pelanggaran" : "prestasi"
      } untuk ${report.student.nama}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      setDeleteLoading((prev) => ({ ...prev, [report.id]: true }));
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
      } finally {
        setDeleteLoading((prev) => ({ ...prev, [report.id]: false }));
      }
    }
  };

  // View report detail
  const viewDetail = (report) => {
    const student = report.student;
    const item = report.violation || report.achievement;

    Swal.fire({
      title: `<strong>Detail Laporan ${
        report.tipe === "violation" ? "Pelanggaran" : "Prestasi"
      }</strong>`,
      html: `
        <div class="text-left space-y-3">
          <div class="bg-gray-50 p-3 rounded">
            <h4 class="font-semibold text-gray-900 mb-2">Informasi Siswa</h4>
            <p><b>Nama:</b> ${student.nama}</p>
            <p><b>NISN:</b> ${student.nisn}</p>
            <p><b>Kelas:</b> ${student.kelas || "-"}</p>
            <p><b>Total Poin Saat Ini:</b> ${student.totalScore}</p>
          </div>
          
          <div class="bg-blue-50 p-3 rounded">
            <h4 class="font-semibold text-gray-900 mb-2">Informasi ${
              report.tipe === "violation" ? "Pelanggaran" : "Prestasi"
            }</h4>
            <p><b>Nama:</b> ${item?.nama || "-"}</p>
            <p><b>Kategori:</b> ${item?.kategori || "-"}</p>
            ${
              report.tipe === "violation"
                ? `<p><b>Jenis:</b> ${item?.jenis || "-"}</p>`
                : ""
            }
            <p><b>Poin:</b> ${item?.point || report.pointSaat}</p>
          </div>
          
          <div class="bg-yellow-50 p-3 rounded">
            <h4 class="font-semibold text-gray-900 mb-2">Detail Laporan</h4>
            <p><b>Tanggal:</b> ${formatDateForDisplay(report.tanggal)}</p>
            <p><b>Waktu:</b> ${formatTimeForDisplay(report.waktu)}</p>
            <p><b>Pelapor:</b> ${report.reporter} (${report.reporterRole})</p>
            <p><b>Deskripsi:</b> ${
              report.deskripsi || "Tidak ada deskripsi"
            }</p>
            <p><b>Bukti:</b> ${report.bukti || "Tidak ada bukti"}</p>
          </div>
        </div>
      `,
      icon: "info",
      width: "600px",
      confirmButtonText: "Tutup",
    });
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
            onClick={() => {
              resetForm();
              setFormVisible(true);
            }}
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
            <option value="violation">Pelanggaran</option>
            <option value="achievement">Prestasi</option>
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

      {/* Form */}
      {formVisible && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editMode ? "Edit Laporan" : "Tambah Laporan Baru"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative student-search-container">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Siswa *
                </label>
                {editMode ? (
                  <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                    {selectedStudent
                      ? `${selectedStudent.nama} - ${selectedStudent.kelas}`
                      : "Siswa tidak ditemukan"}
                  </div>
                ) : (
                  <div className="relative">
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => handleStudentSearch(e.target.value)}
                      onFocus={() => setShowStudentDropdown(true)}
                      placeholder="Cari nama siswa, NISN, atau kelas..."
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                    />
                    {selectedStudent && (
                      <button
                        type="button"
                        onClick={clearStudentSelection}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    )}
                    {showStudentDropdown && filteredStudents.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {filteredStudents.slice(0, 10).map((student) => (
                          <div
                            key={student.id}
                            onClick={() => handleSelectStudent(student)}
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">
                              {student.nama}
                            </div>
                            <div className="text-sm text-gray-600">
                              {student.nisn} • {student.kelas}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe *
                </label>
                {editMode ? (
                  <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                    {form.tipe === "violation" ? "Pelanggaran" : "Prestasi"}
                  </div>
                ) : (
                  <select
                    name="tipe"
                    value={form.tipe}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="violation">Pelanggaran</option>
                    <option value="achievement">Prestasi</option>
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {form.tipe === "violation"
                    ? "Jenis Pelanggaran *"
                    : "Jenis Prestasi *"}
                </label>
                {editMode ? (
                  <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                    {form.tipe === "violation"
                      ? violations.find(
                          (v) => v.id === parseInt(form.violationId)
                        )?.nama || "Tidak ditemukan"
                      : achievements.find(
                          (a) => a.id === parseInt(form.achievementId)
                        )?.nama || "Tidak ditemukan"}
                    {form.pointSaat && ` (${form.pointSaat} poin)`}
                  </div>
                ) : form.tipe === "violation" ? (
                  <select
                    name="violationId"
                    value={form.violationId}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih Pelanggaran</option>
                    {violations.map((violation) => (
                      <option key={violation.id} value={violation.id}>
                        {violation.nama} ({violation.point} poin)
                      </option>
                    ))}
                  </select>
                ) : (
                  <select
                    name="achievementId"
                    value={form.achievementId}
                    onChange={handleFormChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Pilih Prestasi</option>
                    {achievements.map((achievement) => (
                      <option key={achievement.id} value={achievement.id}>
                        {achievement.nama} ({achievement.point} poin)
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal *{" "}
                  {editMode && (
                    <span className="text-green-600">(dapat diubah)</span>
                  )}
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
                  Waktu{" "}
                  {editMode && (
                    <span className="text-green-600">(dapat diubah)</span>
                  )}
                </label>
                <input
                  type="time"
                  name="waktu"
                  value={form.waktu}
                  onChange={handleFormChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Poin
                </label>
                {editMode ? (
                  <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                    {form.pointSaat || "Tidak ada poin"}
                  </div>
                ) : (
                  <input
                    type="number"
                    name="pointSaat"
                    value={form.pointSaat}
                    onChange={handleFormChange}
                    placeholder="Otomatis terisi"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deskripsi{" "}
                  {editMode && (
                    <span className="text-green-600">(dapat diubah)</span>
                  )}
                </label>
                <textarea
                  name="deskripsi"
                  value={form.deskripsi}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Deskripsi detail kejadian..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bukti (URL/Path){" "}
                  {editMode && (
                    <span className="text-green-600">(dapat diubah)</span>
                  )}
                </label>
                <textarea
                  name="bukti"
                  value={form.bukti}
                  onChange={handleFormChange}
                  rows="3"
                  placeholder="Link foto/dokumen bukti..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={submitLoading}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex-1 flex items-center justify-center gap-2"
              >
                {submitLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {submitLoading
                  ? editMode
                    ? "Memperbarui..."
                    : "Menyimpan..."
                  : editMode
                  ? "Perbarui"
                  : "Simpan"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                disabled={submitLoading}
                className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex-1"
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

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
                          {report.student.nama}
                        </p>
                        <p className="text-sm text-gray-600">
                          {report.student.kelas} • {report.student.nisn}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          report.tipe === "violation"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {report.tipe === "violation" ? (
                          <FiAlertTriangle className="mr-1" />
                        ) : (
                          <FiAward className="mr-1" />
                        )}
                        {report.tipe === "violation"
                          ? "Pelanggaran"
                          : "Prestasi"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">
                          {report.violation?.nama || report.achievement?.nama}
                        </p>
                        <p className="text-sm text-gray-600">
                          {report.violation?.kategori ||
                            report.achievement?.kategori}
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
                          report.tipe === "violation"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {report.tipe === "violation" ? "-" : "+"}
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
                          onClick={() => handleEdit(report)}
                          className="bg-yellow-100 text-yellow-700 p-2 rounded hover:bg-yellow-200 transition-colors"
                          title="Edit"
                        >
                          <FiEdit3 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(report)}
                          disabled={deleteLoading[report.id]}
                          className="bg-red-100 text-red-700 p-2 rounded hover:bg-red-200 transition-colors disabled:bg-red-50 disabled:cursor-not-allowed flex items-center justify-center"
                          title="Hapus"
                        >
                          {deleteLoading[report.id] ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-700"></div>
                          ) : (
                            <FiTrash2 size={16} />
                          )}
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
