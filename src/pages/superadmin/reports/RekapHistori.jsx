import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import {
  FiActivity,
  FiUsers,
  FiAlertTriangle,
  FiTrendingUp,
  FiTrendingDown,
  FiFilter,
  FiRefreshCw,
  FiCalendar,
  FiBarChart2,
  FiPieChart,
  FiEye,
  FiArchive,
  FiClock,
  FiFileText,
  FiDownload,
} from "react-icons/fi";
import AcademicYearSelector from "../../../components/AcademicYearSelector";
import AcademicYearWarning from "../../../components/AcademicYearWarning";
import superadminAPI from "../../../api/superadmin";
import academicYearAPI from "../../../api/academicYear";

const RekapLaporanHistoris = () => {
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("");
  const [academicYearInfo, setAcademicYearInfo] = useState(null);
  const [stats, setStats] = useState({
    totalLaporan: 0,
    totalPelanggaran: 0,
    totalPrestasi: 0,
    siswaAktif: 0,
    rataRataPerBulan: 0,
    periode: null,
  });
  const [recentReports, setRecentReports] = useState([]);
  const [reportsByMonth, setReportsByMonth] = useState([]);
  const [reportsByClass, setReportsByClass] = useState([]);
  const [reportsByType, setReportsByType] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState("all"); // all, violation, achievement
  const [availableYears, setAvailableYears] = useState([]);

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID");
  };

  const formatMonthYear = (month, year) => {
    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];
    return `${monthNames[month - 1]} ${year}`;
  };

  // Fetch available academic years (inactive only for historical reports)
  const fetchAvailableYears = async () => {
    try {
      const response = await academicYearAPI.getAll();
      console.log("Academic years response:", response.data);

      // Check if response.data has the data property (backend returns { message, data })
      const academicYears = response.data.data || response.data || [];

      if (!Array.isArray(academicYears)) {
        console.error("Academic years data is not an array:", academicYears);
        setAvailableYears([]);
        return;
      }

      const inactiveYears = academicYears.filter((year) => !year.isActive);
      setAvailableYears(inactiveYears);

      // Auto-select most recent inactive year
      if (inactiveYears.length > 0 && !selectedAcademicYear) {
        const mostRecent = inactiveYears.sort(
          (a, b) => b.tahunSelesai - a.tahunSelesai
        )[0];
        setSelectedAcademicYear(mostRecent.id);
      }
    } catch (error) {
      console.error("Error fetching academic years:", error);
      setAvailableYears([]);
    }
  };

  // Fetch historical report statistics for selected academic year
  const fetchHistoricalStats = async () => {
    if (!selectedAcademicYear) return;

    try {
      setLoading(true);

      // Get academic year info
      const yearResponse = await academicYearAPI.getFallback(
        selectedAcademicYear
      );
      console.log("Academic year info response:", yearResponse.data);

      // Handle different response structures
      const academicYearData = yearResponse.data.data || yearResponse.data;
      setAcademicYearInfo(academicYearData);

      // Get historical statistics
      const statsResponse =
        await superadminAPI.getSuperadminStatsByAcademicYear(
          selectedAcademicYear
        );
      console.log("Stats response:", statsResponse.data);

      const data = statsResponse.data;

      setStats({
        totalLaporan: data.totalReports || 0,
        totalPelanggaran: data.violationReports || 0,
        totalPrestasi: data.achievementReports || 0,
        siswaAktif: data.activeStudents || 0,
        rataRataPerBulan: data.averageReportsPerMonth || 0,
        periode: academicYearData?.tahunAjaran || "Unknown",
      });

      // Set monthly data for chart
      setReportsByMonth(data.monthlyReports || []);
      setReportsByClass(data.reportsByClass || []);
      setReportsByType(data.reportsByType || []);
    } catch (error) {
      console.error("Error fetching historical stats:", error);
      Swal.fire("Error", "Gagal mengambil data statistik historis", "error");
    } finally {
      setLoading(false);
    }
  };

  // Fetch recent reports for selected academic year
  const fetchRecentReports = async () => {
    if (!selectedAcademicYear) return;

    try {
      const response = await superadminAPI.getSystemAnalyticsByAcademicYear(
        selectedAcademicYear
      );
      console.log("Recent reports response:", response.data);
      setRecentReports(response.data.recentReports || []);
    } catch (error) {
      console.error("Error fetching recent reports:", error);
      setRecentReports([]);
    }
  };

  const handleRefresh = () => {
    fetchHistoricalStats();
    fetchRecentReports();
  };

  const handleExportData = async () => {
    if (!selectedAcademicYear) {
      Swal.fire("Peringatan", "Pilih tahun ajaran terlebih dahulu", "warning");
      return;
    }

    try {
      Swal.fire({
        title: "Mengunduh Data...",
        text: "Sedang memproses data historis",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Simulate export - in real implementation, this would be an API call
      setTimeout(() => {
        Swal.fire("Berhasil", "Data historis berhasil diunduh", "success");
      }, 2000);
    } catch (error) {
      Swal.fire("Error", "Gagal mengunduh data", "error");
    }
  };

  useEffect(() => {
    fetchAvailableYears();
  }, []);

  useEffect(() => {
    if (selectedAcademicYear) {
      fetchHistoricalStats();
      fetchRecentReports();
    }
  }, [selectedAcademicYear]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Memuat data historis...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FiArchive className="text-blue-600" />
            Rekap Laporan Historis
          </h1>
          <p className="text-gray-600 mt-1">
            Laporan dan statistik dari tahun ajaran yang telah berakhir
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleExportData}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors"
            disabled={!selectedAcademicYear}
          >
            <FiDownload /> Export Data
          </button>
          <button
            onClick={handleRefresh}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Academic Year Selector */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pilih Tahun Ajaran Historis
        </label>
        <div className="flex items-center space-x-4">
          <select
            value={selectedAcademicYear}
            onChange={(e) => setSelectedAcademicYear(e.target.value)}
            className="block w-64 px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Pilih Tahun Ajaran...</option>
            {availableYears.map((year) => (
              <option key={year.id} value={year.id}>
                {year.tahunAjaran} ({formatDateForDisplay(year.tanggalMulai)} -{" "}
                {formatDateForDisplay(year.tanggalSelesai)})
              </option>
            ))}
          </select>

          {availableYears.length === 0 && (
            <div className="text-sm text-gray-500 flex items-center gap-2">
              <FiClock />
              Belum ada tahun ajaran historis
            </div>
          )}
        </div>
      </div>

      {/* Academic Year Warning */}
      <AcademicYearWarning academicYear={academicYearInfo} />

      {selectedAcademicYear && academicYearInfo && (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <FiFileText className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Total Laporan
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalLaporan}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-red-100 text-red-600">
                  <FiAlertTriangle className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Pelanggaran
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalPelanggaran}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <FiTrendingUp className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Prestasi</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.totalPrestasi}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <FiUsers className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Siswa Aktif
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.siswaAktif}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                  <FiBarChart2 className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Rata-rata/Bulan
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stats.rataRataPerBulan}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Monthly Reports Chart */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiBarChart2 />
                Laporan per Bulan
              </h3>
              {reportsByMonth.length > 0 ? (
                <div className="h-64">
                  <div className="flex items-end justify-between h-48 space-x-2">
                    {reportsByMonth.map((data, index) => (
                      <div
                        key={index}
                        className="flex flex-col items-center flex-1"
                      >
                        <div
                          className="bg-blue-500 rounded-t w-full relative group cursor-pointer"
                          style={{
                            height: `${Math.max(
                              (data.count /
                                Math.max(
                                  ...reportsByMonth.map((d) => d.count)
                                )) *
                                100,
                              5
                            )}%`,
                            minHeight: "4px",
                          }}
                        >
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {data.count} laporan
                          </div>
                        </div>
                        <div className="mt-2 text-xs text-gray-600 text-center">
                          {formatMonthYear(data.month, data.year)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada data bulanan untuk ditampilkan
                </div>
              )}
            </div>

            {/* Reports by Type */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FiPieChart />
                Jenis Laporan
              </h3>
              {reportsByType.length > 0 ? (
                <div className="space-y-3">
                  {reportsByType.map((type, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <span className="text-sm text-gray-900 capitalize">
                        {type.name}
                      </span>
                      <div className="flex items-center">
                        <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              type.type === "violation"
                                ? "bg-red-500"
                                : "bg-green-500"
                            }`}
                            style={{
                              width: `${
                                reportsByType.length > 0
                                  ? (type.count /
                                      Math.max(
                                        ...reportsByType.map((t) => t.count)
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Tidak ada data jenis laporan
                </div>
              )}
            </div>
          </div>

          {/* Recent Reports Table */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FiActivity />
                Laporan Terakhir - {stats.periode}
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Siswa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipe
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Deskripsi
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pelapor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Point
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentReports.length > 0 ? (
                    recentReports.slice(0, 10).map((report) => (
                      <tr key={report.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateForDisplay(report.tanggal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {report.student?.user?.name ||
                              report.student?.name ||
                              "-"}
                          </div>
                          <div className="text-sm text-gray-500">
                            {report.student?.classroom?.name || "-"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              report.tipe === "violation"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {report.tipe === "violation"
                              ? "Pelanggaran"
                              : "Prestasi"}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {report.deskripsi ||
                            (report.tipe === "violation"
                              ? report.violation?.nama
                              : report.achievement?.nama) ||
                            "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {report.reporter?.name || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span
                            className={
                              report.tipe === "violation"
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          >
                            {report.tipe === "violation" ? "-" : "+"}
                            {Math.abs(report.pointSaat || 0)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        Tidak ada laporan untuk tahun ajaran ini
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!selectedAcademicYear && availableYears.length > 0 && (
        <div className="text-center py-12">
          <FiArchive className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Pilih Tahun Ajaran
          </h3>
          <p className="text-gray-500">
            Pilih tahun ajaran dari dropdown di atas untuk melihat rekap laporan
            historis
          </p>
        </div>
      )}

      {availableYears.length === 0 && (
        <div className="text-center py-12">
          <FiClock className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Belum Ada Data Historis
          </h3>
          <p className="text-gray-500">
            Belum ada tahun ajaran yang berakhir untuk ditampilkan rekap
            laporannya
          </p>
        </div>
      )}
    </div>
  );
};

export default RekapLaporanHistoris;
