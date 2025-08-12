import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiSettings,
  FiSearch,
  FiUser,
  FiPlus,
  FiMinus,
  FiSave,
  FiRefreshCw,
  FiClock,
  FiEye,
} from "react-icons/fi";

const AdjustmentPoint = () => {
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    studentId: "",
    pointAdjustment: "",
    alasan: "",
    kategori: "Rehabilitasi",
  });

  // Filter state
  const [filters, setFilters] = useState({
    search: "",
    classroomId: "",
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch students
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.search) params.append("search", filters.search);
      if (filters.classroomId)
        params.append("classroomId", filters.classroomId);

      const res = await axios.get(
        `/api/master/reports/students?${params}`,
        axiosConfig
      );

      setStudents(res.data.data || []);
    } catch (err) {
      console.error("Error fetching students:", err);
      Swal.fire("Error!", "Gagal mengambil data siswa", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch classrooms
  const fetchClassrooms = async () => {
    try {
      const res = await axios.get("/api/classrooms", axiosConfig);
      setClassrooms(res.data.data || []);
    } catch (err) {
      console.error("Error fetching classrooms:", err);
    }
  };

  // Fetch adjustment history for specific student
  const fetchAdjustmentHistory = async (studentId, page = 1) => {
    try {
      setHistoryLoading(true);
      const res = await axios.get(
        `/api/master/reports/point-history/${studentId}?page=${page}&limit=${pagination.limit}`,
        axiosConfig
      );

      setAdjustmentHistory(res.data.data || []);
      setPagination({
        ...pagination,
        page: res.data.pagination?.page || 1,
        total: res.data.pagination?.total || 0,
        totalPages: res.data.pagination?.totalPages || 0,
      });
    } catch (err) {
      console.error("Error fetching adjustment history:", err);
      Swal.fire("Error!", "Gagal mengambil riwayat penyesuaian", "error");
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
    fetchStudents();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filters]);

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // When student is selected, fetch their adjustment history
    if (name === "studentId" && value) {
      const student = students.find((s) => s.id === parseInt(value));
      setSelectedStudent(student);
      fetchAdjustmentHistory(value);
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
      pointAdjustment: "",
      alasan: "",
      kategori: "Rehabilitasi",
    });
    setSelectedStudent(null);
    setAdjustmentHistory([]);
  };

  // Handle point adjustment
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.studentId || !form.pointAdjustment || !form.alasan) {
      Swal.fire("Error!", "Siswa, poin, dan alasan wajib diisi", "error");
      return;
    }

    const pointAdjustment = parseInt(form.pointAdjustment);
    if (pointAdjustment === 0) {
      Swal.fire("Error!", "Penyesuaian tidak boleh 0", "error");
      return;
    }

    try {
      const payload = {
        studentId: parseInt(form.studentId),
        pointAdjustment,
        alasan: form.alasan,
        kategori: form.kategori,
      };

      const res = await axios.post(
        "/api/master/reports/adjust-points",
        payload,
        axiosConfig
      );

      Swal.fire({
        title: "Berhasil!",
        html: `
          <div class="text-left">
            <p><b>Siswa:</b> ${res.data.data.student.nama}</p>
            <p><b>Poin Lama:</b> ${res.data.data.adjustment.pointLama}</p>
            <p><b>Poin Baru:</b> ${res.data.data.adjustment.pointBaru}</p>
            <p><b>Perubahan:</b> ${
              pointAdjustment > 0 ? "+" : ""
            }${pointAdjustment}</p>
            <p><b>Alasan:</b> ${res.data.data.adjustment.alasan}</p>
          </div>
        `,
        icon: "success",
      });

      // Update selected student data
      if (selectedStudent) {
        setSelectedStudent({
          ...selectedStudent,
          totalScore: res.data.data.adjustment.pointBaru,
        });
      }

      // Refresh data
      fetchStudents();
      fetchAdjustmentHistory(form.studentId);

      // Reset form except student selection
      setForm({
        ...form,
        pointAdjustment: "",
        alasan: "",
        kategori: "Rehabilitasi",
      });
    } catch (err) {
      console.error("Error adjusting points:", err);
      const message =
        err.response?.data?.error || "Gagal melakukan penyesuaian poin";
      Swal.fire("Error!", message, "error");
    }
  };

  // Quick adjustment buttons
  const quickAdjust = (amount) => {
    setForm({ ...form, pointAdjustment: amount.toString() });
  };

  // View student detail
  const viewStudentDetail = (student) => {
    Swal.fire({
      title: `<strong>Detail Siswa</strong>`,
      html: `
        <div class="text-left">
          <div class="bg-gray-50 p-3 rounded mb-3">
            <h4 class="font-semibold text-gray-900 mb-2">Informasi Dasar</h4>
            <p><b>Nama:</b> ${student.nama}</p>
            <p><b>NISN:</b> ${student.nisn}</p>
            <p><b>Kelas:</b> ${student.kelas || "-"}</p>
          </div>
          
          <div class="bg-blue-50 p-3 rounded">
            <h4 class="font-semibold text-gray-900 mb-2">Status Poin</h4>
            <p><b>Total Poin Saat Ini:</b> ${student.totalScore}</p>
            <p><b>Status:</b> ${
              student.totalScore <= -100
                ? '<span class="text-red-600 font-bold">BERESIKO TINGGI</span>'
                : student.totalScore <= -50
                ? '<span class="text-yellow-600 font-bold">PERLU PERHATIAN</span>'
                : '<span class="text-green-600">BAIK</span>'
            }</p>
          </div>
        </div>
      `,
      icon: "info",
      width: "500px",
    });
  };

  const getRiskLevel = (score) => {
    if (score <= -100)
      return {
        level: "BERESIKO TINGGI",
        color: "text-red-600",
        bg: "bg-red-100",
      };
    if (score <= -50)
      return {
        level: "PERLU PERHATIAN",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    return { level: "BAIK", color: "text-green-600", bg: "bg-green-100" };
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#003366] flex items-center gap-3">
          <FiSettings className="text-blue-600" />
          Penyesuaian Poin Siswa
        </h2>
        <button
          onClick={() => fetchStudents()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          disabled={loading}
        >
          <FiRefreshCw className={loading ? "animate-spin" : ""} />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column - Student Selection & Adjustment Form */}
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Cari Siswa
            </h3>
            <div className="space-y-4">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  placeholder="Cari nama atau NISN..."
                  value={filters.search}
                  onChange={handleFilterChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <select
                name="classroomId"
                value={filters.classroomId}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Semua Kelas</option>
                {classrooms.map((kelas) => (
                  <option key={kelas.id} value={kelas.id}>
                    {kelas.namaKelas}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Daftar Siswa
            </h3>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {students.length > 0 ? (
                students.map((student) => {
                  const risk = getRiskLevel(student.totalScore);
                  return (
                    <div
                      key={student.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedStudent?.id === student.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                      onClick={() => {
                        setForm({ ...form, studentId: student.id.toString() });
                        setSelectedStudent(student);
                        fetchAdjustmentHistory(student.id);
                      }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.nama}
                          </p>
                          <p className="text-sm text-gray-600">
                            {student.kelas} • {student.nisn}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-gray-900">
                            {student.totalScore} poin
                          </p>
                          <span
                            className={`${risk.bg} ${risk.color} px-2 py-1 rounded text-xs font-medium`}
                          >
                            {risk.level}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          viewStudentDetail(student);
                        }}
                        className="mt-2 text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                      >
                        <FiEye size={14} /> Detail
                      </button>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Tidak ada data siswa
                </p>
              )}
            </div>
          </div>

          {/* Adjustment Form */}
          {selectedStudent && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Penyesuaian Poin untuk {selectedStudent.nama}
              </h3>
              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <b>Poin Saat Ini:</b> {selectedStudent.totalScore}
                </p>
                <p className="text-sm text-gray-700">
                  <b>Kelas:</b> {selectedStudent.kelas}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategori
                  </label>
                  <select
                    name="kategori"
                    value={form.kategori}
                    onChange={handleFormChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Rehabilitasi">Rehabilitasi</option>
                    <option value="Reward">Reward</option>
                    <option value="Koreksi">Koreksi</option>
                    <option value="Penalty">Penalty</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Penyesuaian Poin *
                  </label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => quickAdjust(-50)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
                    >
                      -50
                    </button>
                    <button
                      type="button"
                      onClick={() => quickAdjust(-25)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
                    >
                      -25
                    </button>
                    <button
                      type="button"
                      onClick={() => quickAdjust(-10)}
                      className="bg-red-100 text-red-700 px-3 py-1 rounded text-sm hover:bg-red-200"
                    >
                      -10
                    </button>
                    <button
                      type="button"
                      onClick={() => quickAdjust(10)}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200"
                    >
                      +10
                    </button>
                    <button
                      type="button"
                      onClick={() => quickAdjust(25)}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200"
                    >
                      +25
                    </button>
                    <button
                      type="button"
                      onClick={() => quickAdjust(50)}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm hover:bg-green-200"
                    >
                      +50
                    </button>
                  </div>
                  <input
                    type="number"
                    name="pointAdjustment"
                    value={form.pointAdjustment}
                    onChange={handleFormChange}
                    placeholder="Masukkan poin (+ untuk tambah, - untuk kurang)"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Nilai positif untuk menambah poin, negatif untuk mengurangi
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alasan *
                  </label>
                  <textarea
                    name="alasan"
                    value={form.alasan}
                    onChange={handleFormChange}
                    rows="3"
                    placeholder="Jelaskan alasan penyesuaian poin..."
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 flex-1"
                  >
                    <FiSave /> Simpan Penyesuaian
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg flex-1"
                  >
                    Reset
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Column - Adjustment History */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiClock /> Riwayat Penyesuaian
            {selectedStudent && (
              <span className="text-sm text-gray-600 font-normal">
                - {selectedStudent.nama}
              </span>
            )}
          </h3>

          {!selectedStudent ? (
            <div className="text-center py-8 text-gray-500">
              <FiUser className="text-4xl text-gray-300 mb-2 mx-auto" />
              <p>Pilih siswa untuk melihat riwayat penyesuaian</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {historyLoading ? (
                <div className="text-center py-4">
                  <FiRefreshCw className="animate-spin mx-auto mb-2" />
                  <p className="text-gray-500">Memuat riwayat...</p>
                </div>
              ) : adjustmentHistory.length > 0 ? (
                adjustmentHistory.map((history) => (
                  <div
                    key={history.id}
                    className="border-l-4 border-blue-400 pl-4 py-3 bg-gray-50 rounded-r"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm text-gray-600">
                          {formatDateForDisplay(history.tanggal)}
                        </p>
                        <p className="font-medium text-gray-900">
                          {history.alasan}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {history.pointLama} → {history.pointBaru}
                        </p>
                        <span
                          className={`inline-flex px-2 py-1 rounded text-xs font-bold ${
                            history.pointBaru > history.pointLama
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {history.pointBaru > history.pointLama ? "+" : ""}
                          {history.pointBaru - history.pointLama}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiClock className="text-4xl text-gray-300 mb-2 mx-auto" />
                  <p>Belum ada riwayat penyesuaian</p>
                </div>
              )}
            </div>
          )}

          {/* Pagination for history */}
          {selectedStudent && pagination.totalPages > 1 && (
            <div className="mt-4 flex justify-center gap-2">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() =>
                    fetchAdjustmentHistory(selectedStudent.id, page)
                  }
                  className={`px-3 py-1 rounded ${
                    page === pagination.page
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-600 border hover:bg-gray-50"
                  } transition-colors`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdjustmentPoint;
