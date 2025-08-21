import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiBarChart2,
  FiUsers,
  FiUser,
  FiFileText,
  FiAward,
} from "react-icons/fi";
import AcademicYearSelector from "../components/AcademicYearSelector";
import AcademicYearManagement from "../components/AcademicYearManagement";
import superadminAPI from "../api/superadmin";

const SuperadminAcademicYear = () => {
  const [selectedYear, setSelectedYear] = useState(null);
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("management");

  useEffect(() => {
    if (selectedYear) {
      fetchData();
    }
  }, [selectedYear]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsResponse, analyticsResponse] = await Promise.all([
        superadminAPI.getStatsByAcademicYear({ tahunAjaranId: selectedYear }),
        superadminAPI.getAnalyticsByAcademicYear({
          tahunAjaranId: selectedYear,
        }),
      ]);

      setStats(statsResponse.data);
      setAnalytics(analyticsResponse.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    icon: Icon,
    title,
    value,
    subtitle,
    color = "indigo",
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center">
        <div className={`flex-shrink-0 p-3 rounded-md bg-${color}-500`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Manajemen Tahun Ajaran
            </h1>
            <p className="text-gray-600">
              Kelola tahun ajaran dan lihat statistik sistem
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={() => setActiveTab("management")}
              className={`px-4 py-2 rounded-md ${
                activeTab === "management"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Manajemen
            </button>
            <button
              onClick={() => setActiveTab("analytics")}
              className={`px-4 py-2 rounded-md ${
                activeTab === "analytics"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Analitik
            </button>
          </div>
        </div>
      </div>

      {/* Management Tab */}
      {activeTab === "management" && <AcademicYearManagement />}

      {/* Analytics Tab */}
      {activeTab === "analytics" && (
        <div className="space-y-6">
          {/* Academic Year Selector */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Pilih Tahun Ajaran untuk Analisis
            </h3>
            <div className="max-w-md">
              <AcademicYearSelector
                value={selectedYear}
                onChange={setSelectedYear}
                placeholder="Pilih tahun ajaran untuk melihat statistik"
              />
            </div>
          </div>

          {/* Statistics */}
          {selectedYear && stats && (
            <>
              {/* Academic Year Info */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Statistik Tahun Ajaran: {stats.academicYear.tahunAjaran}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Periode:{" "}
                      {new Date(
                        stats.academicYear.tanggalMulai
                      ).toLocaleDateString("id-ID")}{" "}
                      -{" "}
                      {new Date(
                        stats.academicYear.tanggalSelesai
                      ).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                  {stats.academicYear.isActive && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      Tahun Ajaran Aktif
                    </span>
                  )}
                </div>
              </div>

              {/* Overview Stats */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  icon={FiUsers}
                  title="Total Pengguna"
                  value={stats.statistics.users.total}
                  subtitle={`${stats.statistics.users.active} aktif`}
                  color="blue"
                />
                <StatCard
                  icon={FiUser}
                  title="Siswa"
                  value={stats.statistics.users.students}
                  color="green"
                />
                <StatCard
                  icon={FiUsers}
                  title="Guru"
                  value={stats.statistics.users.teachers}
                  color="purple"
                />
                <StatCard
                  icon={FiFileText}
                  title="Laporan"
                  value={stats.statistics.academicYearData.totalReports}
                  subtitle={`${stats.statistics.academicYearData.averageReportsPerMonth.toFixed(
                    1
                  )}/bulan`}
                  color="indigo"
                />
              </div>

              {/* Academic Year Specific Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  icon={FiFileText}
                  title="Pelanggaran"
                  value={stats.statistics.academicYearData.violationReports}
                  color="red"
                />
                <StatCard
                  icon={FiAward}
                  title="Prestasi"
                  value={stats.statistics.academicYearData.achievementReports}
                  color="yellow"
                />
                <StatCard
                  icon={FiCalendar}
                  title="Kelas"
                  value={stats.statistics.academic.classrooms}
                  color="gray"
                />
              </div>

              {/* Monthly Breakdown Chart */}
              {stats.monthlyBreakdown && stats.monthlyBreakdown.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Trend Bulanan
                  </h3>
                  <div className="space-y-4">
                    {stats.monthlyBreakdown.map((month) => (
                      <div
                        key={month.month}
                        className="flex items-center justify-between py-2"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(month.month + "-01").toLocaleDateString(
                            "id-ID",
                            {
                              year: "numeric",
                              month: "long",
                            }
                          )}
                        </span>
                        <div className="flex space-x-4 text-sm">
                          <span className="text-red-600">
                            {month.violations} pelanggaran
                          </span>
                          <span className="text-green-600">
                            {month.achievements} prestasi
                          </span>
                          <span className="text-gray-600">
                            Total: {month.violations + month.achievements}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Analytics Data */}
          {selectedYear && analytics && (
            <>
              {/* Classroom Performance */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Performa Kelas
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Kelas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Wali Kelas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Siswa
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Pelanggaran
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Prestasi
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Rata-rata Skor
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analytics.classroomAnalytics.map((classroom) => (
                        <tr key={classroom.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {classroom.namaKelas}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {classroom.waliKelas}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {classroom.totalStudents}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {classroom.totalViolations}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {classroom.totalAchievements}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`${
                                classroom.averageScore >= 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {classroom.averageScore}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Teacher Performance */}
              <div className="bg-white shadow rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Performa Guru
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Nama Guru
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          NIP
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Kelas
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Total Laporan
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Pelanggaran
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                          Prestasi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {analytics.teacherAnalytics.map((teacher) => (
                        <tr key={teacher.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {teacher.name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {teacher.nip}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {teacher.classrooms}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {teacher.totalReports}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                            {teacher.violations}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600">
                            {teacher.achievements}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* No Data State */}
          {!selectedYear && (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <FiBarChart3 className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Pilih Tahun Ajaran
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Pilih tahun ajaran di atas untuk melihat analisis dan statistik.
              </p>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="bg-white shadow rounded-lg p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-500">Memuat data...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SuperadminAcademicYear;
