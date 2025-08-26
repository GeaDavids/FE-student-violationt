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
    <div className="p-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/reports")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-1 rounded transition-colors"
            title="Kembali"
          >
            <FiArrowLeft size={18} />
          </button>
          <h2 className="text-xl font-bold text-[#003366] flex items-center gap-2">
            <FiFileText className="text-blue-600" />
            Detail Laporan
          </h2>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => navigate(`/reports/edit/${reportId}`)}
            className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
          >
            <FiEdit3 /> Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteLoading}
            className="bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white px-3 py-1 rounded flex items-center gap-1 text-sm"
          >
            {deleteLoading ? (
              <>
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ...
              </>
            ) : (
              <>
                <FiTrash2 /> Hapus
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Main Information */}
        <div>
          <div className="bg-white rounded shadow-sm p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              {report.item?.tipe === "pelanggaran" ? (
                <FiAlertTriangle className="text-lg text-red-500" />
              ) : (
                <FiAward className="text-lg text-green-500" />
              )}
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  {report.item?.nama}
                </h3>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
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

            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="flex items-center gap-2 bg-gray-50 rounded p-2">
                <FiCalendar className="text-gray-500" />
                <span className="text-xs text-gray-600">
                  {formatDateForDisplay(report.tanggal)}
                </span>
              </div>
              <div className="flex items-center gap-2 bg-gray-50 rounded p-2">
                <FiClock className="text-gray-500" />
                <span className="text-xs text-gray-600">
                  {formatTimeForDisplay(report.waktu)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs mb-3">
              <div className="flex items-center gap-2">
                <FiInfo className="text-gray-400" />
                <span>Kategori:</span>
                <span className="font-medium text-gray-900">
                  {report.item?.kategori}
                </span>
              </div>
              {report.item?.jenis && (
                <div className="flex items-center gap-2">
                  <FiInfo className="text-gray-400" />
                  <span>Jenis:</span>
                  <span className="font-medium text-gray-900">
                    {report.item?.jenis}
                  </span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <FiInfo className="text-gray-400" />
                <span>Poin:</span>
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
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

            {report.deskripsi && (
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Deskripsi
                </h4>
                <div className="bg-gray-50 rounded p-2 text-xs text-gray-700 whitespace-pre-wrap">
                  {report.deskripsi}
                </div>
              </div>
            )}

            {report.bukti && report.bukti.length > 0 && (
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Bukti
                </h4>
                <div className="space-y-2">
                  {report.bukti.map((bukti, index) => (
                    <div
                      key={index}
                      className="p-2 bg-gray-50 rounded flex items-center gap-2"
                    >
                      {bukti.tipe === "image" && bukti.url ? (
                        <>
                          <img
                            src={`${import.meta.env.VITE_API_BASE_URL}${
                              bukti.url
                            }`}
                            alt={`Bukti ${index + 1}`}
                            className="w-16 h-16 object-cover rounded border border-gray-200"
                            onError={(e) => {
                              e.target.src = "/placeholder-image.png";
                            }}
                          />
                          <a
                            href={`${import.meta.env.VITE_API_BASE_URL}${
                              bukti.url
                            }`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                          >
                            <FiExternalLink size={12} />
                            Lihat
                          </a>
                        </>
                      ) : (
                        <>
                          <FiImage className="text-gray-400" />
                          <a
                            href={bukti.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 text-xs flex items-center gap-1"
                          >
                            Lihat Bukti <FiExternalLink size={12} />
                          </a>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Student and Reporter Information */}
        <div className="space-y-3">
          {/* Student Information */}
          <div className="bg-white rounded shadow-sm p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <FiUser className="text-blue-600" />
              Siswa
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Nama:</span>{" "}
                <span className="font-medium text-gray-900">
                  {report.student?.nama}
                </span>
              </div>
              <div>
                <span className="text-gray-600">NISN:</span>{" "}
                <span className="font-medium text-gray-900">
                  {report.student?.nisn}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Kelas:</span>{" "}
                <span className="font-medium text-gray-900">
                  {report.student?.kelas}
                </span>
              </div>
              {report.student?.angkatan && (
                <div>
                  <span className="text-gray-600">Angkatan:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {report.student?.angkatan}
                  </span>
                </div>
              )}
              <div className="col-span-2">
                <span className="text-gray-600">Total Poin:</span>{" "}
                <span
                  className={`inline-flex px-2 py-0.5 rounded-full text-xs font-bold ${
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
          <div className="bg-white rounded shadow-sm p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Pelapor
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Nama:</span>{" "}
                <span className="font-medium text-gray-900">
                  {report.reporter}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Role:</span>{" "}
                <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                  {report.reporterRole}
                </span>
              </div>
            </div>
          </div>

          {/* Report Metadata */}
          <div className="bg-white rounded shadow-sm p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Metadata
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">ID:</span>{" "}
                <span className="font-medium text-gray-900">#{report.id}</span>
              </div>
              <div>
                <span className="text-gray-600">Dibuat:</span>{" "}
                <span className="font-medium text-gray-900">
                  {formatDateForDisplay(report.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Penanganan (if exists for violation) */}
          {report.penanganan && (
            <div className="bg-white rounded shadow-sm p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-2">
                Penanganan
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Jenis:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {report.penanganan.jenisPenanganan}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Deskripsi:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {report.penanganan.deskripsi}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Penanggung Jawab:</span>{" "}
                  <span className="font-medium text-gray-900">
                    {report.penanganan.penanggungJawab}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Status:</span>{" "}
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
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
