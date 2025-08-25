import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import bkAPI from "../../api/bk";

const MonitoringSiswa = () => {
  const [data, setData] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await bkAPI.getClassroomStats();
        setData(res.data.data || []);
      } catch (err) {
        setError("Gagal memuat data kelas");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Icon Components
  const SearchIcon = () => (
    <svg
      className="w-5 h-5 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );

  const UserIcon = () => (
    <svg
      className="w-5 h-5 text-blue-500"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );

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

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-gray-600">Memuat data...</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        {/* Header Section */}
        <div className="mb-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-1.5 rounded-md">
                <ChartBarIcon />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Monitoring Siswa
                </h1>
                <p className="text-gray-600 text-xs">
                  Pantau dan kelola data siswa serta kelas
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Student Search Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-3 py-2">
            <div className="flex items-center gap-2">
              <UserIcon />
              <h2 className="text-base font-semibold text-white">
                Pencarian Siswa
              </h2>
            </div>
          </div>

          <div className="p-3">
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setStudentLoading(true);
                setStudentError(null);
                setStudentResults([]);
                try {
                  const res = await bkAPI.searchStudents(studentSearch);
                  setStudentResults(res.data.data || []);
                } catch (err) {
                  setStudentError("Gagal mencari siswa");
                } finally {
                  setStudentLoading(false);
                }
              }}
              className="space-y-2"
            >
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari siswa berdasarkan NISN atau Nama"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-md font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  disabled={studentLoading || !studentSearch.trim()}
                >
                  {studentLoading ? (
                    <div className="flex items-center gap-1.5">
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      Mencari...
                    </div>
                  ) : (
                    "Cari"
                  )}
                </button>
              </div>
            </form>

            {/* Student Search Results */}
            {studentError && (
              <div className="mt-3 p-2.5 bg-red-50 border border-red-200 rounded-md">
                <div className="flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-red-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-red-600 text-xs font-medium">
                    {studentError}
                  </p>
                </div>
              </div>
            )}

            {studentResults.length > 0 && (
              <div className="mt-3">
                <div className="bg-gray-50 rounded-md overflow-hidden border border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gradient-to-r from-gray-100 to-gray-200">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">
                            NISN
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">
                            Nama
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-bold text-gray-700 uppercase">
                            Kelas
                          </th>
                          <th className="px-3 py-2 text-center text-xs font-bold text-gray-700 uppercase">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {studentResults.map((siswa, idx) => (
                          <tr
                            key={idx}
                            className="hover:bg-blue-50 transition-colors duration-200"
                          >
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className="text-xs font-mono font-medium text-gray-900 bg-gray-100 px-1.5 py-0.5 rounded">
                                {siswa.nisn}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-5 h-5 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center text-white font-medium text-xs mr-1.5">
                                  {siswa.nama.charAt(0).toUpperCase()}
                                </div>
                                <span className="text-xs font-medium text-gray-900">
                                  {siswa.nama}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300">
                                {siswa.kodeKelas} - {siswa.kelas}
                              </span>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-center">
                              <button
                                className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-1 focus:ring-offset-1 focus:ring-blue-500 transition-all duration-200"
                                onClick={() =>
                                  navigate(`/bk/students/${siswa.nisn}/detail`)
                                }
                              >
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                Detail
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Classroom Statistics Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 border-b border-gray-200">
            <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
              <ChartBarIcon />
              Statistik Kelas
            </h2>
          </div>

          <div className="p-3">
            {loading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center px-3 py-2 bg-red-50 border border-red-200 rounded-md text-red-600">
                  <svg
                    className="w-3.5 h-3.5 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-xs">{error}</span>
                </div>
              </div>
            ) : (
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
                    {data.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-3 py-6 text-center">
                          <div className="flex flex-col items-center">
                            <svg
                              className="w-8 h-8 text-gray-400 mb-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                            <p className="text-gray-500 text-sm font-medium">
                              Tidak ada data kelas
                            </p>
                            <p className="text-gray-400 text-xs">
                              Data akan muncul di sini
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      data.map((kelas, index) => (
                        <tr
                          key={kelas.id}
                          className="hover:bg-blue-50 cursor-pointer transition-colors duration-200"
                          onClick={() =>
                            navigate(`/bk/classrooms/${kelas.id}/students`)
                          }
                        >
                          <td className="px-3 py-2 whitespace-nowrap">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300">
                              {kelas.kodeKelas}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full flex items-center justify-center text-white font-medium text-xs mr-2">
                                {kelas.namaKelas.charAt(0).toUpperCase()}
                              </div>
                              <span className="text-xs font-medium text-gray-900">
                                {kelas.namaKelas}
                              </span>
                            </div>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800">
                              <svg
                                className="w-2.5 h-2.5 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                />
                              </svg>
                              {kelas.jmlSiswa}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300">
                              <svg
                                className="w-2.5 h-2.5 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.864-.833-2.634 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                                />
                              </svg>
                              {kelas.jmlPelanggaran}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-center">
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300">
                              <svg
                                className="w-2.5 h-2.5 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {kelas.jmlPrestasi}
                            </span>
                          </td>
                          <td className="px-3 py-2 whitespace-nowrap text-center">
                            <span
                              className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                parseFloat(kelas.avrgPoint) >= 80
                                  ? "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300"
                                  : parseFloat(kelas.avrgPoint) >= 60
                                  ? "bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300"
                                  : "bg-gradient-to-r from-red-100 to-red-200 text-red-800 border border-red-300"
                              }`}
                            >
                              <svg
                                className="w-2.5 h-2.5 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                />
                              </svg>
                              {kelas.avrgPoint}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonitoringSiswa;
