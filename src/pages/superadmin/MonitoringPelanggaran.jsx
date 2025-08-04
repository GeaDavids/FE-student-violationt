import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
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
} from "react-icons/fi";

const MonitoringPelanggaran = () => {
  const [stats, setStats] = useState({
    totalLaporan: 0,
    laporanBulanIni: 0,
    siswaBeresiko: 0,
    pelanggaranTerbanyak: null,
  });
  const [recentViolations, setRecentViolations] = useState([]);
  const [topViolators, setTopViolators] = useState([]);
  const [violationsByClass, setViolationsByClass] = useState([]);
  const [violationsByType, setViolationsByType] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState("month"); // week, month, year
  const [selectedClass, setSelectedClass] = useState("");
  const [kelasList, setKelasList] = useState([]);

  const token = localStorage.getItem("token");

  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString('id-ID');
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/monitoring/stats", axiosConfig);
      setStats(res.data);
    } catch (err) {
      console.error("Gagal mengambil statistik:", err);
    }
  };

  const fetchRecentViolations = async () => {
    try {
      const res = await axios.get(`/api/monitoring/recent-violations?limit=10`, axiosConfig);
      setRecentViolations(res.data);
    } catch (err) {
      console.error("Gagal mengambil pelanggaran terbaru:", err);
    }
  };

  const fetchTopViolators = async () => {
    try {
      const res = await axios.get(`/api/monitoring/top-violators?period=${filterPeriod}&classId=${selectedClass}`, axiosConfig);
      setTopViolators(res.data);
    } catch (err) {
      console.error("Gagal mengambil data pelanggar terbanyak:", err);
    }
  };

  const fetchViolationsByClass = async () => {
    try {
      const res = await axios.get(`/api/monitoring/violations-by-class?period=${filterPeriod}`, axiosConfig);
      setViolationsByClass(res.data);
    } catch (err) {
      console.error("Gagal mengambil data pelanggaran per kelas:", err);
    }
  };

  const fetchViolationsByType = async () => {
    try {
      const res = await axios.get(`/api/monitoring/violations-by-type?period=${filterPeriod}`, axiosConfig);
      setViolationsByType(res.data);
    } catch (err) {
      console.error("Gagal mengambil data pelanggaran per jenis:", err);
    }
  };

  const fetchKelas = async () => {
    try {
      const res = await axios.get("/api/classrooms", axiosConfig);
      setKelasList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data kelas:", err);
    }
  };

  const fetchAllData = async () => {
    await Promise.all([
      fetchStats(),
      fetchRecentViolations(),
      fetchTopViolators(),
      fetchViolationsByClass(),
      fetchViolationsByType(),
    ]);
    setLoading(false);
  };

  useEffect(() => {
    fetchKelas();
    fetchAllData();
  }, []);

  useEffect(() => {
    fetchTopViolators();
    fetchViolationsByClass();
    fetchViolationsByType();
  }, [filterPeriod, selectedClass]);

  const handlePeriodChange = (e) => {
    setFilterPeriod(e.target.value);
  };

  const handleClassChange = (e) => {
    setSelectedClass(e.target.value);
  };

  const refreshData = () => {
    setLoading(true);
    fetchAllData();
  };

  const viewStudentDetail = (siswa) => {
    Swal.fire({
      title: `<strong>Detail Siswa</strong>`,
      html: `
        <div class="text-left">
          <p><b>Nama:</b> ${siswa.name || siswa.user?.name}</p>
          <p><b>NISN:</b> ${siswa.nisn}</p>
          <p><b>Kelas:</b> ${siswa.classroom?.namaKelas || "-"}</p>
          <p><b>Total Pelanggaran:</b> ${siswa.totalViolations || 0}</p>
          <p><b>Total Poin:</b> ${siswa.totalPoin || 0}</p>
          <p><b>Status:</b> ${siswa.totalPoin >= 100 ? '<span class="text-red-600 font-bold">BERESIKO TINGGI</span>' : siswa.totalPoin >= 50 ? '<span class="text-yellow-600 font-bold">PERLU PERHATIAN</span>' : '<span class="text-green-600">BAIK</span>'}</p>
        </div>
      `,
      icon: "info",
      width: "500px"
    });
  };

  const viewViolationDetail = (violation) => {
    Swal.fire({
      title: `<strong>Detail Pelanggaran</strong>`,
      html: `
        <div class="text-left">
          <p><b>Siswa:</b> ${violation.siswa?.name || violation.siswa?.user?.name}</p>
          <p><b>Kelas:</b> ${violation.siswa?.classroom?.namaKelas || "-"}</p>
          <p><b>Jenis Pelanggaran:</b> ${violation.violation?.namaViolation}</p>
          <p><b>Kategori:</b> ${violation.violation?.kategori}</p>
          <p><b>Poin:</b> ${violation.violation?.poin}</p>
          <p><b>Tanggal:</b> ${formatDateForDisplay(violation.tglKejadian)}</p>
          <p><b>Tempat:</b> ${violation.tempatKejadian || "-"}</p>
          <p><b>Status:</b> ${violation.status}</p>
          <div class="mt-3">
            <p><b>Deskripsi:</b></p>
            <p class="text-gray-600 italic bg-gray-50 p-2 rounded">${violation.deskripsi || "Tidak ada deskripsi"}</p>
          </div>
        </div>
      `,
      icon: "info",
      width: "600px"
    });
  };

  const getRiskLevel = (poin) => {
    if (poin >= 100) return { level: "TINGGI", color: "text-red-600", bg: "bg-red-100" };
    if (poin >= 50) return { level: "SEDANG", color: "text-yellow-600", bg: "bg-yellow-100" };
    return { level: "RENDAH", color: "text-green-600", bg: "bg-green-100" };
  };

  const periodLabels = {
    week: "Minggu Ini",
    month: "Bulan Ini", 
    year: "Tahun Ini"
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
          <FiActivity /> Monitoring Pelanggaran
        </h2>
        <div className="flex gap-2">
          <select
            value={filterPeriod}
            onChange={handlePeriodChange}
            className="border rounded px-3 py-2"
          >
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
            <option value="year">Tahun Ini</option>
          </select>
          <select
            value={selectedClass}
            onChange={handleClassChange}
            className="border rounded px-3 py-2"
          >
            <option value="">Semua Kelas</option>
            {kelasList.map((kelas) => (
              <option key={kelas.id} value={kelas.id}>
                {kelas.namaKelas}
              </option>
            ))}
          </select>
          <button
            onClick={refreshData}
            className="bg-[#003366] text-white px-4 py-2 rounded flex items-center gap-2"
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Laporan</p>
              <p className="text-2xl font-bold text-[#003366]">{stats.totalLaporan}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FiBarChart2 className="text-blue-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{periodLabels[filterPeriod]}</p>
              <p className="text-2xl font-bold text-green-600">{stats.laporanBulanIni}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <FiTrendingUp className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Siswa Beresiko</p>
              <p className="text-2xl font-bold text-red-600">{stats.siswaBeresiko}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <FiAlertTriangle className="text-red-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pelanggaran Terbanyak</p>
              <p className="text-lg font-bold text-purple-600">
                {stats.pelanggaranTerbanyak?.namaViolation || "Tidak ada data"}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <FiPieChart className="text-purple-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Recent Violations */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
            <FiCalendar /> Pelanggaran Terbaru
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {recentViolations.length > 0 ? (
              recentViolations.map((violation) => (
                <div 
                  key={violation.id} 
                  className="border-l-4 border-blue-400 pl-4 py-2 hover:bg-gray-50 cursor-pointer"
                  onClick={() => viewViolationDetail(violation)}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{violation.siswa?.name || violation.siswa?.user?.name}</p>
                      <p className="text-sm text-gray-600">{violation.violation?.namaViolation}</p>
                      <p className="text-xs text-gray-500">{formatDateForDisplay(violation.tglKejadian)}</p>
                    </div>
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                      {violation.violation?.poin} poin
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Tidak ada pelanggaran terbaru</p>
            )}
          </div>
        </div>

        {/* Top Violators */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
            <FiUsers /> Siswa dengan Pelanggaran Terbanyak
          </h3>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {topViolators.length > 0 ? (
              topViolators.map((siswa, index) => {
                const risk = getRiskLevel(siswa.totalPoin);
                return (
                  <div 
                    key={siswa.id} 
                    className="flex items-center justify-between p-3 border rounded hover:bg-gray-50 cursor-pointer"
                    onClick={() => viewStudentDetail(siswa)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-gray-200 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{siswa.name || siswa.user?.name}</p>
                        <p className="text-sm text-gray-600">{siswa.classroom?.namaKelas}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{siswa.totalPoin} poin</p>
                      <span className={`${risk.bg} ${risk.color} px-2 py-1 rounded text-xs`}>
                        {risk.level}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">Tidak ada data pelanggar</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Violations by Class */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
            <FiBarChart2 /> Pelanggaran per Kelas
          </h3>
          <div className="space-y-3">
            {violationsByClass.length > 0 ? (
              violationsByClass.map((kelas) => (
                <div key={kelas.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{kelas.namaKelas}</p>
                    <p className="text-sm text-gray-600">{kelas.jmlSiswa} siswa</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{kelas.totalViolations || 0}</p>
                    <p className="text-xs text-gray-500">pelanggaran</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Tidak ada data kelas</p>
            )}
          </div>
        </div>

        {/* Violations by Type */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
            <FiPieChart /> Jenis Pelanggaran Terbanyak
          </h3>
          <div className="space-y-3">
            {violationsByType.length > 0 ? (
              violationsByType.map((violation) => (
                <div key={violation.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{violation.namaViolation}</p>
                    <p className="text-sm text-gray-600">{violation.kategori}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">{violation.count || 0}</p>
                    <p className="text-xs text-gray-500">kasus</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">Tidak ada data jenis pelanggaran</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-[#003366] mb-4">Aksi Cepat</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <button
            onClick={() => window.location.href = '/laporan-pelanggaran'}
            className="bg-blue-500 text-white px-4 py-2 rounded flex items-center gap-2 justify-center"
          >
            <FiEye /> Lihat Semua Laporan
          </button>
          <button
            onClick={() => window.location.href = '/kelola-siswa'}
            className="bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2 justify-center"
          >
            <FiUsers /> Kelola Siswa
          </button>
          <button
            onClick={() => window.location.href = '/kelola-violation'}
            className="bg-yellow-500 text-white px-4 py-2 rounded flex items-center gap-2 justify-center"
          >
            <FiAlertTriangle /> Kelola Pelanggaran
          </button>
          <button
            onClick={() => Swal.fire("Info", "Fitur export akan segera tersedia", "info")}
            className="bg-purple-500 text-white px-4 py-2 rounded flex items-center gap-2 justify-center"
          >
            <FiTrendingUp /> Export Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default MonitoringPelanggaran;
