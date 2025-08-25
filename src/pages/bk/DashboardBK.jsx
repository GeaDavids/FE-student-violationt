import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUserGraduate,
  FaExclamationTriangle,
  FaMedal,
  FaChalkboardTeacher,
} from "react-icons/fa";
import bkAPI from "../../api/bk";
import academicYearAPI from "../../api/academicYear";

const DashboardBK = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);
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

  useEffect(() => {
    const fetchReports = async () => {
      setLoadingReports(true);
      try {
        // Ganti endpoint ini jika sudah ada endpoint khusus laporan terbaru
        const res = (await bkAPI.getRecentReports)
          ? bkAPI.getRecentReports()
          : Promise.resolve({ data: [] });
        setRecentReports(res.data.data || []);
      } catch (err) {
        setRecentReports([]);
      } finally {
        setLoadingReports(false);
      }
    };
    fetchReports();
  }, []);

  // Hitung ringkasan total
  let totalSiswa = 0,
    totalPelanggaran = 0,
    totalPrestasi = 0;
  if (stats) {
    stats.forEach((k) => {
      totalSiswa += k.jmlSiswa;
      totalPelanggaran += k.jmlPelanggaran;
      totalPrestasi += k.jmlPrestasi;
    });
  }

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FaChalkboardTeacher className="text-blue-600 text-3xl" />
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-800 drop-shadow">
          Dashboard BK
        </h1>
      </div>

      {/* Shortcut */}
      <div className="mb-8 flex flex-wrap gap-4">
        <button
          onClick={() => navigate("/bk/monitoring")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-5 py-2 rounded-lg shadow transition-all flex items-center gap-2"
        >
          <FaUserGraduate /> Monitoring Siswa
        </button>
        <button
          onClick={() => navigate("/bk/rekap")}
          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow transition-all flex items-center gap-2"
        >
          <FaMedal /> Rekap Laporan
        </button>
      </div>

      {/* Ringkasan total */}
      <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-blue-400 animate-fade-in">
          <div className="flex justify-center mb-2">
            <FaUserGraduate className="text-blue-500 text-3xl" />
          </div>
          <div className="text-3xl font-bold text-blue-700 mb-1">
            {totalSiswa}
          </div>
          <span className="inline-block bg-blue-100 text-blue-700 text-xs px-3 py-1 rounded-full mb-1">
            Total Siswa
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-red-400 animate-fade-in">
          <div className="flex justify-center mb-2">
            <FaExclamationTriangle className="text-red-500 text-3xl" />
          </div>
          <div className="text-3xl font-bold text-red-600 mb-1">
            {totalPelanggaran}
          </div>
          <span className="inline-block bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full mb-1">
            Total Pelanggaran
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 text-center border-t-4 border-green-400 animate-fade-in">
          <div className="flex justify-center mb-2">
            <FaMedal className="text-green-500 text-3xl" />
          </div>
          <div className="text-3xl font-bold text-green-600 mb-1">
            {totalPrestasi}
          </div>
          <span className="inline-block bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full mb-1">
            Total Prestasi
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
          {/* Visual summary tabel kelas layout baru */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 border-b border-gray-200">
              <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                <ChartBarIcon />
                Statistik Kelas
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase rounded-tl-md">
                      Kode
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">
                      Nama Kelas
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">
                      Siswa
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">
                      Pelanggaran
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">
                      Prestasi
                    </th>
                    <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase rounded-tr-md">
                      Avg Point
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats && stats.length > 0 ? (
                    stats.map((kelas, idx) => (
                      <tr
                        key={kelas.id}
                        className="hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                        onClick={() =>
                          navigate(`/bk/classrooms/${kelas.id}/students`)
                        }
                      >
                        {/* Kode */}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                            <FaUserGraduate className="inline text-blue-400" />
                            {kelas.kodeKelas ||
                              kelas.kode ||
                              kelas.namaKelas?.split(" ").join("-") ||
                              "-"}
                          </span>
                        </td>
                        {/* Nama Kelas */}
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 text-gray-700 font-semibold">
                            <span className="flex items-center">X</span>
                            {kelas.namaKelas}
                          </span>
                        </td>
                        {/* Siswa */}
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800">
                            <FaUserGraduate className="inline text-gray-400" />
                            {kelas.jmlSiswa}
                          </span>
                        </td>
                        {/* Pelanggaran */}
                        <td className="px-3 py-2 whitespace-nowrap text-center">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300">
                            <FaExclamationTriangle className="inline text-red-400" />
                            {kelas.jmlPelanggaran}
                          </span>
                        </td>
                        {/* Prestasi */}
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300">
                            <FaMedal className="inline text-green-400" />
                            {kelas.jmlPrestasi}
                          </span>
                        </td>
                        {/* Avg Point */}
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                              kelas.avrgPoint < 0
                                ? "bg-red-50 text-red-600"
                                : "bg-green-50 text-green-600"
                            }`}
                          >
                            <span className="inline-block rotate-45">↗</span>
                            {kelas.avrgPoint ?? "-"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center text-gray-400 py-6"
                      >
                        Tidak ada data kelas.
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
