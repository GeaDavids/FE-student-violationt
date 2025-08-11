import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import API from "../../api/api";
import {
  FiShield,
  FiAlertTriangle,
  FiUsers,
  FiTrendingUp,
  FiTrendingDown,
  FiPhone,
  FiCalendar,
  FiFileText,
  FiTarget,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiRefreshCw,
} from "react-icons/fi";

const ManajemenResiko = () => {
  const [riskData, setRiskData] = useState([]);
  const [filteredRisk, setFilteredRisk] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedSiswa, setSelectedSiswa] = useState(null);
  const [actionForm, setActionForm] = useState({
    actionType: "",
    description: "",
    targetDate: "",
    responsible: "",
  });

  const riskLevels = ["HIGH", "MEDIUM", "LOW"];
  const actionTypes = [
    "KONSELING",
    "PANGGILAN_ORTU",
    "PEMBINAAN",
    "MONITORING_KHUSUS",
    "PERINGATAN",
    "SANKSI",
    "MOTIVASI",
    "REWARD",
  ];

  const statusTypes = ["OPEN", "IN_PROGRESS", "RESOLVED"];

  const fetchRiskData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch students data
      const studentsRes = await API.get("/api/users/students");
      const students = studentsRes.data;

      // Fetch violations and achievements
      const [violationsRes, achievementsRes] = await Promise.all([
        API.get("/api/student-violations"),
        API.get("/api/student-achievements"),
      ]);

      const violations = violationsRes.data;
      const achievements = achievementsRes.data;

      // Calculate risk data for each student
      const riskStudents = students
        .map((siswa) => {
          // Get violations for this student
          const siswaViolations = violations.filter(
            (v) => v.studentId === siswa.id
          );
          const totalViolationPoints = siswaViolations.reduce(
            (sum, v) => sum + (v.violation?.point || v.pointSaat || 0),
            0
          );

          // Get achievements for this student
          const siswaAchievements = achievements.filter(
            (a) => a.studentId === siswa.id
          );
          const totalAchievementPoints = siswaAchievements.reduce(
            (sum, a) => sum + (a.achievement?.point || a.pointSaat || 0),
            0
          );

          // Calculate total score
          const totalScore = totalAchievementPoints - totalViolationPoints;

          // Determine risk level and priority
          let riskLevel = "LOW";
          let priority = 1;
          let urgency = "Normal";

          if (totalViolationPoints >= 50) {
            riskLevel = "HIGH";
            priority = 3;
            urgency = "Urgent";
          } else if (totalViolationPoints >= 25) {
            riskLevel = "MEDIUM";
            priority = 2;
            urgency = "Medium";
          }

          // Get recent violations (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const recentViolations = siswaViolations.filter(
            (v) => new Date(v.tanggal) >= thirtyDaysAgo
          );

          // Calculate trend
          const trend =
            recentViolations.length > siswaViolations.length / 2
              ? "INCREASING"
              : recentViolations.length === 0
              ? "IMPROVING"
              : "STABLE";

          return {
            ...siswa,
            totalScore,
            totalViolationPoints,
            totalAchievementPoints,
            violationCount: siswaViolations.length,
            achievementCount: siswaAchievements.length,
            recentViolationCount: recentViolations.length,
            riskLevel,
            priority,
            urgency,
            trend,
            status: "OPEN", // Default status
            lastAction: null,
            nextActionDate: null,
          };
        })
        .filter((siswa) => siswa.riskLevel !== "LOW") // Only show medium and high risk
        .sort((a, b) => b.priority - a.priority); // Sort by priority

      setRiskData(riskStudents);
      setFilteredRisk(riskStudents);
    } catch (err) {
      console.error("Gagal mengambil data resiko:", err);
      Swal.fire("Error!", "Gagal mengambil data manajemen resiko", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchKelas = async () => {
    try {
      const res = await API.get("/api/classrooms");
      setKelasList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data kelas:", err);
    }
  };

  useEffect(() => {
    fetchRiskData();
    fetchKelas();
  }, [fetchRiskData]);

  const applyFilters = (kelas, riskLevel, status) => {
    let filtered = riskData.filter((siswa) => {
      const matchKelas = !kelas || siswa.classroom?.id === parseInt(kelas);
      const matchRisk = !riskLevel || siswa.riskLevel === riskLevel;
      const matchStatus = !status || siswa.status === status;

      return matchKelas && matchRisk && matchStatus;
    });

    setFilteredRisk(filtered);
  };

  const handleKelasFilter = (e) => {
    const value = e.target.value;
    setSelectedKelas(value);
    applyFilters(value, selectedRiskLevel, selectedStatus);
  };

  const handleRiskFilter = (e) => {
    const value = e.target.value;
    setSelectedRiskLevel(value);
    applyFilters(selectedKelas, value, selectedStatus);
  };

  const handleStatusFilter = (e) => {
    const value = e.target.value;
    setSelectedStatus(value);
    applyFilters(selectedKelas, selectedRiskLevel, value);
  };

  const resetFilters = () => {
    setSelectedKelas("");
    setSelectedRiskLevel("");
    setSelectedStatus("");
    setFilteredRisk(riskData);
  };

  const handleAddAction = (siswa) => {
    setSelectedSiswa(siswa);
    setActionForm({
      actionType: "",
      description: "",
      targetDate: "",
      responsible: "",
    });
    setFormVisible(true);
  };

  const handleActionFormChange = (e) => {
    setActionForm({ ...actionForm, [e.target.name]: e.target.value });
  };

  const handleSubmitAction = async (e) => {
    e.preventDefault();

    // For now, just show success message since we don't have action API
    Swal.fire({
      title: "Tindakan Berhasil Ditambahkan!",
      html: `
        <div class="text-left">
          <p><strong>Siswa:</strong> ${
            selectedSiswa.name || selectedSiswa.user?.name
          }</p>
          <p><strong>Tindakan:</strong> ${actionForm.actionType}</p>
          <p><strong>Target:</strong> ${actionForm.targetDate}</p>
          <p><strong>PIC:</strong> ${actionForm.responsible}</p>
          <p><strong>Deskripsi:</strong> ${actionForm.description}</p>
        </div>
      `,
      icon: "success",
    });

    setFormVisible(false);
    setSelectedSiswa(null);
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "HIGH":
        return {
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-200",
        };
      case "MEDIUM":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          border: "border-yellow-200",
        };
      default:
        return {
          bg: "bg-green-100",
          text: "text-green-800",
          border: "border-green-200",
        };
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case "INCREASING":
        return <FiTrendingUp className="text-red-500" />;
      case "IMPROVING":
        return <FiTrendingDown className="text-green-500" />;
      default:
        return <FiTarget className="text-gray-500" />;
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "Urgent":
        return "text-red-600 font-bold";
      case "Medium":
        return "text-yellow-600 font-semibold";
      default:
        return "text-green-600";
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
          <FiShield /> Manajemen Resiko
        </h2>
        <button
          onClick={() => {
            fetchRiskData();
            resetFilters();
          }}
          className="bg-[#003366] text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FiRefreshCw /> Refresh Data
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800 flex items-center gap-2">
            <FiAlertTriangle /> High Risk
          </h3>
          <p className="text-2xl font-bold text-red-600">
            {riskData.filter((s) => s.riskLevel === "HIGH").length}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
            <FiTarget /> Medium Risk
          </h3>
          <p className="text-2xl font-bold text-yellow-600">
            {riskData.filter((s) => s.riskLevel === "MEDIUM").length}
          </p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 flex items-center gap-2">
            <FiClock /> Perlu Tindakan
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {riskData.filter((s) => s.status === "OPEN").length}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 flex items-center gap-2">
            <FiCheckCircle /> Resolved
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {riskData.filter((s) => s.status === "RESOLVED").length}
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <select
          value={selectedKelas}
          onChange={handleKelasFilter}
          className="border rounded px-3 py-2"
        >
          <option value="">Semua Kelas</option>
          {kelasList.map((kelas) => (
            <option key={kelas.id} value={kelas.id}>
              {kelas.namaKelas}
            </option>
          ))}
        </select>
        <select
          value={selectedRiskLevel}
          onChange={handleRiskFilter}
          className="border rounded px-3 py-2"
        >
          <option value="">Semua Level Resiko</option>
          {riskLevels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <select
          value={selectedStatus}
          onChange={handleStatusFilter}
          className="border rounded px-3 py-2"
        >
          <option value="">Semua Status</option>
          {statusTypes.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <button
          onClick={resetFilters}
          className="bg-gray-200 px-3 py-2 rounded text-sm flex items-center gap-1"
        >
          <FiFilter /> Reset Filter
        </button>
      </div>

      {/* Action Form Modal */}
      {formVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Tambah Tindakan untuk{" "}
              {selectedSiswa?.name || selectedSiswa?.user?.name}
            </h3>
            <form onSubmit={handleSubmitAction} className="space-y-4">
              <select
                name="actionType"
                value={actionForm.actionType}
                onChange={handleActionFormChange}
                required
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Pilih Jenis Tindakan</option>
                {actionTypes.map((type) => (
                  <option key={type} value={type}>
                    {type.replace("_", " ")}
                  </option>
                ))}
              </select>

              <input
                type="text"
                name="responsible"
                placeholder="Penanggung Jawab"
                value={actionForm.responsible}
                onChange={handleActionFormChange}
                required
                className="w-full border rounded px-3 py-2"
              />

              <input
                type="date"
                name="targetDate"
                value={actionForm.targetDate}
                onChange={handleActionFormChange}
                required
                className="w-full border rounded px-3 py-2"
              />

              <textarea
                name="description"
                placeholder="Deskripsi tindakan..."
                value={actionForm.description}
                onChange={handleActionFormChange}
                required
                className="w-full border rounded px-3 py-2"
                rows="3"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-[#003366] text-white py-2 rounded"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setFormVisible(false)}
                  className="flex-1 bg-gray-500 text-white py-2 rounded"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-2 text-gray-500">Memuat data resiko...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRisk.length > 0 ? (
            filteredRisk.map((siswa) => {
              const riskColors = getRiskColor(siswa.riskLevel);
              return (
                <div
                  key={siswa.id}
                  className={`${riskColors.bg} ${riskColors.border} border-l-4 p-4 rounded-lg`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-[#003366]">
                          {siswa.name || siswa.user?.name}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${riskColors.bg} ${riskColors.text}`}
                        >
                          {siswa.riskLevel} RISK
                        </span>
                        <span
                          className={`text-sm ${getUrgencyColor(
                            siswa.urgency
                          )}`}
                        >
                          {siswa.urgency}
                        </span>
                        <div className="flex items-center gap-1">
                          {getTrendIcon(siswa.trend)}
                          <span className="text-sm text-gray-600">
                            {siswa.trend}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">NISN:</span>{" "}
                          {siswa.nisn}
                        </div>
                        <div>
                          <span className="font-medium">Kelas:</span>{" "}
                          {siswa.classroom?.namaKelas || "-"}
                        </div>
                        <div>
                          <span className="font-medium">
                            Total Pelanggaran:
                          </span>{" "}
                          <span className="text-red-600 font-semibold">
                            -{siswa.totalViolationPoints}
                          </span>
                        </div>
                        <div>
                          <span className="font-medium">
                            Pelanggaran Bulan Ini:
                          </span>{" "}
                          <span className="text-red-600 font-semibold">
                            {siswa.recentViolationCount}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAddAction(siswa)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-1"
                      >
                        <FiFileText size={14} />
                        Tambah Tindakan
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500">
              Tidak ada siswa beresiko ditemukan.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ManajemenResiko;
