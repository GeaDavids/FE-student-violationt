import { useEffect, useState, useRef } from "react";
import Swal from "sweetalert2";
import { FiX, FiUpload, FiPlus } from "react-icons/fi";

const EditLaporanModal = ({
  open,
  onClose,
  initialData,
  onSubmit,
  students,
  violations,
  achievements,
}) => {
  const [form, setForm] = useState({
    studentId: "",
    tipe: "pelanggaran",
    itemId: "",
    tanggal: new Date().toISOString().split("T")[0],
    waktu: "",
    deskripsi: "",
    bukti: "",
  });
  const [evidenceForm, setEvidenceForm] = useState({ file: null });
  const [formLoading, setFormLoading] = useState(false);
  const fileInputRef = useRef();

  useEffect(() => {
    if (initialData) {
      setForm({
        studentId: initialData.studentId || "",
        tipe: initialData.tipe || "pelanggaran",
        itemId: initialData.itemId || "",
        tanggal: initialData.tanggal || new Date().toISOString().split("T")[0],
        waktu: initialData.waktu || "",
        deskripsi: initialData.deskripsi || "",
        bukti: initialData.bukti || "",
      });
      setEvidenceForm({ file: null });
    }
  }, [initialData, open]);

  const getCurrentItems = () => {
    return form.tipe === "pelanggaran" ? violations : achievements;
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        Swal.fire("Error!", "Hanya file gambar yang diperbolehkan", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        Swal.fire("Error!", "Ukuran file maksimal 5MB", "error");
        return;
      }
      setEvidenceForm({ file });
    }
  };

  const removeEvidence = () => {
    setEvidenceForm({ file: null });
    setForm((prev) => ({ ...prev, bukti: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.itemId) {
      Swal.fire("Error!", "Silakan pilih item pelanggaran/prestasi", "error");
      return;
    }
    setFormLoading(true);
    try {
      const formData = new FormData();
      formData.append("studentId", form.studentId);
      formData.append("itemId", form.itemId);
      formData.append("tanggal", form.tanggal);
      if (form.waktu) formData.append("waktu", form.waktu);
      if (form.deskripsi) formData.append("deskripsi", form.deskripsi);
      if (evidenceForm.file) {
        formData.append("bukti", evidenceForm.file);
      } else if (form.bukti) {
        formData.append("bukti", form.bukti);
      }
      await onSubmit(formData);
      onClose();
    } catch (error) {
      Swal.fire("Error!", "Gagal menyimpan perubahan", "error");
    } finally {
      setFormLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-md">
      <div className="bg-white/95 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative border border-gray-100">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <FiX size={20} />
        </button>
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          <h2 className="text-base sm:text-lg font-bold mb-1 text-center">
            Edit Laporan Siswa
          </h2>
          {/* Item Selection */}
          <div className="space-y-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Laporan <span className="text-red-500">*</span>
              </label>
              <select
                name="tipe"
                value={form.tipe}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="pelanggaran">🚫 Pelanggaran</option>
                <option value="prestasi">🏆 Prestasi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jenis {form.tipe === "pelanggaran" ? "Pelanggaran" : "Prestasi"}{" "}
                <span className="text-red-500">*</span>
              </label>
              <select
                name="itemId"
                value={form.itemId}
                onChange={handleFormChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="">
                  Pilih{" "}
                  {form.tipe === "pelanggaran" ? "Pelanggaran" : "Prestasi"}
                </option>
                {getCurrentItems().map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama} ({item.point} poin) - {item.kategori?.nama}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-1 gap-3">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi Detail (Opsional)
              </label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleFormChange}
                rows="2"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                placeholder="Jelaskan detail kejadian, kondisi, atau informasi tambahan..."
              />
            </div>
          </div>
          {/* Evidence */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4 mt-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Upload Bukti Gambar
            </h4>
            <label className="flex flex-col items-center justify-center w-full h-28 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition mb-2">
              <div className="flex flex-col items-center justify-center py-4">
                <FiUpload className="w-7 h-7 mb-2 text-gray-400" />
                <span className="text-xs text-gray-500 font-medium">
                  Klik untuk upload atau drag & drop
                </span>
                <span className="text-xs text-gray-400 mt-1">
                  PNG, JPG, JPEG (max 5MB)
                </span>
                {evidenceForm.file && (
                  <span className="text-xs text-blue-600 mt-1">
                    {evidenceForm.file.name}
                  </span>
                )}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
              />
            </label>
            {/* Preview & Remove Button */}
            {(evidenceForm.file || form.bukti) && (
              <div className="relative w-28 h-28 mt-2 mx-auto group">
                <img
                  src={
                    evidenceForm.file
                      ? URL.createObjectURL(evidenceForm.file)
                      : `${import.meta.env.VITE_API_BASE_URL}${form.bukti}`
                  }
                  alt="Bukti"
                  className="w-full h-full object-cover rounded-lg border border-gray-200"
                  onError={
                    evidenceForm.file
                      ? undefined
                      : (e) => {
                          e.target.src = "/placeholder-image.png";
                        }
                  }
                />
                <button
                  type="button"
                  onClick={removeEvidence}
                  className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-md opacity-90 group-hover:opacity-100 transition"
                  title="Hapus gambar"
                >
                  <FiX size={14} />
                </button>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={formLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {formLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Menyimpan...
                </>
              ) : (
                <>
                  <FiPlus size={16} />
                  Simpan Perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditLaporanModal;
