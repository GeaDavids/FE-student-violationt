import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiFileText,
  FiSettings,
  FiBarChart,
  FiActivity,
  FiUsers,
  FiAlertTriangle,
  FiAward,
  FiTrendingUp,
  FiArrowRight,
  FiCalendar,
  FiPieChart,
} from "react-icons/fi";

const DashboardLaporan = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalReports: 0,
    totalViolations: 0,
    totalAchievements: 0,
    studentsAtRisk: 0,
    recentReports: [],
  });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch dashboard statistics
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/master/reports?limit=100`, axiosConfig);

      const reports = res.data.data || [];
      const violations = reports.filter((r) => r.tipe === "violation");
      const achievements = reports.filter((r) => r.tipe === "achievement");

      // Get unique students and count risk students
      const studentsMap = new Map();
      reports.forEach((report) => {
        const studentId = report.student.id;
        if (!studentsMap.has(studentId)) {
          studentsMap.set(studentId, report.student);
        }
      });

      const students = Array.from(studentsMap.values());
      const riskStudents = students.filter((s) => s.totalScore <= -50);

      setStats({
        totalReports: reports.length,
        totalViolations: violations.length,
        totalAchievements: achievements.length,
        studentsAtRisk: riskStudents.length,
        recentReports: reports.slice(0, 5), // Latest 5 reports
      });
    } catch (err) {
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Navigation cards data
  const navigationCards = [
    {
      title: "Laporan Siswa",
      description: "Kelola laporan pelanggaran dan prestasi siswa",
      icon: FiFileText,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      path: "/superadmin/laporan-siswa",
      stats: `${stats.totalReports} laporan`,
    },
    {
      title: "Penyesuaian Poin",
      description: "Sesuaikan poin siswa untuk rehabilitasi",
      icon: FiSettings,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      path: "/superadmin/penyesuaian-poin",
      stats: `${stats.studentsAtRisk} siswa beresiko`,
    },
    {
      title: "Statistik Laporan",
      description: "Lihat analisis dan statistik lengkap",
      icon: FiBarChart,
      color: "bg-purple-500",
      bgColor: "bg-purple-50",
      path: "/superadmin/statistik-laporan",
      stats: "Dashboard analitik",
    },
    {
      title: "Monitoring Pelanggaran",
      description: "Monitor pelanggaran siswa secara real-time",
      icon: FiActivity,
      color: "bg-orange-500",
      bgColor: "bg-orange-50",
      path: "/superadmin/monitoring-pelanggaran",
      stats: "Real-time monitoring",
    },
  ];

  // Quick stats cards
  const quickStats = [
    {
      title: "Total Laporan",
      value: stats.totalReports,
      icon: FiFileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      change: "+12%",
      changeType: "up",
    },
    {
      title: "Pelanggaran",
      value: stats.totalViolations,
      icon: FiAlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      change: "-8%",
      changeType: "down",
    },
    {
      title: "Prestasi",
      value: stats.totalAchievements,
      icon: FiAward,
      color: "text-green-600",
      bgColor: "bg-green-100",
      change: "+15%",
      changeType: "up",
    },
    {
      title: "Siswa Beresiko",
      value: stats.studentsAtRisk,
      icon: FiUsers,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      change: "-5%",
      changeType: "down",
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#003366] mb-2">
          Dashboard Laporan
        </h1>
        <p className="text-gray-600">
          Kelola laporan siswa, penyesuaian poin, dan monitoring pelanggaran
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {quickStats.map((stat) => (
          <div key={stat.title} className="bg-white p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {stat.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center mt-1">
                  <span
                    className={`text-xs font-medium ${
                      stat.changeType === "up"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {stat.change}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    vs bulan lalu
                  </span>
                </div>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-full`}>
                <stat.icon className={`${stat.color}`} size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {navigationCards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
            onClick={() => navigate(card.path)}
          >
            <div className="p-6">
              <div
                className={`${card.bgColor} p-3 rounded-lg inline-block mb-4`}
              >
                <card.icon className={`${card.color} text-white`} size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {card.title}
              </h3>
              <p className="text-gray-600 text-sm mb-4">{card.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">
                  {card.stats}
                </span>
                <FiArrowRight className="text-gray-400 group-hover:text-blue-600 transition-colors" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Reports */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <FiCalendar className="text-blue-600" />
              Laporan Terbaru
            </h3>
            <button
              onClick={() => navigate("/superadmin/laporan-siswa")}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              Lihat Semua
            </button>
          </div>
          <div className="space-y-3">
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Memuat laporan...</p>
              </div>
            ) : stats.recentReports.length > 0 ? (
              stats.recentReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        report.tipe === "violation"
                          ? "bg-red-100"
                          : "bg-green-100"
                      }`}
                    >
                      {report.tipe === "violation" ? (
                        <FiAlertTriangle className="text-red-600" size={16} />
                      ) : (
                        <FiAward className="text-green-600" size={16} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {report.student.nama}
                      </p>
                      <p className="text-xs text-gray-500">
                        {report.violation?.nama || report.achievement?.nama}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {formatDateForDisplay(report.tanggal)}
                    </p>
                    <span
                      className={`text-xs font-medium ${
                        report.tipe === "violation"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {report.tipe === "violation" ? "-" : "+"}
                      {report.pointSaat} poin
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiFileText className="text-4xl text-gray-300 mb-2 mx-auto" />
                <p>Belum ada laporan terbaru</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiTrendingUp className="text-green-600" />
            Aksi Cepat
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/superadmin/laporan-siswa")}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white p-4 rounded-lg flex items-center gap-3 transition-colors"
            >
              <FiFileText />
              <div className="text-left">
                <p className="font-medium">Tambah Laporan Baru</p>
                <p className="text-sm text-blue-100">
                  Catat pelanggaran atau prestasi siswa
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/superadmin/penyesuaian-poin")}
              className="w-full bg-green-500 hover:bg-green-600 text-white p-4 rounded-lg flex items-center gap-3 transition-colors"
            >
              <FiSettings />
              <div className="text-left">
                <p className="font-medium">Sesuaikan Poin Siswa</p>
                <p className="text-sm text-green-100">
                  Rehabilitasi atau koreksi poin
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/superadmin/statistik-laporan")}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white p-4 rounded-lg flex items-center gap-3 transition-colors"
            >
              <FiPieChart />
              <div className="text-left">
                <p className="font-medium">Lihat Statistik</p>
                <p className="text-sm text-purple-100">
                  Analisis data laporan lengkap
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate("/superadmin/monitoring-pelanggaran")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white p-4 rounded-lg flex items-center gap-3 transition-colors"
            >
              <FiActivity />
              <div className="text-left">
                <p className="font-medium">Monitoring Real-time</p>
                <p className="text-sm text-orange-100">
                  Pantau pelanggaran aktif
                </p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Sistem Laporan Terintegrasi
            </h4>
            <p className="text-sm text-gray-600">
              Kelola semua laporan siswa dalam satu platform yang mudah
              digunakan
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Real-time Monitoring
            </h4>
            <p className="text-sm text-gray-600">
              Pantau perkembangan dan status siswa secara langsung
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">
              Analisis Mendalam
            </h4>
            <p className="text-sm text-gray-600">
              Dapatkan insight dari data laporan untuk pengambilan keputusan
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLaporan;
