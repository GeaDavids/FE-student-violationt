import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard BK</h1>
      {/* Shortcut */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={() => navigate("/bk/monitoring")}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded shadow"
        >
          Monitoring Siswa
        </button>
        <button
          onClick={() => navigate("/bk/rekap")}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow"
        >
          Rekap Laporan
        </button>
        {/* Tambah shortcut lain jika perlu */}
      </div>
      {/* Ringkasan total */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold">{totalSiswa}</div>
          <div className="text-gray-600">Total Siswa</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-red-600">
            {totalPelanggaran}
          </div>
          <div className="text-gray-600">Total Pelanggaran</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4 text-center">
          <div className="text-2xl font-bold text-green-600">
            {totalPrestasi}
          </div>
          <div className="text-gray-600">Total Prestasi</div>
        </div>
      </div>

      {/* Visual summary tabel batang */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2">Statistik Kelas</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Kelas</th>
                <th className="px-4 py-2 border">Pelanggaran</th>
                <th className="px-4 py-2 border">Prestasi</th>
              </tr>
            </thead>
            <tbody>
              {stats &&
                stats.map((kelas) => (
                  <tr
                    key={kelas.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() =>
                      navigate(`/bk/classrooms/${kelas.id}/students`)
                    }
                  >
                    <td className="px-4 py-2 border font-semibold">
                      {kelas.namaKelas}
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="flex items-center">
                        <div
                          className="bg-red-500 h-4"
                          style={{
                            width: `${Math.max(kelas.jmlPelanggaran, 2) * 8}px`,
                          }}
                        ></div>
                        <span className="ml-2">{kelas.jmlPelanggaran}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2 border">
                      <div className="flex items-center">
                        <div
                          className="bg-green-500 h-4"
                          style={{
                            width: `${Math.max(kelas.jmlPrestasi, 2) * 8}px`,
                          }}
                        ></div>
                        <span className="ml-2">{kelas.jmlPrestasi}</span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default DashboardBK;
