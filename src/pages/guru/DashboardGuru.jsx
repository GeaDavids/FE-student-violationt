import { useState, useEffect } from "react";
import API from "../../api/api";

import {
  FiUsers,
  FiBarChart2,
  FiTrendingUp,
  FiTrendingDown,
  FiAlertTriangle,
  FiAward,
  FiEye,
  FiRefreshCw,
  FiBook,
  FiUserCheck,
  FiTarget,
  FiFileText,
  FiUser,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const DashboardGuru = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [myReportSummary, setMyReportSummary] = useState(null);
  const [classStudents, setClassStudents] = useState([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("overview");

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    fetchDashboardData();
    fetchMyReportSummary();
  }, []);

  const fetchMyReportSummary = async () => {
    try {
      const response = await API.get("/guru/dashboard", axiosConfig);
      setMyReportSummary(response.data);
    } catch (error) {
      setMyReportSummary(null);
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await API.get("/guru/dashboard", axiosConfig);
      setDashboardData(response.data);

      // If user is wali kelas, fetch class students
      if (response.data.isWaliKelas) {
        setSelectedTab("classroom");
        fetchClassStudents();
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchClassStudents = async () => {
    try {
      setStudentsLoading(true);
      const response = await API.get("/guru/my-class-students", axiosConfig);
      setClassStudents(response.data.data || []);
    } catch (error) {
      console.error("Error fetching class students:", error);
    } finally {
      setStudentsLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "HIGH":
        return "text-red-600 bg-red-100";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-green-600 bg-green-100";
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-2 text-gray-500">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8">
        <div className="text-center py-8">
          <p className="text-gray-500">Gagal memuat data dashboard</p>
          <button
            onClick={fetchDashboardData}
            className="mt-4 bg-[#003366] text-white px-4 py-2 rounded"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#003366]">
            Dashboard {dashboardData.isWaliKelas ? "Wali Kelas" : "Guru"}
          </h2>
          <p className="text-gray-600">
            Selamat datang, {dashboardData?.teacherInfo?.name || "Guru"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/guru/reports")}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
          >
            <FiFileText /> Laporan Saya
          </button>
          <button
            onClick={() => navigate("/guru/profile")}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700 transition-colors"
          >
            <FiUser /> Profil
          </button>
          <button
            onClick={fetchDashboardData}
            className="bg-[#003366] text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {!dashboardData.isWaliKelas && (
            <button
              onClick={() => setSelectedTab("overview")}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === "overview"
                  ? "border-[#003366] text-[#003366]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <FiBarChart2 size={16} />
                Overview
              </div>
            </button>
          )}
          {dashboardData.isWaliKelas && (
            <>
              <button
                onClick={() => setSelectedTab("classroom")}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === "classroom"
                    ? "border-[#003366] text-[#003366]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiUsers size={16} />
                  Kelas Saya
                </div>
              </button>
              <button
                onClick={() => setSelectedTab("students")}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === "students"
                    ? "border-[#003366] text-[#003366]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <FiBook size={16} />
                  Daftar Siswa
                </div>
              </button>
            </>
          )}
        </nav>
      </div>

      {/* Content based on selected tab */}
      {selectedTab === "overview" && !dashboardData.isWaliKelas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Laporan Saya</p>
                <p className="text-2xl font-bold text-[#003366]">
                  {myReportSummary?.totalReports ?? 0}
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
                  {myReportSummary?.violationReports ?? 0}
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
                  {myReportSummary?.achievementReports ?? 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <FiAward className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedTab === "classroom" && dashboardData.isWaliKelas && (
        <div className="space-y-6">
          {/* Class Statistics */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
              <FiBarChart2 /> Statistik Kelas {dashboardData.classroom.nama}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardData.classroom.statistics.totalStudents}
                </p>
                <p className="text-sm text-gray-600">Total Siswa</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-green-600">
                  {dashboardData.classroom.statistics.lowRiskStudents}
                </p>
                <p className="text-sm text-gray-600">Low Risk</p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-yellow-600">
                  {dashboardData.classroom.statistics.mediumRiskStudents}
                </p>
                <p className="text-sm text-gray-600">Medium Risk</p>
              </div>
              <div className="bg-red-50 p-4 rounded-lg text-center">
                <p className="text-2xl font-bold text-red-600">
                  {dashboardData.classroom.statistics.highRiskStudents}
                </p>
                <p className="text-sm text-gray-600">High Risk</p>
              </div>
            </div>
          </div>

          {/* Students Needing Attention */}
          {dashboardData.classroom.studentsNeedingAttention.length > 0 && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                <FiAlertTriangle /> Siswa yang Perlu Perhatian
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full table-auto">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left">NISN</th>
                      <th className="px-4 py-2 text-left">Nama</th>
                      <th className="px-4 py-2 text-center">Total Score</th>
                      <th className="px-4 py-2 text-center">Pelanggaran</th>
                      <th className="px-4 py-2 text-center">Prestasi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.classroom.studentsNeedingAttention.map(
                      (student) => (
                        <tr
                          key={student.id}
                          className="border-t hover:bg-gray-50"
                        >
                          <td className="px-4 py-2">{student.nisn}</td>
                          <td className="px-4 py-2 font-medium">
                            {student.nama}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span className="font-bold text-red-600">
                              {student.totalScore}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-center">
                            {student.violationCount}
                          </td>
                          <td className="px-4 py-2 text-center">
                            {student.achievementCount}
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Violations */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
                <FiTrendingDown /> Pelanggaran Terbaru
              </h3>
              {dashboardData.classroom.recentViolations.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.classroom.recentViolations
                    .slice(0, 5)
                    .map((violation) => (
                      <div
                        key={violation.id}
                        className="border-l-4 border-red-400 pl-3 py-2 bg-red-50"
                      >
                        <p className="font-medium text-red-800">
                          {violation.studentName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {violation.violationName} • -{violation.point} poin
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(violation.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Tidak ada pelanggaran terbaru
                </p>
              )}
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
                <FiAward /> Prestasi Terbaru
              </h3>
              {dashboardData.classroom.recentAchievements.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.classroom.recentAchievements
                    .slice(0, 5)
                    .map((achievement) => (
                      <div
                        key={achievement.id}
                        className="border-l-4 border-green-400 pl-3 py-2 bg-green-50"
                      >
                        <p className="font-medium text-green-800">
                          {achievement.studentName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {achievement.achievementName} • +{achievement.point}{" "}
                          poin
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(achievement.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </p>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">
                  Tidak ada prestasi terbaru
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedTab === "students" && dashboardData.isWaliKelas && (
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-[#003366] flex items-center gap-2">
              <FiUsers /> Daftar Siswa Kelas
            </h3>
            <button
              onClick={fetchClassStudents}
              className="bg-[#003366] text-white px-4 py-2 rounded text-sm flex items-center gap-2"
            >
              <FiRefreshCw size={14} /> Refresh
            </button>
          </div>

          {studentsLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#003366] mx-auto"></div>
              <p className="mt-2 text-gray-500">Memuat data siswa...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-auto">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left">NISN</th>
                    <th className="px-4 py-2 text-left">Nama</th>
                    <th className="px-4 py-2 text-center">Gender</th>
                    <th className="px-4 py-2 text-center">Total Score</th>
                    <th className="px-4 py-2 text-center">Risk Level</th>
                    <th className="px-4 py-2 text-center">Pelanggaran</th>
                    <th className="px-4 py-2 text-center">Prestasi</th>
                  </tr>
                </thead>
                <tbody>
                  {classStudents.map((student) => (
                    <tr key={student.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{student.nisn}</td>
                      <td className="px-4 py-2">
                        <div>
                          <p className="font-medium">{student.nama}</p>
                          <p className="text-sm text-gray-500">
                            {student.email}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {student.jenisKelamin === "L"
                          ? "Laki-laki"
                          : "Perempuan"}
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`font-bold ${
                            student.totalScore >= 0
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {student.totalScore}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(
                            student.riskLevel
                          )}`}
                        >
                          {student.riskLevel}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-center">
                        {student.violationCount}
                      </td>
                      <td className="px-4 py-2 text-center">
                        {student.achievementCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {classStudents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada data siswa
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardGuru;
