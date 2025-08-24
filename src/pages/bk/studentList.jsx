import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import bkAPI from "../../api/bk";
import { getTahunAjaran } from "../../api/rekap";

const StudentList = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tahunOptions, setTahunOptions] = useState([]);
  const [selectedTahun, setSelectedTahun] = useState("all");

  // Icon Components
  const ArrowLeftIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  );

  const SearchIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );

  const UserGroupIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  );

  const EyeIcon = () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="relative">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200"></div>
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
      </div>
      <div className="mt-3 text-center">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">Memuat data siswa...</h3>
        <p className="text-slate-500 text-xs">Mohon tunggu sebentar</p>
      </div>
    </div>
  );

  useEffect(() => {
    const fetchTahun = async () => {
      try {
        const tahunList = await getTahunAjaran();
        setTahunOptions(tahunList);
        // Default tetap 'all', tidak perlu setSelectedTahun di sini
      } catch {
        setTahunOptions([]);
      }
    };
    fetchTahun();
  }, []);

  useEffect(() => {
    if (!selectedTahun) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Jika 'all', kirim undefined agar backend handle semua tahun ajaran
        const tahunParam = selectedTahun === "all" ? undefined : selectedTahun;
        const res = await bkAPI.getStudentsInClassroom(classroomId, tahunParam);
        setData(res.data.data || []);
      } catch (err) {
        setError("Gagal memuat data siswa");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classroomId, selectedTahun]);

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 50) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (score >= 25) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getScoreIcon = (score) => {
    if (score >= 75) return '🚨';
    if (score >= 50) return '⚠️';
    if (score >= 25) return '⚡';
    return '✅';
  };

  const filteredData = data.filter(
    (siswa) =>
      siswa.nisn.toLowerCase().includes(search.toLowerCase()) ||
      siswa.nama.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-6xl mx-auto p-3 sm:p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md border border-slate-200/60 mb-4 backdrop-blur-sm bg-white/90">
          <div className="px-4 py-3 border-b border-slate-200/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate(-1)}
                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all duration-200"
                >
                  <ArrowLeftIcon />
                </button>
                <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-md">
                  <UserGroupIcon className="text-white w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Daftar Siswa Kelas
                  </h1>
                  <p className="text-slate-600 text-xs">Kelola dan pantau data siswa dalam kelas</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-2.5 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-full border border-blue-200">
                  <span className="text-xs font-medium text-blue-700">{filteredData.length} Siswa</span>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 border-b border-slate-200/60">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Tahun Ajaran</label>
                <select
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all duration-200 text-slate-900 font-medium text-sm bg-white"
                  value={selectedTahun}
                  onChange={(e) => setSelectedTahun(e.target.value)}
                >
                  <option value="all">Semua Tahun Ajaran</option>
                  {tahunOptions.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tahunAjaran || t.nama || t.tahun || t.id}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-slate-700">Pencarian</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="text-slate-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari NISN atau Nama Siswa..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100 transition-all duration-200 text-slate-900 font-medium text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-lg">❌</span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">Terjadi Kesalahan</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-8">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-lg flex items-center justify-center mb-3">
                  <UserGroupIcon className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-1">Tidak ada data siswa</h3>
                <p className="text-slate-500 text-sm">Tidak ditemukan siswa yang sesuai dengan pencarian</p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          No
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Siswa
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Total Poin
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Pelanggaran
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Prestasi
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-slate-700 uppercase tracking-wider">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {filteredData.map((siswa, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors duration-150">
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-600">
                            {idx + 1}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-sm">
                                <span className="text-sm text-white">👤</span>
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-900">{siswa.nama}</div>
                                <div className="text-xs text-slate-500">NISN: {siswa.nisn}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getScoreColor(siswa.totalScore)}`}>
                              <span>{getScoreIcon(siswa.totalScore)}</span>
                              <span>{siswa.totalScore}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-sm font-medium">
                              <span>⚠️</span>
                              <span>{siswa.pelanggaran}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium">
                              <span>🏆</span>
                              <span>{siswa.prestasi}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-center">
                            <button
                              onClick={() => navigate(`/bk/students/${siswa.nisn}/detail`)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors duration-200"
                            >
                              <EyeIcon />
                              <span>Detail</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentList;
