import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import API from "../../api/api";
import {
  FiMonitor,
  FiUsers,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertTriangle,
  FiAward,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiEye,
  FiBarChart2,
  FiTarget,
} from "react-icons/fi";

const MonitoringSiswa = () => {
  const [siswaData, setSiswaData] = useState([]);
  const [filteredSiswa, setFilteredSiswa] = useState([]);
  const [kelasList, setKelasList] = useState([]);
  const [selectedKelas, setSelectedKelas] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRisk, setFilterRisk] = useState("");
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState({
    totalSiswa: 0,
    riskHigh: 0,
    riskMedium: 0,
    riskLow: 0,
    avgScore: 0,
  });

  const fetchSiswaWithScores = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch students with their classroom data
      const studentsRes = await API.get("/api/users/students");
      const students = studentsRes.data;

      // Fetch violations and achievements for each student
      const [violationsRes, achievementsRes] = await Promise.all([
        API.get("/api/student-violations"),
        API.get("/api/student-achievements"),
      ]);

      const violations = violationsRes.data;
      const achievements = achievementsRes.data;

      // Calculate scores for each student
      const siswaWithScores = students.map((siswa) => {
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

        // Calculate total score (achievements - violations)
        const totalScore = totalAchievementPoints - totalViolationPoints;

        // Determine risk level
        let riskLevel = "LOW";
        let riskColor = "text-green-600";
        let riskBg = "bg-green-100";

        if (totalViolationPoints >= 50) {
          riskLevel = "HIGH";
          riskColor = "text-red-600";
          riskBg = "bg-red-100";
        } else if (totalViolationPoints >= 25) {
          riskLevel = "MEDIUM";
          riskColor = "text-yellow-600";
          riskBg = "bg-yellow-100";
        }

        return {
          ...siswa,
          totalScore,
          totalViolationPoints,
          totalAchievementPoints,
          violationCount: siswaViolations.length,
          achievementCount: siswaAchievements.length,
          riskLevel,
          riskColor,
          riskBg,
        };
      });

      // Sort by total score (descending)
      siswaWithScores.sort((a, b) => b.totalScore - a.totalScore);

      setSiswaData(siswaWithScores);
      setFilteredSiswa(siswaWithScores);

      // Calculate statistics
      const stats = {
        totalSiswa: siswaWithScores.length,
        riskHigh: siswaWithScores.filter((s) => s.riskLevel === "HIGH").length,
        riskMedium: siswaWithScores.filter((s) => s.riskLevel === "MEDIUM")
          .length,
        riskLow: siswaWithScores.filter((s) => s.riskLevel === "LOW").length,
        avgScore:
          siswaWithScores.length > 0
            ? siswaWithScores.reduce((sum, s) => sum + s.totalScore, 0) /
              siswaWithScores.length
            : 0,
      };
      setStatistics(stats);
    } catch (err) {
      console.error("Gagal mengambil data monitoring:", err);
      Swal.fire("Error!", "Gagal mengambil data monitoring siswa", "error");
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
    fetchSiswaWithScores();
    fetchKelas();
  }, [fetchSiswaWithScores]);

  const applyFilters = (search, kelas, risk) => {
    let filtered = siswaData.filter((siswa) => {
      const siswaName = siswa.name || siswa.user?.name || "";
      const nisn = siswa.nisn || "";

      const matchSearch =
        siswaName.toLowerCase().includes(search.toLowerCase()) ||
        nisn.includes(search);

      const matchKelas = !kelas || siswa.classroom?.id === parseInt(kelas);
      const matchRisk = !risk || siswa.riskLevel === risk;

      return matchSearch && matchKelas && matchRisk;
    });

    setFilteredSiswa(filtered);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(value, selectedKelas, filterRisk);
  };

  const handleKelasFilter = (e) => {
    const value = e.target.value;
    setSelectedKelas(value);
    applyFilters(searchTerm, value, filterRisk);
  };

  const handleRiskFilter = (e) => {
    const value = e.target.value;
    setFilterRisk(value);
    applyFilters(searchTerm, selectedKelas, value);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedKelas("");
    setFilterRisk("");
    setFilteredSiswa(siswaData);
  };

  const handleDetailSiswa = (siswa) => {
    Swal.fire({
      title: `<strong>Detail Monitoring - ${
        siswa.name || siswa.user?.name
      }</strong>`,
      html: `
        <div class="text-left space-y-3">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <p><b>NISN:</b> ${siswa.nisn || "-"}</p>
              <p><b>Kelas:</b> ${siswa.classroom?.namaKelas || "-"}</p>
              <p><b>Level Resiko:</b> <span class="${siswa.riskColor}">${
        siswa.riskLevel
      }</span></p>
            </div>
            <div>
              <p><b>Total Score:</b> <span class="${
                siswa.totalScore >= 0 ? "text-green-600" : "text-red-600"
              }">${siswa.totalScore}</span></p>
              <p><b>Ranking:</b> #${
                filteredSiswa.findIndex((s) => s.id === siswa.id) + 1
              }</p>
            </div>
          </div>
          
          <hr class="my-3">
          
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-red-50 p-3 rounded">
              <h4 class="font-semibold text-red-800 mb-2">Pelanggaran</h4>
              <p><b>Total Poin:</b> <span class="text-red-600">-${
                siswa.totalViolationPoints
              }</span></p>
              <p><b>Jumlah Kasus:</b> ${siswa.violationCount}</p>
            </div>
            <div class="bg-green-50 p-3 rounded">
              <h4 class="font-semibold text-green-800 mb-2">Prestasi</h4>
              <p><b>Total Poin:</b> <span class="text-green-600">+${
                siswa.totalAchievementPoints
              }</span></p>
              <p><b>Jumlah Prestasi:</b> ${siswa.achievementCount}</p>
            </div>
          </div>
          
          <div class="mt-4 p-3 ${siswa.riskBg} rounded">
            <h4 class="font-semibold ${
              siswa.riskColor
            } mb-2">Rekomendasi Tindakan:</h4>
            <p class="text-sm">
              ${
                siswa.riskLevel === "HIGH"
                  ? "Siswa memerlukan perhatian khusus dan konseling intensif. Pertimbangkan panggilan orang tua."
                  : siswa.riskLevel === "MEDIUM"
                  ? "Siswa perlu pemantauan lebih ketat dan bimbingan rutin."
                  : "Siswa dalam kondisi baik. Pertahankan prestasi dan berikan apresiasi."
              }
            </p>
          </div>
        </div>
      `,
      icon: "info",
      width: "700px",
      showConfirmButton: true,
      confirmButtonText: "Tutup",
    });
  };

  const getRankingColor = (index) => {
    if (index === 0) return "bg-yellow-100 text-yellow-800"; // Gold
    if (index === 1) return "bg-gray-100 text-gray-800"; // Silver
    if (index === 2) return "bg-orange-100 text-orange-800"; // Bronze
    return "bg-blue-50 text-blue-700";
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
          <FiMonitor /> Monitoring Siswa
        </h2>
        <button
          onClick={() => {
            fetchSiswaWithScores();
            resetFilters();
          }}
          className="bg-[#003366] text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FiRefreshCw /> Refresh Data
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 flex items-center gap-2">
            <FiUsers /> Total Siswa
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {statistics.totalSiswa}
          </p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800 flex items-center gap-2">
            <FiAlertTriangle /> High Risk
          </h3>
          <p className="text-2xl font-bold text-red-600">
            {statistics.riskHigh}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
            <FiTarget /> Medium Risk
          </h3>
          <p className="text-2xl font-bold text-yellow-600">
            {statistics.riskMedium}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 flex items-center gap-2">
            <FiAward /> Low Risk
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {statistics.riskLow}
          </p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800 flex items-center gap-2">
            <FiBarChart2 /> Avg Score
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            {Math.round(statistics.avgScore)}
          </p>
        </div>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center border rounded px-3 py-2">
          <FiSearch className="mr-2" />
          <input
            type="text"
            placeholder="Cari nama/NISN siswa..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full outline-none"
          />
        </div>
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
          value={filterRisk}
          onChange={handleRiskFilter}
          className="border rounded px-3 py-2"
        >
          <option value="">Semua Level Resiko</option>
          <option value="HIGH">High Risk</option>
          <option value="MEDIUM">Medium Risk</option>
          <option value="LOW">Low Risk</option>
        </select>
        <button
          onClick={resetFilters}
          className="bg-gray-200 px-3 py-2 rounded text-sm flex items-center gap-1"
        >
          <FiFilter /> Reset Filter
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-2 text-gray-500">Memuat data monitoring...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-300 shadow rounded">
            <thead className="bg-[#f1f5f9] text-[#003366]">
              <tr>
                <th className="border px-4 py-2 text-center">Rank</th>
                <th className="border px-4 py-2 text-left">Siswa</th>
                <th className="border px-4 py-2 text-left">Kelas</th>
                <th className="border px-4 py-2 text-center">Total Score</th>
                <th className="border px-4 py-2 text-center">Pelanggaran</th>
                <th className="border px-4 py-2 text-center">Prestasi</th>
                <th className="border px-4 py-2 text-center">Risk Level</th>
                <th className="border px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSiswa.length > 0 ? (
                filteredSiswa.map((siswa, index) => (
                  <tr key={siswa.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${getRankingColor(
                          index
                        )}`}
                      >
                        #{index + 1}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      <div>
                        <div className="font-semibold text-[#003366]">
                          {siswa.name || siswa.user?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {siswa.nisn}
                        </div>
                      </div>
                    </td>
                    <td className="border px-4 py-2">
                      {siswa.classroom?.namaKelas || "-"}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <span
                        className={`font-bold text-lg ${
                          siswa.totalScore >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {siswa.totalScore}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <div className="text-red-600 font-semibold">
                        -{siswa.totalViolationPoints}
                      </div>
                      <div className="text-xs text-gray-500">
                        {siswa.violationCount} kasus
                      </div>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <div className="text-green-600 font-semibold">
                        +{siswa.totalAchievementPoints}
                      </div>
                      <div className="text-xs text-gray-500">
                        {siswa.achievementCount} prestasi
                      </div>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${siswa.riskBg} ${siswa.riskColor}`}
                      >
                        {siswa.riskLevel}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => handleDetailSiswa(siswa)}
                        title="Detail"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                      >
                        <FiEye />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    Tidak ada data siswa ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MonitoringSiswa;
