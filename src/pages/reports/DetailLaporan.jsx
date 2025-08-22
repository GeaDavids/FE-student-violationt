import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FiArrowLeft,
  FiEdit3,
  FiTrash2,
  FiUser,
  FiCalendar,
  FiClock,
  FiAward,
  FiAlertTriangle,
  FiFileText,
  FiImage,
  FiExternalLink,
  FiInfo,
} from "react-icons/fi";
import { getReportById, deleteReport } from "../../api/reports";

const DetailLaporan = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTimeForDisplay = (timeString) => {
    if (!timeString) return "-";
    const time = new Date(timeString);
    if (isNaN(time.getTime())) return "-";
    return time.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Fetch report detail
  const fetchReportDetail = async () => {
    try {
      setLoading(true);
      const response = await getReportById(reportId);
      setReport(response.data);
    } catch (error) {
      console.error("Error fetching report detail:", error);
      const message =
        error.response?.data?.error || "Gagal mengambil detail laporan";
      Swal.fire("Error!", message, "error");
      navigate("/reports");
    } finally {
      setLoading(false);
    }
  };

  // Handle delete report
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "Hapus Laporan?",
      text: `Yakin ingin menghapus laporan ${
        report.item?.tipe === "pelanggaran" ? "pelanggaran" : "prestasi"
      } untuk ${report.student?.nama}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        setDeleteLoading(true);
        await deleteReport(reportId);
        Swal.fire("Terhapus!", "Laporan berhasil dihapus", "success");
        navigate("/reports");
      } catch (error) {
        console.error("Error deleting report:", error);
        const message =
          error.response?.data?.error || "Gagal menghapus laporan";
        Swal.fire("Error!", message, "error");
      } finally {
        setDeleteLoading(false);
      }
    }
  };

  useEffect(() => {
    if (reportId) {
      fetchReportDetail();
    }
  }, [reportId]);

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat detail laporan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="text-center">
          <FiFileText className="text-6xl text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Laporan Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-4">
            Laporan yang Anda cari tidak ditemukan atau telah dihapus.
          </p>
          <button
            onClick={() => navigate("/reports")}
            className="bg-[#003366] hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Kembali ke Daftar Laporan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/reports")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <h2 className="text-3xl font-bold text-[#003366] flex items-center gap-3">
            <FiFileText className="text-blue-600" />
            Detail Laporan
          </h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`/reports/edit/${reportId}`)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <FiEdit3 /> Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            {deleteLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Menghapus...
              </>
            ) : (
              <>
                <FiTrash2 /> Hapus
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              {report.item?.tipe === "pelanggaran" ? (
                <FiAlertTriangle className="text-2xl text-red-500" />
              ) : (
                <FiAward className="text-2xl text-green-500" />
              )}
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {report.item?.nama}
                </h3>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    report.item?.tipe === "pelanggaran"
                      ? "bg-red-100 text-red-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {report.item?.tipe === "pelanggaran"
                    ? "Pelanggaran"
                    : "Prestasi"}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiCalendar className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Tanggal</p>
                  <p className="font-medium text-gray-900">
                    {formatDateForDisplay(report.tanggal)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FiClock className="text-gray-500" />
                <div>
                  <p className="text-sm text-gray-600">Waktu</p>
                  <p className="font-medium text-gray-900">
                    {formatTimeForDisplay(report.waktu)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-3">
                Informasi Laporan
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <FiInfo className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Kategori</p>
                    <p className="font-medium text-gray-900">
                      {report.item?.kategori}
                    </p>
                  </div>
                </div>

                {report.item?.jenis && (
                  <div className="flex items-start gap-3">
                    <FiInfo className="text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Jenis</p>
                      <p className="font-medium text-gray-900">
                        {report.item?.jenis}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <FiInfo className="text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm text-gray-600">Poin</p>
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                        report.item?.tipe === "pelanggaran"
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {report.item?.tipe === "pelanggaran" ? "-" : "+"}
                      {report.pointSaat}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {report.deskripsi && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Deskripsi
                </h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {report.deskripsi}
                  </p>
                </div>
              </div>
            )}

            {report.bukti && report.bukti.length > 0 && (
              <div className="mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-3">
                  Bukti
                </h4>
                <div className="space-y-3">
                  {report.bukti.map((bukti, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      {bukti.tipe === "image" && bukti.url ? (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-gray-700">
                            {bukti.originalName || `Gambar ${index + 1}`}
                          </p>
                          <div className="w-full max-w-md">
                            <img
                              src={`${import.meta.env.VITE_API_BASE_URL}${
                                bukti.url
                              }`}
                              alt={`Bukti ${index + 1}`}
                              className="w-full h-auto rounded-lg shadow-sm border border-gray-200"
                              onError={(e) => {
                                e.target.src = "/placeholder-image.png";
                              }}
                            />
                          </div>
                          <a
                            href={`${import.meta.env.VITE_API_BASE_URL}${
                              bukti.url
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                          >
                            <FiExternalLink size={14} />
                            Lihat Gambar Penuh
                          </a>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3">
                          <FiImage className="text-gray-500" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-600">
                              {bukti.originalName ||
                                `${bukti.tipe || "File"} ${index + 1}`}
                            </p>
                            <a
                              href={bukti.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
                            >
                              Lihat Bukti <FiExternalLink size={14} />
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student and Reporter Information */}
        <div className="space-y-6">
          {/* Student Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiUser className="text-blue-600" />
              Informasi Siswa
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="font-medium text-gray-900">
                  {report.student?.nama}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">NISN</p>
                <p className="font-medium text-gray-900">
                  {report.student?.nisn}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Kelas</p>
                <p className="font-medium text-gray-900">
                  {report.student?.kelas}
                </p>
              </div>
              {report.student?.angkatan && (
                <div>
                  <p className="text-sm text-gray-600">Angkatan</p>
                  <p className="font-medium text-gray-900">
                    {report.student?.angkatan}
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-600">Total Poin Saat Ini</p>
                <span
                  className={`inline-flex px-3 py-1 rounded-full text-sm font-bold ${
                    report.student?.totalScore >= 0
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {report.student?.totalScore}
                </span>
              </div>
            </div>
          </div>

          {/* Reporter Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Informasi Pelapor
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">Nama</p>
                <p className="font-medium text-gray-900">{report.reporter}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Role</p>
                <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 capitalize">
                  {report.reporterRole}
                </span>
              </div>
            </div>
          </div>

          {/* Report Metadata */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Metadata Laporan
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-gray-600">ID Laporan</p>
                <p className="font-medium text-gray-900">#{report.id}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Dibuat Pada</p>
                <p className="font-medium text-gray-900">
                  {formatDateForDisplay(report.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Penanganan (if exists for violation) */}
          {report.penanganan && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Penanganan
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Jenis Penanganan</p>
                  <p className="font-medium text-gray-900">
                    {report.penanganan.jenisPenanganan}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Deskripsi</p>
                  <p className="font-medium text-gray-900">
                    {report.penanganan.deskripsi}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Penanggung Jawab</p>
                  <p className="font-medium text-gray-900">
                    {report.penanganan.penanggungJawab}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      report.penanganan.statusSelesai
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {report.penanganan.statusSelesai
                      ? "Selesai"
                      : "Dalam Proses"}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailLaporan;
