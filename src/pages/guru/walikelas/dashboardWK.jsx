import React, { useEffect, useState } from "react";
import { getReportById } from "../../../api/reports";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiFileText, FiAward, FiAlertTriangle } from "react-icons/fi";
import API from "../../../api/api";

const DashboardWaliKelas = () => {
  const [students, setStudents] = useState([]);
  const [studentsTotal, setStudentsTotal] = useState(0);
  const [studentsPage, setStudentsPage] = useState(1);
  const [studentsSearch, setStudentsSearch] = useState("");
  const studentsLimit = 20;

  const [reports, setReports] = useState([]);
  const [reportsTotal, setReportsTotal] = useState(0);
  const [reportsPage, setReportsPage] = useState(1);
  const [reportsSearch, setReportsSearch] = useState("");
  const reportsLimit = 20;
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchReports = async () => {
      setLoadingReports(true);
      setError(null);
      try {
        let laporanQuery = `/walikelas/reports?limit=${reportsLimit}&offset=${
          (reportsPage - 1) * reportsLimit
        }`;
        if (reportsSearch)
          laporanQuery += `&search=${encodeURIComponent(reportsSearch)}`;
        const resLaporan = await API.get(laporanQuery);
        setReports(resLaporan.data.reports || []);
        setReportsTotal(resLaporan.data.total || 0);
      } catch (err) {
        setError("Gagal memuat data laporan");
      } finally {
        setLoadingReports(false);
      }
    };
    fetchReports();
  }, [reportsPage, reportsSearch]);
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [detailLaporan, setDetailLaporan] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState(null);

  useEffect(() => {
    const fetchStudents = async () => {
      setLoadingStudents(true);
      setError(null);
      try {
        let siswaQuery = `/walikelas/students?limit=${studentsLimit}&offset=${
          (studentsPage - 1) * studentsLimit
        }`;
        if (studentsSearch)
          siswaQuery += `&search=${encodeURIComponent(studentsSearch)}`;
        const resSiswa = await API.get(siswaQuery);
        setStudents(resSiswa.data.students || []);
        setStudentsTotal(resSiswa.data.total || 0);
      } catch (err) {
        setError("Gagal memuat data siswa");
      } finally {
        setLoadingStudents(false);
      }
    };
    fetchStudents();
  }, [studentsPage, studentsSearch]);

  // Loading seluruh halaman dihapus, loading hanya di tabel siswa
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  // Stats
  const totalSiswa = students.length;
  const totalLaporan = reports.length;
  const totalPelanggaran = reports.filter(
    (r) => r.item?.tipe === "pelanggaran"
  ).length;
  const totalPrestasi = reports.filter(
    (r) => r.item?.tipe === "prestasi"
  ).length;

  // Fungsi untuk buka modal detail laporan
  const handleOpenDetail = async (id) => {
    setShowModal(true);
    setLoadingDetail(true);
    setErrorDetail(null);
    try {
      const res = await getReportById(id);
      setDetailLaporan(res.data);
    } catch (err) {
      setErrorDetail("Gagal memuat detail laporan");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setDetailLaporan(null);
    setErrorDetail(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <h1 className="text-3xl font-bold mb-8 text-blue-900">
        Dashboard Wali Kelas
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow flex items-center gap-4 p-5">
          <div className="bg-blue-100 rounded-full p-3">
            <FiUsers className="text-2xl text-blue-700" />
          </div>
          <div>
            <div className="text-gray-500 text-xs font-semibold">
              Total Siswa
            </div>
            <div className="text-2xl font-bold text-blue-900">{totalSiswa}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow flex items-center gap-4 p-5">
          <div className="bg-indigo-100 rounded-full p-3">
            <FiFileText className="text-2xl text-indigo-700" />
          </div>
          <div>
            <div className="text-gray-500 text-xs font-semibold">
              Total Laporan
            </div>
            <div className="text-2xl font-bold text-indigo-900">
              {totalLaporan}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow flex items-center gap-4 p-5">
          <div className="bg-red-100 rounded-full p-3">
            <FiAlertTriangle className="text-2xl text-red-700" />
          </div>
          <div>
            <div className="text-gray-500 text-xs font-semibold">
              Pelanggaran
            </div>
            <div className="text-2xl font-bold text-red-700">
              {totalPelanggaran}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow flex items-center gap-4 p-5">
          <div className="bg-green-100 rounded-full p-3">
            <FiAward className="text-2xl text-green-700" />
          </div>
          <div>
            <div className="text-gray-500 text-xs font-semibold">Prestasi</div>
            <div className="text-2xl font-bold text-green-700">
              {totalPrestasi}
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Siswa */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 className="text-lg font-bold text-blue-900">
            Daftar Siswa di Kelas Anda
          </h2>
          <input
            type="text"
            className="border border-slate-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Cari nama/NISN siswa..."
            value={studentsSearch}
            onChange={(e) => {
              setStudentsSearch(e.target.value);
              setStudentsPage(1);
            }}
            style={{ minWidth: 220 }}
          />
        </div>
        <div className="overflow-x-auto rounded-xl">
          {loadingStudents ? (
            <div className="py-8 text-center">Loading...</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-blue-50 text-blue-900">
                  <th className="py-2 px-3 text-left font-semibold">NISN</th>
                  <th className="py-2 px-3 text-left font-semibold">Nama</th>
                  <th className="py-2 px-3 text-left font-semibold">
                    Angkatan
                  </th>
                  <th className="py-2 px-3 text-left font-semibold">Email</th>
                  <th className="py-2 px-3 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {students.map((siswa) => (
                  <tr
                    key={siswa.nisn}
                    className="border-b hover:bg-blue-50 transition"
                  >
                    <td className="py-2 px-3">{siswa.nisn}</td>
                    <td className="py-2 px-3 font-medium">
                      {siswa.user?.name}
                    </td>
                    <td className="py-2 px-3">{siswa.angkatan?.tahun}</td>
                    <td className="py-2 px-3">{siswa.user?.email}</td>
                    <td className="py-2 px-3 text-center">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-semibold text-xs shadow"
                        onClick={() =>
                          navigate(`/walikelas/siswa/${siswa.nisn}`)
                        }
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination Siswa */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-3 py-1 rounded bg-slate-200 text-slate-700 text-xs font-semibold disabled:opacity-50"
            onClick={() => setStudentsPage((p) => Math.max(1, p - 1))}
            disabled={studentsPage === 1}
          >
            Prev
          </button>
          <span className="text-xs py-1">
            Page {studentsPage} of{" "}
            {Math.ceil(studentsTotal / studentsLimit) || 1}
          </span>
          <button
            className="px-3 py-1 rounded bg-slate-200 text-slate-700 text-xs font-semibold disabled:opacity-50"
            onClick={() => setStudentsPage((p) => p + 1)}
            disabled={studentsPage >= Math.ceil(studentsTotal / studentsLimit)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Daftar Laporan */}
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 className="text-lg font-bold text-blue-900">
            Daftar Laporan Siswa di Kelas Anda
          </h2>
          <input
            type="text"
            className="border border-slate-300 rounded px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Cari nama/NISN siswa..."
            value={reportsSearch}
            onChange={(e) => {
              setReportsSearch(e.target.value);
              setReportsPage(1);
            }}
            style={{ minWidth: 220 }}
          />
        </div>
        <div className="overflow-x-auto rounded-xl">
          {loadingReports ? (
            <div className="py-8 text-center">Loading...</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-blue-50 text-blue-900">
                  <th className="py-2 px-3 text-left font-semibold">Tanggal</th>
                  <th className="py-2 px-3 text-left font-semibold">NISN</th>
                  <th className="py-2 px-3 text-left font-semibold">
                    Nama Siswa
                  </th>
                  <th className="py-2 px-3 text-center font-semibold">Tipe</th>
                  <th className="py-2 px-3 text-left font-semibold">
                    Nama Item
                  </th>
                  <th className="py-2 px-3 text-center font-semibold">Point</th>
                  <th className="py-2 px-3 text-left font-semibold">
                    Reporter
                  </th>
                </tr>
              </thead>
              <tbody>
                {reports.map((lap) => (
                  <tr
                    key={lap.id}
                    className="border-b hover:bg-blue-100 transition cursor-pointer group"
                    onClick={(e) => {
                      // Cegah trigger jika klik tombol Detail
                      if (e.target.closest("button")) return;
                      handleOpenDetail(lap.id);
                    }}
                  >
                    <td className="py-2 px-3">
                      {new Date(lap.tanggal).toLocaleDateString()}
                    </td>
                    <td className="py-2 px-3">{lap.student?.nisn}</td>
                    <td className="py-2 px-3">{lap.student?.user?.name}</td>
                    <td className="py-2 px-3 text-center">
                      {lap.item?.tipe === "pelanggaran" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                          <FiAlertTriangle /> Pelanggaran
                        </span>
                      ) : lap.item?.tipe === "prestasi" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                          <FiAward /> Prestasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                          -
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3">{lap.item?.nama}</td>
                    <td className="py-2 px-3 text-center">
                      {lap.item?.tipe === "pelanggaran"
                        ? `-${lap.item?.point || 0}`
                        : lap.item?.tipe === "prestasi"
                        ? `+${lap.item?.point || 0}`
                        : lap.item?.point || 0}
                    </td>
                    <td className="py-2 px-3">{lap.reporter?.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {/* Pagination Laporan */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-3 py-1 rounded bg-slate-200 text-slate-700 text-xs font-semibold disabled:opacity-50"
            onClick={() => setReportsPage((p) => Math.max(1, p - 1))}
            disabled={reportsPage === 1}
          >
            Prev
          </button>
          <span className="text-xs py-1">
            Page {reportsPage} of {Math.ceil(reportsTotal / reportsLimit) || 1}
          </span>
          <button
            className="px-3 py-1 rounded bg-slate-200 text-slate-700 text-xs font-semibold disabled:opacity-50"
            onClick={() => setReportsPage((p) => p + 1)}
            disabled={reportsPage >= Math.ceil(reportsTotal / reportsLimit)}
          >
            Next
          </button>
        </div>
      </div>
      {/* Modal Detail Laporan */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-7 relative animate-fadeInUp">
            <button
              className="absolute top-2 right-3 text-gray-500 hover:text-red-600 text-xl font-bold"
              onClick={handleCloseModal}
              aria-label="Tutup"
            >
              ×
            </button>
            {loadingDetail ? (
              <div className="py-8 text-center">Loading...</div>
            ) : errorDetail ? (
              <div className="py-8 text-center text-red-500">{errorDetail}</div>
            ) : detailLaporan ? (
              <>
                <div className="flex items-center gap-3 mb-5 mt-2">
                  <div
                    className={`rounded-full p-2 text-white ${
                      detailLaporan.item?.tipe === "pelanggaran"
                        ? "bg-red-500"
                        : "bg-green-500"
                    }`}
                  >
                    {detailLaporan.item?.tipe === "pelanggaran" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 1.343-3 3 0 1.657 1.343 3 3 3s3-1.343 3-3c0-1.657-1.343-3-3-3zm0 0V4m0 7v7m0 0h7m-7 0H5"
                        />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#003366] leading-tight mb-0">
                      {detailLaporan.item?.tipe === "pelanggaran"
                        ? "Pelanggaran"
                        : "Prestasi"}
                    </h2>
                    <div className="text-xs text-gray-500">
                      {detailLaporan.tanggal
                        ? new Date(detailLaporan.tanggal).toLocaleDateString(
                            "id-ID"
                          )
                        : "-"}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4">
                  <div>
                    <span className="font-semibold text-gray-700">Item:</span>{" "}
                    <span className="text-gray-900">
                      {detailLaporan.item?.nama || "-"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Poin:</span>{" "}
                    <span
                      className={`font-bold ${
                        detailLaporan.item?.tipe === "pelanggaran"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {detailLaporan.item?.tipe === "pelanggaran"
                        ? `-${detailLaporan.item?.point || 0}`
                        : `+${detailLaporan.item?.point || 0}`}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">
                      Pelapor:
                    </span>{" "}
                    <span className="text-gray-900">
                      {detailLaporan.reporter || "-"}
                    </span>
                  </div>
                </div>
                <hr className="my-3" />
                <div className="mb-3">
                  <span className="font-semibold text-gray-700">
                    Deskripsi:
                  </span>
                  <div className="bg-gray-50 rounded p-2 mt-1 text-gray-800 min-h-[40px]">
                    {detailLaporan.deskripsi || (
                      <span className="italic text-gray-400">
                        Tidak ada deskripsi
                      </span>
                    )}
                  </div>
                </div>
                <div className="mb-3">
                  <span className="font-semibold text-gray-700">Bukti:</span>
                  <div className="mt-2">
                    {(() => {
                      const BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
                      let buktiArr = [];
                      if (detailLaporan.bukti) {
                        if (Array.isArray(detailLaporan.bukti))
                          buktiArr = detailLaporan.bukti;
                        else if (
                          typeof detailLaporan.bukti === "string" &&
                          detailLaporan.bukti.trim() !== ""
                        )
                          buktiArr = [detailLaporan.bukti];
                      }
                      return buktiArr.length > 0 ? (
                        <div className="flex flex-wrap gap-4">
                          {buktiArr.map((bukti, idx) => (
                            <div
                              key={idx}
                              className="flex flex-col items-center"
                            >
                              <img
                                src={`${BASE_URL}${bukti}`}
                                alt="Bukti"
                                className="w-28 h-28 object-cover rounded-lg border shadow bg-white mb-1"
                                onError={(e) =>
                                  (e.target.src = "/placeholder-image.png")
                                }
                              />
                              <a
                                href={`${BASE_URL}${bukti}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 underline hover:text-blue-800"
                              >
                                Lihat Bukti
                              </a>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="italic text-gray-400">
                          Tidak ada bukti
                        </span>
                      );
                    })()}
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardWaliKelas;
