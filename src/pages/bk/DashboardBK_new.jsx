import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../api/api";
import {
  FiAlertCircle,
  FiUsers,
  FiTrendingUp,
  FiCalendar,
  FiFileText,
  FiBarChart2,
  FiArrowRight,
  FiUserCheck,
  FiCheckCircle,
  FiAward,
  FiPlus,
  FiEdit,
  FiActivity,
} from "react-icons/fi";

const DashboardBK = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    totalViolations: 0,
    totalAchievements: 0,
    totalStudents: 0,
    violationsThisMonth: 0,
    achievementsThisMonth: 0,
    recentReports: [],
    topViolationTypes: [],
    topAchievementTypes: [],
    reportsByClass: [],
    monthlyTrends: [],
  });

  useEffect(() => {
    const name = localStorage.getItem("name");
    if (name) setUserName(name);

    const storedRole = localStorage.getItem("role");
    if (!storedRole) navigate("/");

    fetchDashboardData();
  }, [navigate]);

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      // Fetch combined data for violations and achievements
      const [violationsRes, achievementsRes, studentsRes] = await Promise.all([
        API.get("/api/student-violations"),
        API.get("/api/student-achievements"),
        API.get("/api/users/students"),
      ]);

      const violations = violationsRes.data;
      const achievements = achievementsRes.data;
      const students = studentsRes.data;

      // Process dashboard data
      processDashboardData(violations, achievements, students);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // Use mock data in case of error
      setDashboardData({
        totalViolations: 45,
        totalAchievements: 23,
        totalStudents: 150,
        violationsThisMonth: 12,
        achievementsThisMonth: 8,
        recentReports: [],
        topViolationTypes: [],
        topAchievementTypes: [],
        reportsByClass: [],
        monthlyTrends: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const processDashboardData = (violations, achievements, students) => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    // Calculate monthly data
    const violationsThisMonth = violations.filter((v) => {
      const vDate = new Date(v.tanggal);
      return (
        vDate.getMonth() === currentMonth && vDate.getFullYear() === currentYear
      );
    }).length;

    const achievementsThisMonth = achievements.filter((a) => {
      const aDate = new Date(a.tanggal);
      return (
        aDate.getMonth() === currentMonth && aDate.getFullYear() === currentYear
      );
    }).length;

    // Get recent reports (combine violations and achievements)
    const allReports = [
      ...violations.map((v) => ({ ...v, type: "violation" })),
      ...achievements.map((a) => ({ ...a, type: "achievement" })),
    ]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5);

    // Calculate top violation types
    const violationTypeCounts = violations.reduce((acc, v) => {
      const typeName = v.violation?.nama || "Unknown";
      acc[typeName] = (acc[typeName] || 0) + 1;
      return acc;
    }, {});

    const topViolationTypes = Object.entries(violationTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    // Calculate top achievement types
    const achievementTypeCounts = achievements.reduce((acc, a) => {
      const typeName = a.achievement?.nama || "Unknown";
      acc[typeName] = (acc[typeName] || 0) + 1;
      return acc;
    }, {});

    const topAchievementTypes = Object.entries(achievementTypeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    setDashboardData({
      totalViolations: violations.length,
      totalAchievements: achievements.length,
      totalStudents: students.length,
      violationsThisMonth,
      achievementsThisMonth,
      recentReports: allReports,
      topViolationTypes,
      topAchievementTypes,
      reportsByClass: [],
      monthlyTrends: [],
    });
  };

  // Quick actions for BK
  const quickActions = [
    {
      title: "Laporan Pelanggaran & Prestasi",
      description: "Kelola laporan pelanggaran dan prestasi siswa",
      icon: FiFileText,
      path: "/bk/laporan-siswa",
      color: "bg-blue-500",
    },
    {
      title: "Tambah Laporan Baru",
      description: "Buat laporan pelanggaran atau prestasi",
      icon: FiPlus,
      path: "/bk/laporan-siswa?action=add",
      color: "bg-green-500",
    },
    {
      title: "Kelola Jenis Pelanggaran",
      description: "Tambah atau edit jenis pelanggaran",
      icon: FiEdit,
      path: "/bk/kelola-violations",
      color: "bg-red-500",
    },
    {
      title: "Kelola Jenis Prestasi",
      description: "Tambah atau edit jenis prestasi",
      icon: FiAward,
      path: "/bk/kelola-achievements",
      color: "bg-yellow-500",
    },
  ];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard BK</h1>
          <p className="text-gray-600 mt-1">
            Selamat datang, {userName || "BK"}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">
            {new Date().toLocaleDateString("id-ID", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <FiAlertCircle className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Pelanggaran
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.totalViolations}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {dashboardData.violationsThisMonth} bulan ini
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FiAward className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                Total Prestasi
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.totalAchievements}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {dashboardData.achievementsThisMonth} bulan ini
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FiUsers className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Siswa</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.totalStudents}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">Aktif saat ini</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FiActivity className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Laporan</p>
              <p className="text-2xl font-semibold text-gray-900">
                {dashboardData.totalViolations +
                  dashboardData.totalAchievements}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <p className="text-sm text-gray-500">
              {dashboardData.violationsThisMonth +
                dashboardData.achievementsThisMonth}{" "}
              bulan ini
            </p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Link
              key={index}
              to={action.path}
              className="block p-4 border rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center mb-2">
                <div className={`p-2 rounded ${action.color} text-white`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <h3 className="ml-3 font-medium text-gray-900">
                  {action.title}
                </h3>
              </div>
              <p className="text-sm text-gray-600">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Reports and Top Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Laporan Terbaru
            </h2>
            <Link
              to="/bk/laporan-siswa"
              className="text-blue-600 hover:text-blue-700 text-sm flex items-center"
            >
              Lihat Semua <FiArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="space-y-3">
            {dashboardData.recentReports.slice(0, 5).map((report, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 bg-gray-50 rounded"
              >
                <div className="flex items-center">
                  <div
                    className={`p-2 rounded-full ${
                      report.type === "violation"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {report.type === "violation" ? (
                      <FiAlertCircle className="h-4 w-4" />
                    ) : (
                      <FiAward className="h-4 w-4" />
                    )}
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {report.student?.name ||
                        report.student?.user?.name ||
                        "Unknown"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {report.type === "violation"
                        ? report.violation?.nama
                        : report.achievement?.nama}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {formatDate(report.tanggal)}
                  </p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      report.type === "violation"
                        ? "bg-red-100 text-red-800"
                        : "bg-green-100 text-green-800"
                    }`}
                  >
                    {report.type === "violation" ? "Pelanggaran" : "Prestasi"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Violation Types */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Jenis Pelanggaran Teratas
          </h2>
          <div className="space-y-3">
            {dashboardData.topViolationTypes.map((type, index) => (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-900">{type.name}</span>
                <div className="flex items-center">
                  <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                    <div
                      className="bg-red-500 h-2 rounded-full"
                      style={{
                        width: `${
                          dashboardData.topViolationTypes.length > 0
                            ? (type.count /
                                Math.max(
                                  ...dashboardData.topViolationTypes.map(
                                    (t) => t.count
                                  )
                                )) *
                              100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {type.count}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Jenis Prestasi Teratas
            </h3>
            <div className="space-y-3">
              {dashboardData.topAchievementTypes.map((type, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-900">{type.name}</span>
                  <div className="flex items-center">
                    <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{
                          width: `${
                            dashboardData.topAchievementTypes.length > 0
                              ? (type.count /
                                  Math.max(
                                    ...dashboardData.topAchievementTypes.map(
                                      (t) => t.count
                                    )
                                  )) *
                                100
                              : 0
                          }%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {type.count}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardBK;
