import React, { useState, useEffect } from "react";
import API from "../../../api/api";
import { getRekapOptions } from "../../../api/rekap";
import laporanAPI from "../../../api/laporan";

const ExportLaporan = () => {
  const [bulan, setBulan] = useState("");
  const [tahunAjaranId, setTahunAjaranId] = useState("");
  const [kelas, setKelas] = useState("");
  const [tipe, setTipe] = useState("all");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const [tahunAjaranList, setTahunAjaranList] = useState([]);
  const [kelasList, setKelasList] = useState([]);

  useEffect(() => {
    // Fetch kelas & tahun ajaran dari endpoint rekap/options
    getRekapOptions().then((data) => {
      setKelasList(Array.isArray(data.kelas) ? data.kelas : []);
      setTahunAjaranList(
        Array.isArray(data.tahunAjaran) ? data.tahunAjaran : []
      );
    });
  }, []);

  // Auto preview on filter change
  useEffect(() => {
    let ignore = false;
    const fetchPreview = async () => {
      setPreviewError("");
      setPreviewLoading(true);
      try {
        const params = {};
        if (bulan) params.bulan = bulan;
        if (tahunAjaranId) params.tahunAjaranId = tahunAjaranId;
        if (kelas) params.kelas = kelas;
        if (tipe && tipe !== "all") params.tipe = tipe;
        const res = await laporanAPI.preview(params);
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
  }, [bulan, tahunAjaranId, kelas, tipe]);

  const handleExport = async () => {
    setLoading(true);
    try {
      const params = [];
      if (bulan) params.push(`bulan=${bulan}`);
      if (tahunAjaranId) params.push(`tahunAjaranId=${tahunAjaranId}`);
      if (kelas) params.push(`kelas=${kelas}`);
      if (tipe && tipe !== "all") params.push(`tipe=${tipe}`);
      const url = `master/rekap/laporan${
        params.length ? "?" + params.join("&") : ""
      }`;
      const res = await API.get(url, { responseType: "blob" });
      // Download file
      const blob = new Blob([res.data], { type: res.headers["content-type"] });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = "laporan_export.xlsx";
      link.click();
    } catch (err) {
      alert("Gagal export laporan");
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
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
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
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                Export Laporan
              </h1>
              <p className="text-gray-600 text-xs mt-0.5">
                Download laporan dalam format Excel
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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filter Bulan */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Bulan (YYYY-MM)
              </label>
              <input
                type="month"
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                value={bulan}
                onChange={(e) => setBulan(e.target.value)}
              />
            </div>

            {/* Filter Tahun Ajaran */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tahun Ajaran
              </label>
              <select
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                value={tahunAjaranId}
                onChange={(e) => setTahunAjaranId(e.target.value)}
              >
                <option value="">-- Semua Tahun Ajaran --</option>
                {tahunAjaranList.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.tahunAjaran || t.tahun}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter Kelas */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Kelas
              </label>
              <select
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
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
            </div>

            {/* Filter Tipe */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Tipe
              </label>
              <select
                className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                value={tipe}
                onChange={(e) => setTipe(e.target.value)}
              >
                <option value="all">Semua</option>
                <option value="pelanggaran">Pelanggaran</option>
                <option value="prestasi">Prestasi</option>
              </select>
            </div>
          </div>

          {/* Export Button */}
          <div className="mt-4 flex justify-between items-center">
            <button
              type="button"
              className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-semibold transition-all duration-200 ${
                loading || preview.length === 0
                  ? "bg-gray-400 text-white cursor-not-allowed"
                  : "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 shadow-md"
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
                  <span>Export Laporan (Excel)</span>
                </>
              )}
            </button>

            {/* Statistics Badge */}
            {preview.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-md px-3 py-1.5">
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-3 h-3 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="text-blue-800 font-medium text-xs">
                    {preview.length} data ditemukan
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
                    className="animate-spin h-5 w-5 text-blue-600"
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
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        NISN
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Nama
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Kelas
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Tanggal
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Tipe
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Kategori
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Item
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Point
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Deskripsi
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Reporter
                      </th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Tahun Ajaran
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {preview.map((row, i) => (
                      <tr
                        key={i}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-900">
                          {row.nisn}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs font-medium text-gray-900">
                          {row.nama}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {row.kelas}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {row.tanggal}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              row.tipe === "pelanggaran"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {row.tipe}
                          </span>
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {row.kategori}
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-900 max-w-xs truncate">
                          {row.item}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap">
                          <span
                            className={`text-xs font-medium ${
                              row.tipe === "pelanggaran"
                                ? "text-red-600"
                                : "text-green-600"
                            }`}
                          >
                            {row.point}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-xs text-gray-600 max-w-xs truncate">
                          {row.deskripsi}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {row.reporter}
                        </td>
                        <td className="px-3 py-2 whitespace-nowrap text-xs text-gray-600">
                          {row.tahunAjaran}
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
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-md p-3 mt-4">
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              <svg
                className="w-4 h-4 text-blue-600"
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
              <h3 className="text-sm font-semibold text-blue-900 mb-1">
                Informasi Export
              </h3>
              <div className="space-y-1 text-xs text-blue-800">
                <p>
                  • <span className="font-medium">Filter:</span> Kosongkan
                  filter untuk mengexport semua data
                </p>
                <p>
                  • <span className="font-medium">Format Bulan:</span> Gunakan
                  format YYYY-MM (contoh: 2025-08)
                </p>
                <p>
                  • <span className="font-medium">Data Master:</span> Tahun
                  Ajaran dan Kelas diambil otomatis dari sistem
                </p>
                <p>
                  • <span className="font-medium">File Output:</span> File hasil
                  export berupa Excel (.xlsx)
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportLaporan;
