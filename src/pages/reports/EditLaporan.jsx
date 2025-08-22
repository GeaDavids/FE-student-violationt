import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FiArrowLeft,
  FiSave,
  FiUser,
  FiAlertTriangle,
  FiAward,
  FiEdit3,
  FiPlus,
  FiX,
  FiUpload,
  FiImage,
} from "react-icons/fi";
import {
  getReportById,
  updateReport,
  getAllStudents,
  getViolations,
  getAchievements,
} from "../../api/reports";

const EditLaporan = () => {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [originalReport, setOriginalReport] = useState(null);
  const [students, setStudents] = useState([]);
  const [violations, setViolations] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form state
  const [form, setForm] = useState({
    studentId: "",
    tipe: "pelanggaran",
    itemId: "",
    tanggal: "",
    waktu: "",
    deskripsi: "",
    bukti: [], // Array of evidence objects
    pointSaat: "",
  });

  // Evidence form state
  const [evidenceForm, setEvidenceForm] = useState({
    file: null,
    tipe: "image",
  });
  const [uploadLoading, setUploadLoading] = useState(false);

  // Get current report items based on type
  const getCurrentItems = () => {
    return form.tipe === "pelanggaran" ? violations : achievements;
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Auto-fill point when item is selected
    if (name === "itemId" && value) {
      const items = getCurrentItems();
      const selectedItem = items.find((item) => item.id === parseInt(value));
      if (selectedItem) {
        setForm((prev) => ({ ...prev, pointSaat: selectedItem.point }));
      }
    }
  };

  // Handle evidence form changes
  const handleEvidenceFormChange = (e) => {
    const { name, value } = e.target;
    setEvidenceForm((prev) => ({ ...prev, [name]: value }));
  };

  // Handle file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type (only images)
      if (!file.type.startsWith("image/")) {
        Swal.fire("Error!", "Hanya file gambar yang diperbolehkan", "error");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire("Error!", "Ukuran file maksimal 5MB", "error");
        return;
      }

      setEvidenceForm((prev) => ({ ...prev, file }));
    }
  };

  // Upload file to server
  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", "bukti"); // Upload to bukti folder

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/api/upload`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const result = await response.json();
      return result.filePath; // Return the file path
    } catch (error) {
      throw error;
    }
  };

  // Add evidence to form
  const addEvidence = async () => {
    if (!evidenceForm.file) {
      Swal.fire("Error!", "Silakan pilih file gambar terlebih dahulu", "error");
      return;
    }

    try {
      setUploadLoading(true);

      // Upload file to server
      const filePath = await uploadFile(evidenceForm.file);

      // Add evidence with uploaded file path
      setForm((prev) => ({
        ...prev,
        bukti: [
          ...prev.bukti,
          {
            url: filePath,
            tipe: evidenceForm.tipe,
            originalName: evidenceForm.file.name,
          },
        ],
      }));

      // Reset evidence form
      setEvidenceForm({ file: null, tipe: "image" });

      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = "";

      Swal.fire("Berhasil!", "File berhasil diupload", "success");
    } catch (error) {
      console.error("Error uploading file:", error);
      Swal.fire("Error!", "Gagal mengupload file", "error");
    } finally {
      setUploadLoading(false);
    }
  };

  // Remove evidence from form
  const removeEvidence = (index) => {
    setForm((prev) => ({
      ...prev,
      bukti: prev.bukti.filter((_, i) => i !== index),
    }));
  };

  // Fetch report detail and helper data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportRes, studentsRes, violationsRes, achievementsRes] =
        await Promise.all([
          getReportById(reportId),
          getAllStudents({ limit: 1000 }),
          getViolations(),
          getAchievements(),
        ]);

      const report = reportRes.data;
      setOriginalReport(report);
      setStudents(studentsRes.data || []);
      setViolations(violationsRes || []); // violationsRes is already the data array
      setAchievements(achievementsRes || []); // achievementsRes is already the data array

      // Populate form with existing data
      setForm({
        studentId: report.student?.id?.toString() || "",
        tipe: report.item?.tipe || "pelanggaran",
        itemId: report.item?.id?.toString() || "",
        tanggal: report.tanggal
          ? new Date(report.tanggal).toISOString().split("T")[0]
          : "",
        waktu: report.waktu
          ? new Date(report.waktu).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "",
        deskripsi: report.deskripsi || "",
        bukti: report.bukti || [],
        pointSaat: report.pointSaat || "",
      });
    } catch (error) {
      console.error("Error fetching data:", error);
      const message =
        error.response?.data?.error || "Gagal mengambil data laporan";
      Swal.fire("Error!", message, "error");
      navigate("/reports");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.itemId) {
      Swal.fire("Error!", "Silakan pilih item pelanggaran/prestasi", "error");
      return;
    }

    try {
      setSubmitLoading(true);

      const updateData = {
        itemId: parseInt(form.itemId),
        tanggal: form.tanggal,
        waktu: form.waktu || null,
        deskripsi: form.deskripsi || null,
        bukti: form.bukti.length > 0 ? form.bukti : null,
        pointSaat: parseInt(form.pointSaat),
      };

      const response = await updateReport(reportId, updateData);

      Swal.fire(
        "Berhasil!",
        response.message || "Laporan berhasil diperbarui",
        "success"
      );
      navigate(`/reports/detail/${reportId}`);
    } catch (error) {
      console.error("Error updating report:", error);
      const message =
        error.response?.data?.error || "Gagal memperbarui laporan";
      Swal.fire("Error!", message, "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (reportId) {
      fetchData();
    }
  }, [reportId]);

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data laporan...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!originalReport) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-2">
            Laporan Tidak Ditemukan
          </h2>
          <p className="text-gray-600 mb-4">
            Laporan yang ingin Anda edit tidak ditemukan.
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
            onClick={() => navigate(`/reports/detail/${reportId}`)}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
          >
            <FiArrowLeft size={20} />
          </button>
          <h2 className="text-3xl font-bold text-[#003366] flex items-center gap-3">
            <FiEdit3 className="text-blue-600" />
            Edit Laporan #{reportId}
          </h2>
        </div>
      </div>

      {/* Original Report Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">
          Informasi Laporan Asli:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="font-medium text-blue-800">Siswa:</span>
            <p className="text-blue-700">{originalReport.student?.nama}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Tipe:</span>
            <p className="text-blue-700 capitalize">
              {originalReport.item?.tipe}
            </p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Item:</span>
            <p className="text-blue-700">{originalReport.item?.nama}</p>
          </div>
          <div>
            <span className="font-medium text-blue-800">Tanggal:</span>
            <p className="text-blue-700">
              {formatDateForDisplay(originalReport.tanggal)}
            </p>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiUser className="text-blue-600" />
            Informasi Dasar
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Student (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Siswa (Tidak dapat diubah)
              </label>
              <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600">
                {originalReport.student?.nama} - {originalReport.student?.kelas}{" "}
                ({originalReport.student?.nisn})
              </div>
            </div>

            {/* Report Type (Read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Laporan (Tidak dapat diubah)
              </label>
              <div className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 flex items-center gap-2">
                {form.tipe === "pelanggaran" ? (
                  <>
                    <FiAlertTriangle className="text-red-500" />
                    Pelanggaran
                  </>
                ) : (
                  <>
                    <FiAward className="text-green-500" />
                    Prestasi
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Item Selection */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {form.tipe === "pelanggaran"
                ? "Jenis Pelanggaran *"
                : "Jenis Prestasi *"}
            </label>
            <select
              name="itemId"
              value={form.itemId}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">
                Pilih {form.tipe === "pelanggaran" ? "Pelanggaran" : "Prestasi"}
              </option>
              {getCurrentItems().map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nama} ({item.point} poin) - {item.kategori?.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Points */}
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Poin Saat Laporan
            </label>
            <input
              type="number"
              name="pointSaat"
              value={form.pointSaat}
              onChange={handleFormChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Poin akan terisi otomatis saat memilih item"
            />
          </div>
        </div>

        {/* Date and Time */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Waktu Kejadian
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanggal *
              </label>
              <input
                type="date"
                name="tanggal"
                value={form.tanggal}
                onChange={handleFormChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Waktu (Opsional)
              </label>
              <input
                type="time"
                name="waktu"
                value={form.waktu}
                onChange={handleFormChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Deskripsi
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi Detail (Opsional)
            </label>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleFormChange}
              rows="4"
              placeholder="Jelaskan detail kejadian, kondisi, atau informasi tambahan..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Evidence */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bukti (Opsional)
          </h3>

          {/* Add Evidence Form */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-3">Tambah Bukti</h4>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Gambar Bukti
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                  <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600">
                    {evidenceForm.file
                      ? evidenceForm.file.name
                      : "Klik atau drag & drop gambar di sini"}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PNG, JPG, GIF hingga 5MB
                  </p>
                </div>
              </div>

              {/* File Preview */}
              {evidenceForm.file && (
                <div className="mt-3">
                  <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                    <img
                      src={URL.createObjectURL(evidenceForm.file)}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Evidence Type */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Bukti
              </label>
              <select
                name="tipe"
                value={evidenceForm.tipe}
                onChange={handleEvidenceFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="image">Gambar</option>
                <option value="document">Dokumen</option>
                <option value="video">Video</option>
              </select>
            </div>

            <button
              type="button"
              onClick={addEvidence}
              disabled={uploadLoading}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {uploadLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Mengupload...
                </>
              ) : (
                <>
                  <FiPlus className="mr-2" />
                  Tambah Bukti
                </>
              )}
            </button>
          </div>

          {/* Evidence List */}
          {form.bukti.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Daftar Bukti:</h4>
              {form.bukti.map((bukti, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {/* Image Preview */}
                  {bukti.tipe === "image" && bukti.url && (
                    <div className="w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src={`${import.meta.env.VITE_API_BASE_URL}${bukti.url}`}
                        alt={`Bukti ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/placeholder-image.png";
                        }}
                      />
                    </div>
                  )}

                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {bukti.originalName ||
                        `${bukti.tipe || "File"} ${index + 1}`}
                    </p>
                    <p className="text-sm text-gray-600 truncate">
                      {bukti.url}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeEvidence(index)}
                    className="text-red-500 hover:text-red-700 p-1"
                  >
                    <FiX size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitLoading}
              className="flex-1 bg-[#003366] hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
            >
              {submitLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <FiSave /> Simpan Perubahan
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/reports/detail/${reportId}`)}
              disabled={submitLoading}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
            >
              Batal
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditLaporan;
