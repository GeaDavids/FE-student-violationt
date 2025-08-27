import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserGraduate,
  FaExclamationTriangle,
  FaMedal,
  FaChalkboardTeacher,
} from "react-icons/fa";
import { FiUsers } from "react-icons/fi";
import bkAPI from "../../api/bk";
import academicYearAPI from "../../api/academicYear";

const DashboardBK = () => {
  // Stats for classroom (not used in dashboard cards)
  const [stats, setStats] = useState([]);
  // Dashboard summary and recent violations
  const [summary, setSummary] = useState({
    pelanggaran: 0,
    prestasi: 0,
    penanganan: 0,
    surat: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentViolations, setRecentViolations] = useState([]);
  const [loadingViolations, setLoadingViolations] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ambil tahun ajaran aktif
        const tahunRes = await academicYearAPI.getCurrent();
        const tahunAjaranId = tahunRes.data?.data?.id;
        // Fetch classroom stats dengan tahun ajaran aktif
        let res;
        if (tahunAjaranId) {
          res = await bkAPI.getClassroomStats(tahunAjaranId);
        } else {
          res = await bkAPI.getClassroomStats();
        }
        setStats(res.data.data || []);
      } catch (err) {
        setError("Gagal memuat statistik kelas");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const ChartBarIcon = () => (
    <svg
      className="w-5 h-5 text-green-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
      />
    </svg>
  );

  // Fetch tahun ajaran aktif, dashboard summary, and recent violations
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get active academic year
        const tahunRes = await academicYearAPI.getCurrent();
        const tahunAjaranId = tahunRes.data?.data?.id;
        // Fetch summary
        const resSummary = await bkAPI.getDashboardSummary(tahunAjaranId);
        setSummary(
          resSummary.data || {
            pelanggaran: 0,
            prestasi: 0,
            penanganan: 0,
            surat: 0,
          }
        );
        // Fetch recent violations
        setLoadingViolations(true);
        const resViol = await bkAPI.getRecentViolations(tahunAjaranId);
        setRecentViolations(resViol.data.data || []);
        setLoadingViolations(false);
      } catch (err) {
        setError("Gagal memuat data dashboard");
        setLoadingViolations(false);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <h1 className="text-3xl font-bold tracking-tight text-gray-800 drop-shadow">
          Dashboard BK
        </h1>
      </div>

      {/* Shortcut */}
      <div className="mb-8 flex flex-wrap gap-4">
        <button
          onClick={() => navigate("/bk/monitoring-siswa")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow transition-all flex items-center gap-2"
        >
          <FaUserGraduate /> Monitoring Siswa
        </button>
      </div>

      {/* Ringkasan bulan ini */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-red-400 animate-fade-in">
          <div className="flex justify-center mb-2">
            <FaExclamationTriangle className="text-red-500 text-3xl" />
          </div>
          <div className="text-3xl font-bold text-red-600 mb-1">
            {summary.pelanggaran}
          </div>
          <span className="inline-block bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full mb-1">
            Pelanggaran Bulan Ini
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-green-400 animate-fade-in">
          <div className="flex justify-center mb-2">
            <FaMedal className="text-green-500 text-3xl" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-1">
            {summary.prestasi}
          </div>
          <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full mb-1">
            Prestasi Bulan Ini
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-yellow-400 animate-fade-in">
          <div className="flex justify-center mb-2">
            <FaChalkboardTeacher className="text-yellow-500 text-3xl" />
          </div>
          <div className="text-3xl font-bold text-yellow-600 mb-1">
            {summary.penanganan}
          </div>
          <span className="inline-block bg-yellow-100 text-yellow-700 text-xs px-3 py-1 rounded-full mb-1">
            Penanganan Bulan Ini
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-blue-400 animate-fade-in">
          <div className="flex justify-center mb-2">
            <FaExclamationTriangle className="text-blue-500 text-3xl" />
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-1">
            {summary.surat}
          </div>
          <span className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full mb-1">
            Surat Peringatan Bulan Ini
          </span>
        </div>
      </div>

      {/* Loading state */}
      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center text-red-500 font-semibold">{error}</div>
      ) : (
        <>
          {/* Tabel pelanggaran terbaru (tampilan baru) */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-8">
            <div className="flex items-center justify-between bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <FaExclamationTriangle className="text-red-500" />
                Pelanggaran Terbaru
              </h2>
              <button
                onClick={() => navigate("/bk/laporan-siswa")}
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold rounded shadow"
              >
                Lihat Semua
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">
                      Dibuat
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">
                      Siswa
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">
                      Tipe
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">
                      Tindakan
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">
                      Tanggal
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">
                      Poin
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">
                      Pelapor
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {recentViolations && recentViolations.length > 0 ? (
                    recentViolations.map((report, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-red-50 transition-colors duration-150"
                      >
                        {/* DIBUAT */}
                        <td className="px-3 py-2 text-center text-xs text-gray-500 whitespace-nowrap">
                          {new Date(report.tanggal).toLocaleDateString(
                            "id-ID",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "2-digit",
                            }
                          )}
                          ,{" "}
                          {new Date(report.tanggal).toLocaleTimeString(
                            "id-ID",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </td>
                        {/* SISWA */}
                        <td className="px-3 py-2 text-left text-xs">
                          <div className="font-semibold text-gray-800">
                            {report.student?.nama || "-"}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {report.student?.kelas || "-"} •{" "}
                            {report.student?.nisn || "-"}
                          </div>
                        </td>
                        {/* TIPE */}
                        <td className="px-3 py-2 text-center text-xs">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-200">
                            <FaExclamationTriangle className="inline text-red-400" />
                          </span>
                        </td>
                        {/* TINDAKAN */}
                        <td className="px-3 py-2 text-left text-xs">
                          <div className="font-semibold text-gray-800">
                            {report.item?.nama || "-"}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {report.item?.kategori || "Kedisiplinan"}
                          </div>
                        </td>
                        {/* TANGGAL */}
                        <td className="px-3 py-2 text-center text-xs">
                          {new Date(report.tanggal).toLocaleDateString(
                            "id-ID",
                            { day: "2-digit", month: "long", year: "numeric" }
                          )}
                        </td>
                        {/* POIN */}
                        <td className="px-3 py-2 text-center text-xs">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-red-50 text-red-700 font-bold border border-red-200">
                            -{report.item?.point || 0}
                          </span>
                        </td>
                        {/* PELAPOR */}
                        <td className="px-3 py-2 text-center text-xs">
                          <div className="font-semibold text-gray-800">
                            {report.pelapor?.nama || "-"}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {report.pelapor?.role || "Bk"}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        className="text-center text-gray-400 py-6"
                      >
                        Tidak ada pelanggaran terbaru.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
export default DashboardBK;
