import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiBarChart,
  FiPieChart,
  FiTrendingUp,
  FiTrendingDown,
  FiUsers,
  FiAlertTriangle,
  FiAward,
  FiCalendar,
  FiFilter,
  FiRefreshCw,
  FiDownload,
} from "react-icons/fi";

const StatistikLaporan = () => {
  const [stats, setStats] = useState({
    totalReports: 0,
    totalViolations: 0,
    totalAchievements: 0,
    studentsAtRisk: 0,
    averageScore: 0,
    monthlyTrend: "up",
  });

  const [reportsByType, setReportsByType] = useState([]);
  const [reportsByClass, setReportsByClass] = useState([]);
  const [reportsByMonth, setReportsByMonth] = useState([]);
  const [topViolations, setTopViolations] = useState([]);
  const [topAchievements, setTopAchievements] = useState([]);
  const [riskStudents, setRiskStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);

  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    year: new Date().getFullYear(),
    month: "",
    classroomId: "",
    period: "monthly", // weekly, monthly, yearly
  });

  const token = localStorage.getItem("token");
  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch main statistics
  const fetchMainStats = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.year) params.append("year", filters.year);
      if (filters.month) params.append("month", filters.month);
      if (filters.classroomId)
        params.append("classroomId", filters.classroomId);

      const res = await axios.get(
        `/api/master/reports?${params}&limit=1000`,
        axiosConfig
      );

      const reports = res.data.data || [];
      const violations = reports.filter((r) => r.tipe === "violation");
      const achievements = reports.filter((r) => r.tipe === "achievement");

      // Calculate risk students (students with score <= -50)
      const studentsMap = new Map();
      reports.forEach((report) => {
        const studentId = report.student.id;
        if (!studentsMap.has(studentId)) {
          studentsMap.set(studentId, {
            ...report.student,
            totalViolations: 0,
            totalAchievements: 0,
          });
        }
        if (report.tipe === "violation") {
          studentsMap.get(studentId).totalViolations++;
        } else {
          studentsMap.get(studentId).totalAchievements++;
        }
      });

      const students = Array.from(studentsMap.values());
      const riskStudents = students.filter((s) => s.totalScore <= -50);

      setStats({
        totalReports: reports.length,
        totalViolations: violations.length,
        totalAchievements: achievements.length,
        studentsAtRisk: riskStudents.length,
        averageScore:
          students.length > 0
            ? Math.round(
                students.reduce((sum, s) => sum + s.totalScore, 0) /
                  students.length
              )
            : 0,
        monthlyTrend: "up", // Simplified - you can calculate actual trend
      });

      setRiskStudents(riskStudents.slice(0, 10)); // Top 10 risk students
    } catch (err) {
      console.error("Error fetching main stats:", err);
    }
  };

  // Fetch reports by type (violations vs achievements)
  const fetchReportsByType = async () => {
    try {
      const [violationsRes, achievementsRes] = await Promise.all([
        axios.get(`/api/master/reports?tipe=violation&limit=1000`, axiosConfig),
        axios.get(
          `/api/master/reports?tipe=achievement&limit=1000`,
          axiosConfig
        ),
      ]);

      const violations = violationsRes.data.data || [];
      const achievements = achievementsRes.data.data || [];

      // Group by violation/achievement categories
      const violationsByCategory = violations.reduce((acc, report) => {
        const category = report.violation?.kategori || "Lainnya";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      const achievementsByCategory = achievements.reduce((acc, report) => {
        const category = report.achievement?.kategori || "Lainnya";
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {});

      const typeData = [
        {
          type: "Pelanggaran",
          count: violations.length,
          color: "bg-red-500",
          categories: Object.entries(violationsByCategory).map(
            ([name, count]) => ({ name, count })
          ),
        },
        {
          type: "Prestasi",
          count: achievements.length,
          color: "bg-green-500",
          categories: Object.entries(achievementsByCategory).map(
            ([name, count]) => ({ name, count })
          ),
        },
      ];

      setReportsByType(typeData);
    } catch (err) {
      console.error("Error fetching reports by type:", err);
    }
  };

  // Fetch reports by class
  const fetchReportsByClass = async () => {
    try {
      const res = await axios.get(
        `/api/master/reports?limit=1000`,
        axiosConfig
      );

      const reports = res.data.data || [];
      const reportsByClass = reports.reduce((acc, report) => {
        const className = report.student.kelas || "Tidak diketahui";
        if (!acc[className]) {
          acc[className] = {
            name: className,
            violations: 0,
            achievements: 0,
            total: 0,
          };
        }
        acc[className].total++;
        if (report.tipe === "violation") {
          acc[className].violations++;
        } else {
          acc[className].achievements++;
        }
        return acc;
      }, {});

      setReportsByClass(Object.values(reportsByClass));
    } catch (err) {
      console.error("Error fetching reports by class:", err);
    }
  };

  // Fetch monthly reports trend
  const fetchMonthlyTrend = async () => {
    try {
      const res = await axios.get(
        `/api/master/reports?limit=1000`,
        axiosConfig
      );

      const reports = res.data.data || [];
      const monthlyData = reports.reduce((acc, report) => {
        const date = new Date(report.tanggal);
        const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        if (!acc[monthKey]) {
          acc[monthKey] = {
            month: monthKey,
            violations: 0,
            achievements: 0,
            total: 0,
          };
        }
        acc[monthKey].total++;
        if (report.tipe === "violation") {
          acc[monthKey].violations++;
        } else {
          acc[monthKey].achievements++;
        }
        return acc;
      }, {});

      setReportsByMonth(
        Object.values(monthlyData).sort((a, b) =>
          a.month.localeCompare(b.month)
        )
      );
    } catch (err) {
      console.error("Error fetching monthly trend:", err);
    }
  };

  // Fetch top violations and achievements
  const fetchTopItems = async () => {
    try {
      const [violationsRes, achievementsRes] = await Promise.all([
        axios.get(`/api/master/reports?tipe=violation&limit=1000`, axiosConfig),
        axios.get(
          `/api/master/reports?tipe=achievement&limit=1000`,
          axiosConfig
        ),
      ]);

      const violations = violationsRes.data.data || [];
      const achievements = achievementsRes.data.data || [];

      // Count top violations
      const violationCounts = violations.reduce((acc, report) => {
        const name = report.violation?.nama || "Tidak diketahui";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      const topViolations = Object.entries(violationCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Count top achievements
      const achievementCounts = achievements.reduce((acc, report) => {
        const name = report.achievement?.nama || "Tidak diketahui";
        acc[name] = (acc[name] || 0) + 1;
        return acc;
      }, {});

      const topAchievements = Object.entries(achievementCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      setTopViolations(topViolations);
      setTopAchievements(topAchievements);
    } catch (err) {
      console.error("Error fetching top items:", err);
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

  // Fetch all data
  const fetchAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchMainStats(),
        fetchReportsByType(),
        fetchReportsByClass(),
        fetchMonthlyTrend(),
        fetchTopItems(),
      ]);
    } catch (err) {
      console.error("Error fetching data:", err);
      Swal.fire("Error!", "Gagal mengambil data statistik", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClassrooms();
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  // Export data
  const handleExport = () => {
    Swal.fire("Info", "Fitur export akan segera tersedia", "info");
  };

  // Format month name
  const formatMonthName = (monthKey) => {
    const [year, month] = monthKey.split("-");
    const date = new Date(year, month - 1);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
    });
  };

  // Get risk level
  const getRiskLevel = (score) => {
    if (score <= -100)
      return { level: "TINGGI", color: "text-red-600", bg: "bg-red-100" };
    if (score <= -50)
      return { level: "SEDANG", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { level: "RENDAH", color: "text-green-600", bg: "bg-green-100" };
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#003366] flex items-center gap-3">
          <FiBarChart className="text-blue-600" />
          Statistik Laporan
        </h2>
        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiDownload /> Export
          </button>
          <button
            onClick={fetchAllData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} />
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tahun
            </label>
            <select
              name="year"
              value={filters.year}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {Array.from({ length: 5 }, (_, i) => {
                const year = new Date().getFullYear() - i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bulan
            </label>
            <select
              name="month"
              value={filters.month}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Semua Bulan</option>
              {Array.from({ length: 12 }, (_, i) => (
                <option key={i + 1} value={i + 1}>
                  {new Date(0, i).toLocaleDateString("id-ID", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kelas
            </label>
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Periode
            </label>
            <select
              name="period"
              value={filters.period}
              onChange={handleFilterChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="weekly">Mingguan</option>
              <option value="monthly">Bulanan</option>
              <option value="yearly">Tahunan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Laporan</p>
              <p className="text-2xl font-bold text-[#003366]">
                {stats.totalReports}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiBarChart className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pelanggaran</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.totalViolations}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FiAlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Prestasi</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.totalAchievements}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiAward className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">
                Siswa Beresiko
              </p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.studentsAtRisk}
              </p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <FiUsers className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Reports by Type */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
            <FiPieChart /> Laporan berdasarkan Tipe
          </h3>
          <div className="space-y-4">
            {reportsByType.map((type) => (
              <div key={type.type}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{type.type}</span>
                  <span className="font-bold">{type.count}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${type.color}`}
                    style={{
                      width: `${
                        stats.totalReports > 0
                          ? (type.count / stats.totalReports) * 100
                          : 0
                      }%`,
                    }}
                  ></div>
                </div>
                <div className="mt-2 space-y-1">
                  {type.categories.slice(0, 3).map((category) => (
                    <div
                      key={category.name}
                      className="flex justify-between text-sm text-gray-600"
                    >
                      <span>• {category.name}</span>
                      <span>{category.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reports by Class */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
            <FiUsers /> Laporan berdasarkan Kelas
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {reportsByClass
              .sort((a, b) => b.total - a.total)
              .map((kelas) => (
                <div
                  key={kelas.name}
                  className="flex justify-between items-center p-3 border rounded"
                >
                  <div>
                    <p className="font-medium">{kelas.name}</p>
                    <p className="text-sm text-gray-600">
                      {kelas.violations} pelanggaran • {kelas.achievements}{" "}
                      prestasi
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#003366]">{kelas.total}</p>
                    <p className="text-xs text-gray-500">total</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Top Violations */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
            <FiAlertTriangle /> Pelanggaran Terbanyak
          </h3>
          <div className="space-y-3">
            {topViolations.map((violation, index) => (
              <div
                key={violation.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-red-100 text-red-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">{violation.name}</span>
                </div>
                <span className="font-bold text-red-600">
                  {violation.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Achievements */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
            <FiAward /> Prestasi Terbanyak
          </h3>
          <div className="space-y-3">
            {topAchievements.map((achievement, index) => (
              <div
                key={achievement.name}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 text-green-700 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <span className="text-sm font-medium">
                    {achievement.name}
                  </span>
                </div>
                <span className="font-bold text-green-600">
                  {achievement.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Students */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
            <FiTrendingDown /> Siswa Beresiko
          </h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {riskStudents.map((student) => {
              const risk = getRiskLevel(student.totalScore);
              return (
                <div
                  key={student.id}
                  className="flex justify-between items-center p-2 border rounded"
                >
                  <div>
                    <p className="font-medium text-sm">{student.nama}</p>
                    <p className="text-xs text-gray-600">{student.kelas}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600 text-sm">
                      {student.totalScore}
                    </p>
                    <span
                      className={`${risk.bg} ${risk.color} px-2 py-1 rounded text-xs`}
                    >
                      {risk.level}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Monthly Trend */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
          <FiCalendar /> Trend Laporan Bulanan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {reportsByMonth.slice(-6).map((month) => (
            <div key={month.month} className="text-center p-4 border rounded">
              <p className="text-sm font-medium text-gray-600">
                {formatMonthName(month.month)}
              </p>
              <p className="text-2xl font-bold text-[#003366] my-2">
                {month.total}
              </p>
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-red-600">Pelanggaran:</span>
                  <span className="font-medium">{month.violations}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-green-600">Prestasi:</span>
                  <span className="font-medium">{month.achievements}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatistikLaporan;
