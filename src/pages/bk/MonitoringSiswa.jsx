import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
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
  const navigate = useNavigate();

  // Axios config
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

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
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const fetchSiswaWithScores = useCallback(async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (selectedKelas) params.append("classroomId", selectedKelas);
      if (filterRisk) params.append("riskLevel", filterRisk);
      if (searchTerm) params.append("search", searchTerm);

      // Fetch students from new monitoring endpoint
      const response = await axios.get(
        `/api/bk/students?${params}`,
        axiosConfig
      );

      const studentsData = response.data.data || [];
      const paginationData = response.data.pagination || {};

      setSiswaData(studentsData);
      setFilteredSiswa(studentsData);
      setPagination(paginationData);
    } catch (err) {
      console.error("Error fetching students for monitoring:", err);
      Swal.fire("Error!", "Gagal mengambil data siswa", "error");
    } finally {
      setLoading(false);
    }
  }, [
    selectedKelas,
    filterRisk,
    searchTerm,
    pagination.page,
    pagination.limit,
  ]);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get("/api/bk/dashboard", axiosConfig);
      const dashboardData = response.data.data;

      setStatistics({
        totalSiswa: dashboardData.totalStudents,
        riskHigh: dashboardData.highRiskStudents,
        riskMedium: dashboardData.mediumRiskStudents,
        riskLow: dashboardData.lowRiskStudents,
        avgScore: dashboardData.averageScore || 0,
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    }
  };

  const fetchKelas = async () => {
    try {
      const res = await axios.get("/api/bk/classrooms", axiosConfig);
      setKelasList(res.data.data || []);
    } catch (err) {
      console.error("Gagal mengambil data kelas:", err);
    }
  };

  useEffect(() => {
    fetchSiswaWithScores();
    fetchKelas();
    fetchDashboardStats();
  }, [fetchSiswaWithScores]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleKelasChange = (e) => {
    setSelectedKelas(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleRiskFilterChange = (e) => {
    setFilterRisk(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedKelas("");
    setFilterRisk("");
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleDetailSiswa = (siswa) => {
    navigate(`/bk/siswa/${siswa.id}`);
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
            onChange={handleSearchChange}
            className="w-full outline-none"
          />
        </div>
        <select
          value={selectedKelas}
          onChange={handleKelasChange}
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
          onChange={handleRiskFilterChange}
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
                          {siswa.nama}
                        </div>
                        <div className="text-sm text-gray-500">
                          {siswa.nisn}
                        </div>
                      </div>
                    </td>
                    <td className="border px-4 py-2">{siswa.kelas || "-"}</td>
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
                        {siswa.totalViolations} kasus
                      </div>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <div className="text-green-600 font-semibold">
                        +{siswa.totalAchievementPoints}
                      </div>
                      <div className="text-xs text-gray-500">
                        {siswa.totalAchievements} prestasi
                      </div>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          siswa.riskLevel === "HIGH"
                            ? "bg-red-100 text-red-800"
                            : siswa.riskLevel === "MEDIUM"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
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

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-between items-center mt-6">
          <div className="text-sm text-gray-600">
            Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
            dari {pagination.total} siswa
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
              }
              disabled={pagination.page <= 1}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Sebelumnya
            </button>
            <span className="px-3 py-1 bg-[#003366] text-white rounded">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
              }
              disabled={pagination.page >= pagination.totalPages}
              className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonitoringSiswa;
