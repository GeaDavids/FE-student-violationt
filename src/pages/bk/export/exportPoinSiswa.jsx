import React, { useState, useEffect } from "react";
import {
  getRekapOptions,
  exportPoinSiswa,
  previewPoinSiswa,
} from "../../../api/rekap";
import academicYearAPI from "../../../api/academicYear";

const ExportPoinSiswa = () => {
  const [kelas, setKelas] = useState("");
  const [bulan, setBulan] = useState("");
  const [tahunAjaranId, setTahunAjaranId] = useState("");
  const [kelasList, setKelasList] = useState([]);
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  // Auto preview on filter change
  useEffect(() => {
    let ignore = false;
    const fetchPreview = async () => {
      setPreviewError("");
      setPreviewLoading(true);
      try {
        const params = {};
        if (kelas) params.kelas = kelas;
        if (bulan) params.bulan = bulan;
        if (tahunAjaranId) params.tahunAjaranId = tahunAjaranId;
        const res = await previewPoinSiswa(params);
        if (!ignore) {
          setPreview(res.data.data || []);
          if ((res.data.data || []).length === 0)
            setPreviewError("Data tidak ditemukan.");
        }
      } catch (err) {
        if (!ignore) setPreviewError("Gagal mengambil data preview");
      }
      if (!ignore) setPreviewLoading(false);
    };
    fetchPreview();
    return () => {
      ignore = true;
    };
  }, [kelas, bulan, tahunAjaranId]);

  useEffect(() => {
    getRekapOptions().then((data) => {
      setKelasList(Array.isArray(data.kelas) ? data.kelas : []);
    });

    // Fetch academic years
    academicYearAPI
      .getAll()
      .then((response) => {
        const years = response.data.data || [];
        setTahunAjaranList(years);

        // Auto-select current academic year
        academicYearAPI
          .getCurrent()
          .then((currentResponse) => {
            const currentYear = currentResponse.data.data;
            if (currentYear && !tahunAjaranId) {
              setTahunAjaranId(currentYear.id);
            }
          })
          .catch(console.error);
      })
      .catch(console.error);
  }, []);

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (kelas) params.kelas = kelas;
      if (bulan) params.bulan = bulan;
      if (tahunAjaranId) params.tahunAjaranId = tahunAjaranId;
      const res = await exportPoinSiswa(params);
      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "poin_siswa_export.xlsx";
      link.click();
    } catch (err) {
      alert("Gagal export poin siswa");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-3">
          <button
            onClick={() => window.history.back()}
            className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 transition-colors duration-200 text-sm"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-medium">Kembali</span>
          </button>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-purple-600 rounded-md flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
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
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Export Poin Siswa
              </h1>
              <p className="text-gray-600 text-xs mt-0.5">
                Download rekap poin dalam format Excel
              </p>
            </div>
          </div>
        </div>
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200 p-4 mb-4">
          <div className="flex items-center space-x-2 mb-3">
            <div className="w-5 h-5 bg-indigo-100 rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
            </div>
            <h2 className="text-md font-bold text-gray-900">Filter Data</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filter Bulan */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Bulan (YYYY-MM)
              </label>
              <input
                type="month"
                className="w-full h-[34px] px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
              />
            </div>

            {/* Filter Kelas */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Kelas
              </label>
              <div className="relative">
                <select
                  className="w-full h-[34px] px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 appearance-none bg-white pr-8"
                  value={kelas}
                  onChange={(e) => setKelas(e.target.value)}
                >
                  <option value="">-- Semua Kelas --</option>
                  {kelasList.map((k) => (
                    <option key={k.id} value={k.kodeKelas}>
                      {k.kodeKelas} - {k.namaKelas}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Filter Tahun Ajaran */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tahun Ajaran
              </label>
              <div className="relative">
                <select
                  className="w-full h-[34px] px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors duration-200 appearance-none bg-white pr-8"
                  value={tahunAjaranId}
                  onChange={(e) => setTahunAjaranId(e.target.value)}
                >
                  <option value="">-- Pilih Tahun Ajaran --</option>
                  {tahunAjaranList.map((tahun) => (
                    <option key={tahun.id} value={tahun.id}>
                      {tahun.tahunAjaran} {tahun.isActive ? "(Aktif)" : ""}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Export Button */}
          <div className="mt-4 flex justify-between items-center">
            <button
              type="button"
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                loading || preview.length === 0
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-700 hover:to-purple-800 shadow-md"
              }`}
              onClick={handleExport}
              disabled={loading || preview.length === 0}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-1 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Mengunduh...</span>
                </>
              ) : (
                <>
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 10v6m0 0l-4-4m4 4l4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span>Export Poin Siswa (Excel)</span>
                </>
              )}
            </button>

            {/* Statistics Badge */}
            {preview.length > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-md px-3 py-1.5">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-3 h-3 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-purple-800 font-medium text-xs">
                    {preview.length} siswa ditemukan
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Preview Section */}
        <div className="bg-white rounded-lg shadow border border-gray-200">
          <div className="p-3 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-3 h-3 text-green-600"
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
              </div>
              <h2 className="text-md font-bold text-gray-900">Preview</h2>
            </div>
          </div>

          <div className="max-h-60 overflow-auto">
            {previewLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="flex items-center space-x-3">
                  <svg
                    className="animate-spin h-5 w-5 text-purple-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span className="text-gray-600 text-sm">
                    Memuat preview data...
                  </span>
                </div>
              </div>
            ) : previewError ? (
              <div className="p-4">
                <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <span className="text-amber-800 text-sm">
                      {previewError}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-20 whitespace-nowrap">
                        NISN
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-32 whitespace-nowrap">
                        Nama
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-20 whitespace-nowrap">
                        Kelas
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-20 whitespace-nowrap">
                        Angkatan
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider min-w-20 whitespace-nowrap">
                        Score
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-red-600 uppercase tracking-wider min-w-20 bg-red-50 whitespace-nowrap">
                        Jml Pelanggaran
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-red-600 uppercase tracking-wider min-w-28 bg-red-50 whitespace-nowrap">
                        Poin Pel
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-green-600 uppercase tracking-wider min-w-20 bg-green-50 whitespace-nowrap">
                        Jml Prestasi
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-green-600 uppercase tracking-wider min-w-28 bg-green-50 whitespace-nowrap">
                        Poin Pres
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-blue-600 uppercase tracking-wider min-w-20 bg-blue-50 whitespace-nowrap">
                        Jml Penanganan
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-blue-600 uppercase tracking-wider min-w-28 bg-blue-50 whitespace-nowrap">
                        Poin Pen
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((s, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                          {s.nisn}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                          {s.nama}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {s.kelas}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {s.angkatan}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`text-xs font-semibold ${
                              s.totalScore > 100
                                ? "text-red-600"
                                : s.totalScore > 50
                                ? "text-yellow-600"
                                : "text-green-600"
                            }`}
                          >
                            {s.totalScore}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-red-700 bg-red-50">
                          {s.pelanggaran}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-red-700 bg-red-50">
                          {s.totalPoinPelanggaran}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-green-700 bg-green-50">
                          {s.prestasi}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-green-700 bg-green-50">
                          {s.totalPoinPrestasi}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-blue-700 bg-blue-50">
                          {s.jmlPenanganan}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-blue-700 bg-blue-50">
                          {s.totalPoinPenanganan}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-md p-3 mt-4">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <svg
                className="w-4 h-4 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-purple-900 mb-1">
                Informasi Export Poin Siswa
              </h3>
              <div className="space-y-1 text-xs text-purple-800">
                <p>
                  • <span className="font-medium">Data Komprehensif:</span>{" "}
                  Rekap lengkap poin pelanggaran, prestasi, dan penanganan
                  setiap siswa
                </p>
                <p>
                  • <span className="font-medium">Filter Fleksibel:</span>{" "}
                  Kosongkan filter untuk mengexport semua data siswa
                </p>
                <p>
                  • <span className="font-medium">Color Coding:</span> Merah
                  (pelanggaran), Hijau (prestasi), Biru (penanganan)
                </p>
                <p>
                  • <span className="font-medium">Format Output:</span> File
                  Excel (.xlsx) dengan format yang rapi dan mudah dibaca
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportPoinSiswa;
