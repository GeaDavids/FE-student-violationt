import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import bkAPI from "../../../api/bk";
import academicYearAPI from "../../../api/academicYear";
import api from "../../../api/api";
import { getReportById } from "../../../api/reports";
import {
  getRiwayatPenanganan,
  getDetailPenanganan,
} from "../../../api/penanganan";
import Swal from "sweetalert2";

const detailSiswaWK = () => {
  const { nisn } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loadingLaporan, setLoadingLaporan] = useState(true);
  const [error, setError] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");
  const [suratPeringatan, setSuratPeringatan] = useState([]);
  const [loadingSurat, setLoadingSurat] = useState(false);
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);
  const [loadingAdjustment, setLoadingAdjustment] = useState(false);

  // Icon Components
  const ArrowLeftIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10 19l-7-7m0 0l7-7m-7 7h18"
      />
    </svg>
  );

  const UserIcon = () => (
    <svg
      className="w-6 h-6"
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

  const DocumentIcon = () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  const MailIcon = () => (
    <svg
      className="w-6 h-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );

  const EyeIcon = () => (
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
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );

  // Fetch academic years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await academicYearAPI.getAll();
        setAcademicYears(res.data.data);
      } catch (err) {
        setAcademicYears([]);
      }
    };
    fetchYears();
  }, []);

  // Fetch student info (static, tidak ikut filter tahun ajaran)
  useEffect(() => {
    const fetchInfo = async () => {
      setError(null);
      try {
        // Ambil info siswa tanpa filter tahun ajaran
        const res = await bkAPI.getStudentDetail(nisn);
        setData((prev) => ({ ...res.data, laporan: prev?.laporan || [] }));
      } catch (err) {
        setError("Gagal memuat detail siswa");
      }
    };
    fetchInfo();
  }, [nisn]);

  // Fetch surat peringatan & adjustment history when nisn or selectedYear changes
  useEffect(() => {
    if (!nisn) return;
    fetchSuratPeringatan(nisn, selectedYear);
    fetchAdjustmentHistory(nisn, selectedYear);
  }, [nisn, selectedYear]);

  // Fetch laporan (riwayat laporan) sesuai tahun ajaran
  useEffect(() => {
    if (!selectedYear) return;
    const fetchLaporan = async () => {
      setLoadingLaporan(true);
      setError(null);
      try {
        const tahunParam = selectedYear === "all" ? undefined : selectedYear;
        const res = await bkAPI.getStudentDetail(nisn, tahunParam);
        setData((prev) => ({ ...prev, laporan: res.data.laporan }));
      } catch (err) {
        setError("Gagal memuat riwayat laporan");
      } finally {
        setLoadingLaporan(false);
      }
    };
    fetchLaporan();
  }, [nisn, selectedYear]);

  // Fungsi untuk mengambil surat peringatan (filtered by tahun ajaran)
  const fetchSuratPeringatan = async (studentNisn, tahunAjaranId) => {
    try {
      setLoadingSurat(true);
      let url = `/automasi/history?nisn=${studentNisn}`;
      if (tahunAjaranId && tahunAjaranId !== "all") {
        url += `&tahunAjaranId=${tahunAjaranId}`;
      }
      const response = await api.get(url);
      setSuratPeringatan(response.data.data || []);
    } catch (error) {
      console.error("Error fetching surat peringatan:", error);
      setSuratPeringatan([]);
    } finally {
      setLoadingSurat(false);
    }
  };

  // Fungsi untuk mengambil riwayat penanganan (adjustment history)
  // Fungsi untuk mengambil riwayat penanganan (dari penanganan.controller)
  const fetchAdjustmentHistory = async (studentNisn, tahunAjaranId) => {
    try {
      setLoadingAdjustment(true);
      const response = await getRiwayatPenanganan(studentNisn, tahunAjaranId);
      setAdjustmentHistory(response.data || []);
    } catch (error) {
      console.error("Error fetching adjustment history:", error);
      setAdjustmentHistory([]);
    } finally {
      setLoadingAdjustment(false);
    }
  };

  // Fungsi untuk melihat detail surat peringatan
  const viewSuratDetail = async (surat) => {
    try {
      const response = await api.get(`/automasi/surat/${surat.id}`);
      const detailSurat = response.data.data;

      Swal.fire({
        title: detailSurat.judul,
        html: `
          <div class="text-left space-y-3">
            <div class="border-b pb-2 mb-3">
              <p><strong>Jenis:</strong> ${getJenisSuratText(
                detailSurat.jenisSurat
              )}</p>
              <p><strong>Tingkat:</strong> Level ${detailSurat.tingkatSurat}</p>
              <p><strong>Total Score:</strong> <span class="text-red-600 font-bold">${
                detailSurat.totalScoreSaat
              }</span></p>
              <p><strong>Status:</strong> ${getStatusText(
                detailSurat.statusKirim
              )}</p>
              <p><strong>Tanggal Dibuat:</strong> ${new Date(
                detailSurat.createdAt
              ).toLocaleDateString("id-ID")}</p>
            </div>
            <div>
              <h4 class="font-bold mb-2">Isi Surat:</h4>
              <div class="bg-gray-50 p-3 rounded text-sm max-h-60 overflow-y-auto whitespace-pre-line">${
                detailSurat.isiSurat
              }</div>
            </div>
          </div>
        `,
        width: "600px",
        confirmButtonText: "Tutup",
        confirmButtonColor: "#3B82F6",
      });
    } catch (error) {
      console.error("Error fetching surat detail:", error);
      Swal.fire("Error", "Gagal memuat detail surat", "error");
    }
  };

  // Helper functions untuk text label
  const getJenisSuratText = (jenis) => {
    const labels = {
      SP1: "Surat Peringatan 1",
      PANGGIL_ORTU: "Surat Pemanggilan Orang Tua",
      TERANCAM_KELUAR: "Surat Peringatan Terancam Dikeluarkan",
    };
    return labels[jenis] || jenis;
  };

  const getStatusText = (status) => {
    const labels = {
      pending: "Pending",
      sent: "Terkirim",
      failed: "Gagal",
    };
    return labels[status] || status;
  };

  // Fungsi untuk get badge status surat
  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      sent: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };

    const labels = {
      pending: "Pending",
      sent: "Terkirim",
      failed: "Gagal",
    };

    return (
      <span
        className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${colors[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  // Fungsi untuk get badge jenis surat
  const getJenisSuratBadge = (jenis) => {
    const colors = {
      SP1: "bg-yellow-100 text-yellow-800",
      PANGGIL_ORTU: "bg-orange-100 text-orange-800",
      TERANCAM_KELUAR: "bg-red-100 text-red-800",
    };

    const labels = {
      SP1: "SP 1",
      PANGGIL_ORTU: "Panggil Ortu",
      TERANCAM_KELUAR: "Terancam Keluar",
    };

    return (
      <span
        className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${colors[jenis]}`}
      >
        {labels[jenis] || jenis}
      </span>
    );
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200"></div>
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
          </div>
          <div className="mt-3 text-center">
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              Memuat data siswa...
            </h3>
            <p className="text-slate-500 text-xs">Mohon tunggu sebentar</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-gradient-to-br from-red-100 to-red-200 rounded-lg flex items-center justify-center mb-3">
            <span className="text-lg">❌</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Terjadi Kesalahan
          </h3>
          <p className="text-red-600 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { siswa, laporan } = data || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto px-3 py-4 max-w-6xl">
        {/* Header */}
        <div className="mb-4">
          <button
            onClick={() => navigate(-1)}
            className="mb-3 inline-flex items-center px-2 py-1.5 text-xs font-medium text-slate-600 bg-white/70 backdrop-blur-sm rounded-md border border-slate-200 hover:bg-white hover:text-slate-900 transition-all duration-200"
          >
            ← Kembali
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              Detail Siswa
            </h1>
            {/* Academic Year Selector */}
            <div className="mt-3 sm:mt-0">
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-1.5 bg-white/70 backdrop-blur-sm border border-slate-200 rounded-md text-xs font-medium text-slate-700 hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              >
                <option value="all">Semua Tahun Ajaran</option>
                {academicYears.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.tahunAjaran} - {year.semester}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Grid: Info Siswa (kiri), Riwayat Laporan (kanan) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {/* Student Info Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 md:col-span-1">
            <div className="bg-gray-300 text-black p-3 rounded-t-lg">
              <h2 className="text-lg font-bold">Informasi Siswa</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    NISN
                  </label>
                  <p className="text-sm font-semibold text-slate-900">
                    {siswa?.nisn || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Nama Lengkap
                  </label>
                  <p className="text-sm font-semibold text-slate-900">
                    {siswa?.nama || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Kelas
                  </label>
                  <p className="text-sm font-semibold text-slate-900">
                    {siswa?.kelas || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Angkatan
                  </label>
                  <p className="text-sm font-semibold text-slate-900">
                    {siswa?.angkatan || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600">
                    Total Score
                  </label>
                  <p className="text-sm font-semibold text-slate-900">
                    {siswa?.totalScore ?? "-"}
                  </p>
                </div>
              </div>
            </div>
          </div>
          {/* Reports History Section */}
          <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 md:col-span-2">
            <div className="bg-gray-300 text-black p-4 rounded-t-lg">
              <h2 className="text-lg font-bold">Riwayat Laporan</h2>
              <p className="text-black-100 text-xs mt-1">
                Total {laporan?.length || 0} laporan (pelanggaran & prestasi)
              </p>
            </div>
            <div className="p-4">
              {loadingLaporan ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-200"></div>
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
                  </div>
                  <div className="mt-3 text-center">
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">
                      Memuat riwayat laporan...
                    </h3>
                    <p className="text-slate-500 text-xs">
                      Mohon tunggu sebentar
                    </p>
                  </div>
                </div>
              ) : laporan && laporan.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-xs">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-2 px-3 font-semibold text-slate-700">
                          Tanggal
                        </th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700">
                          Tipe
                        </th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700">
                          Item
                        </th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700">
                          Poin
                        </th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700">
                          Pelapor
                        </th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700">
                          Deskripsi
                        </th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700">
                          Bukti
                        </th>
                        <th className="text-left py-2 px-3 font-semibold text-slate-700">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {laporan.map((item, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-2 px-3 text-slate-600">
                            {new Date(item.tanggal).toLocaleDateString("id-ID")}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                                item.tipe === "pelanggaran"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {item.tipe.charAt(0).toUpperCase() +
                                item.tipe.slice(1)}
                            </span>
                          </td>
                          <td className="py-2 px-3 font-medium text-slate-900">
                            {item.namaItem || "-"}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                item.tipe === "pelanggaran"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {item.tipe === "pelanggaran"
                                ? `-${item.point || 0}`
                                : `+${item.point || 0}`}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {item.reporter?.name || "-"}
                          </td>
                          <td
                            className="py-2 px-3 text-slate-600 max-w-xs truncate"
                            title={item.deskripsi}
                          >
                            {item.deskripsi || "-"}
                          </td>
                          <td className="py-2 px-3">
                            {item.bukti && item.bukti.length > 0 ? (
                              <span
                                className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 cursor-pointer"
                                title="Lihat Bukti"
                              >
                                Ada
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="py-2 px-3">
                            <button
                              onClick={async () => {
                                try {
                                  const res = await getReportById(item.id);
                                  const detail = res.data;
                                  Swal.fire({
                                    title: `Detail Laporan #${item.id}`,
                                    html: (() => {
                                      const BASE_URL =
                                        import.meta.env.VITE_API_BASE_URL || "";
                                      let buktiHtml = "-";
                                      let buktiArr = [];
                                      if (detail.bukti) {
                                        if (Array.isArray(detail.bukti)) {
                                          buktiArr = detail.bukti;
                                        } else if (
                                          typeof detail.bukti === "string" &&
                                          detail.bukti.trim() !== ""
                                        ) {
                                          buktiArr = [detail.bukti];
                                        }
                                      }
                                      if (buktiArr.length > 0) {
                                        buktiHtml = buktiArr
                                          .map((bukti, idx) => {
                                            const url = `${BASE_URL}${bukti}`;
                                            return `
                                            <div style='display:flex;align-items:center;gap:8px;margin-bottom:4px;'>
                                              <img src='${url}' alt='Bukti' style='width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb' onerror="this.src='/placeholder-image.png'" />
                                              <a href='${url}' target='_blank' rel='noopener noreferrer' style='color:#2563eb;text-decoration:underline;font-size:12px;'>Lihat</a>
                                            </div>
                                          `;
                                          })
                                          .join("");
                                      }
                                      return `
                                        <div class='text-left space-y-2'>
                                          <div><b>Tanggal:</b> ${
                                            detail.tanggal
                                              ? new Date(
                                                  detail.tanggal
                                                ).toLocaleDateString("id-ID")
                                              : "-"
                                          }</div>
                                          <div><b>Tipe:</b> ${
                                            detail.item?.tipe
                                              ? detail.item.tipe
                                                  .charAt(0)
                                                  .toUpperCase() +
                                                detail.item.tipe.slice(1)
                                              : "-"
                                          }</div>
                                          <div><b>Item:</b> ${
                                            detail.item?.nama || "-"
                                          }</div>
                                          <div><b>Poin:</b> ${
                                            detail.item?.tipe === "pelanggaran"
                                              ? `-${detail.item?.point || 0}`
                                              : `+${detail.item?.point || 0}`
                                          }</div>
                                          <div><b>Pelapor:</b> ${
                                            detail.reporter || "-"
                                          }</div>
                                          <div><b>Deskripsi:</b> ${
                                            detail.deskripsi || "-"
                                          }</div>
                                          <div><b>Bukti:</b><br/>${buktiHtml}</div>
                                        </div>
                                      `;
                                    })(),
                                    width: "500px",
                                    confirmButtonText: "Tutup",
                                    confirmButtonColor: "#3B82F6",
                                  });
                                } catch (e) {
                                  Swal.fire(
                                    "Error",
                                    "Gagal memuat detail laporan",
                                    "error"
                                  );
                                }
                              }}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                            >
                              <EyeIcon />
                              <span className="ml-1">Detail</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-lg">✅</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 mb-1">
                    Tidak Ada Laporan
                  </h3>
                  <p className="text-slate-500 text-xs">
                    Siswa ini belum memiliki catatan laporan
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Adjustment History Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 mt-6">
          <div className="bg-gray-300 text-black p-4 rounded-t-lg">
            <h2 className="text-lg font-bold">
              Riwayat Penanganan (Adjustment History)
            </h2>
            <p className="text-black-100 text-xs mt-1">
              Total {adjustmentHistory.length} penanganan
            </p>
          </div>
          <div className="p-4">
            {loadingAdjustment ? (
              <div className="flex justify-center py-6">
                <div className="relative">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-200"></div>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-green-500 border-t-transparent absolute top-0 left-0"></div>
                </div>
              </div>
            ) : adjustmentHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 font-semibold text-slate-700">
                        Tanggal
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-700">
                        Poin Sebelum
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-700">
                        Poin Sesudah
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-700">
                        Poin
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-700">
                        Deskripsi
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-700">
                        Petugas
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjustmentHistory.map((adj, idx) => {
                      // Field mapping sesuai response: tanggal, tipe, pointPengurangan, alasan, keterangan, pointSebelum, pointSesudah, teacher.name
                      const tipe =
                        adj.tipe ||
                        (adj.pointPengurangan ? "pengurangan" : "penambahan");
                      let tipeColor = "bg-gray-100 text-gray-800";
                      if (tipe === "penambahan") {
                        tipeColor = "bg-green-100 text-green-800";
                      } else if (tipe === "pengurangan") {
                        tipeColor = "bg-red-100 text-red-800";
                      }
                      return (
                        <tr
                          key={idx}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-2 px-3 text-slate-600">
                            {adj.tanggal
                              ? new Date(adj.tanggal).toLocaleDateString(
                                  "id-ID"
                                )
                              : "-"}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {adj.pointSebelum ?? "-"}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {adj.pointSesudah ?? "-"}
                          </td>
                          <td className="py-2 px-3">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tipeColor}`}
                            >
                              {tipe === "pengurangan"
                                ? "-"
                                : tipe === "penambahan"
                                ? "+"
                                : ""}
                              {adj.pointPengurangan || adj.point || 0}
                            </span>
                          </td>
                          <td
                            className="py-2 px-3 text-slate-600 max-w-xs truncate"
                            title={adj.alasan || adj.keterangan || "-"}
                          >
                            {adj.alasan || adj.keterangan || "-"}
                          </td>
                          <td className="py-2 px-3 text-slate-600">
                            {adj.teacher?.name || "-"}
                          </td>
                          <td className="py-2 px-3">
                            <button
                              onClick={async () => {
                                try {
                                  const res = await getDetailPenanganan(adj.id);
                                  const detail = res.data;
                                  Swal.fire({
                                    title: `Detail Penanganan #${adj.id}`,
                                    html: (() => {
                                      const BASE_URL =
                                        import.meta.env.VITE_API_BASE_URL || "";
                                      let buktiHtml = "-";
                                      let buktiArr = [];
                                      if (detail.bukti) {
                                        if (Array.isArray(detail.bukti)) {
                                          buktiArr = detail.bukti;
                                        } else if (
                                          typeof detail.bukti === "string" &&
                                          detail.bukti.trim() !== ""
                                        ) {
                                          buktiArr = [detail.bukti];
                                        }
                                      }
                                      if (buktiArr.length > 0) {
                                        buktiHtml = buktiArr
                                          .map((bukti, idx) => {
                                            const url = `${BASE_URL}${bukti}`;
                                            return `
                                            <div style='display:flex;align-items:center;gap:8px;margin-bottom:4px;'>
                                              <img src='${url}' alt='Bukti' style='width:48px;height:48px;object-fit:cover;border-radius:6px;border:1px solid #e5e7eb' onerror="this.src='/placeholder-image.png'" />
                                              <a href='${url}' target='_blank' rel='noopener noreferrer' style='color:#2563eb;text-decoration:underline;font-size:12px;'>Lihat</a>
                                            </div>
                                          `;
                                          })
                                          .join("");
                                      }
                                      return `
                                        <div class='text-left space-y-2'>
                                          <div><b>Tanggal:</b> ${
                                            detail.tanggal
                                              ? new Date(
                                                  detail.tanggal
                                                ).toLocaleDateString("id-ID")
                                              : "-"
                                          }</div>
                                          <div><b>Poin Sebelum:</b> ${
                                            detail.pointSebelum ?? "-"
                                          }</div>
                                          <div><b>Poin Sesudah:</b> ${
                                            detail.pointSesudah ?? "-"
                                          }</div>
                                          <div><b>Poin:</b> ${
                                            detail.pointPengurangan ||
                                            detail.point ||
                                            0
                                          }</div>
                                          <div><b>Alasan:</b> ${
                                            detail.alasan || "-"
                                          }</div>
                                          <div><b>Keterangan:</b> ${
                                            detail.keterangan || "-"
                                          }</div>
                                          <div><b>Petugas:</b> ${
                                            detail.teacher?.name || "-"
                                          }</div>
                                          <div><b>Bukti:</b><br/>${buktiHtml}</div>
                                        </div>
                                      `;
                                    })(),
                                    width: "500px",
                                    confirmButtonText: "Tutup",
                                    confirmButtonColor: "#3B82F6",
                                  });
                                } catch (e) {
                                  Swal.fire(
                                    "Error",
                                    "Gagal memuat detail penanganan",
                                    "error"
                                  );
                                }
                              }}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                            >
                              <EyeIcon />
                              <span className="ml-1">Detail</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-lg">📝</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  Belum Ada Riwayat Penanganan
                </h3>
                <p className="text-slate-500 text-xs">
                  Siswa ini belum pernah mendapat penanganan/adjustment
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Warning Letters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 mt-6">
          <div className="bg-gray-300 text-black p-4 rounded-t-lg">
            <h2 className="text-lg font-bold">Riwayat Surat Peringatan</h2>
            <p className="text-black-100 text-xs mt-1">
              Total {suratPeringatan.length} surat peringatan
            </p>
          </div>
          <div className="p-4">
            {loadingSurat ? (
              <div className="flex justify-center py-6">
                <div className="relative">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-slate-200"></div>
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-purple-500 border-t-transparent absolute top-0 left-0"></div>
                </div>
              </div>
            ) : suratPeringatan.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="text-left py-2 px-3 font-semibold text-slate-700">
                        Tanggal
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-700">
                        Jenis Surat
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-700">
                        Total Poin
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-700">
                        Status
                      </th>
                      <th className="text-left py-2 px-3 font-semibold text-slate-700">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {suratPeringatan.map((surat, index) => (
                      <tr
                        key={index}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-2 px-3 text-slate-600">
                          {new Date(surat.createdAt).toLocaleDateString(
                            "id-ID"
                          )}
                        </td>
                        <td className="py-2 px-3">
                          {getJenisSuratBadge(surat.jenisSurat)}
                        </td>
                        <td className="py-2 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            {surat.totalScoreSaat}
                          </span>
                        </td>
                        <td className="py-2 px-3">
                          {getStatusBadge(surat.statusKirim)}
                        </td>
                        <td className="py-2 px-3">
                          <button
                            onClick={() => viewSuratDetail(surat)}
                            className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                          >
                            <EyeIcon />
                            <span className="ml-1">Lihat</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center mb-3">
                  <span className="text-lg">📄</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  Belum Ada Surat Peringatan
                </h3>
                <p className="text-slate-500 text-xs">
                  Siswa ini belum pernah mendapat surat peringatan
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default detailSiswaWK;
