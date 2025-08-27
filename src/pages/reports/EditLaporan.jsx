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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl relative">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
        >
          <FiX size={24} />
        </button>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <h2 className="text-2xl font-bold mb-4">Edit Laporan Siswa</h2>
          {/* Item Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipe Laporan <span className="text-red-500">*</span>
            </label>
            <select
              name="tipe"
              value={form.tipe}
              onChange={handleFormChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pelanggaran">🚫 Pelanggaran</option>
              <option value="prestasi">🏆 Prestasi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Jenis {form.tipe === "pelanggaran" ? "Pelanggaran" : "Prestasi"}{" "}
              <span className="text-red-500">*</span>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deskripsi Detail (Opsional)
            </label>
            <textarea
              name="deskripsi"
              value={form.deskripsi}
              onChange={handleFormChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Jelaskan detail kejadian, kondisi, atau informasi tambahan..."
            />
          </div>
          {/* Evidence */}
          <div className="border border-gray-200 rounded-lg p-4 mb-4 mt-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Upload Bukti Gambar
            </h4>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <FiUpload className="w-8 h-8 mb-4 text-gray-500" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Klik untuk upload</span>{" "}
                    atau drag and drop
                  </p>
                  <p className="text-xs text-gray-500">
                    PNG, JPG, JPEG (MAX. 5MB)
                  </p>
                  {evidenceForm.file && (
                    <p className="text-xs text-blue-600 mt-2">
                      Dipilih: {evidenceForm.file.name}
                    </p>
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
              {(evidenceForm.file || form.bukti) && (
                <button
                  type="button"
                  onClick={removeEvidence}
                  className="ml-4 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full"
                >
                  <FiX size={16} />
                </button>
              )}
            </div>
            {/* Preview */}
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
            {!evidenceForm.file && form.bukti && (
              <div className="mt-3">
                <div className="relative w-32 h-32 rounded-lg overflow-hidden">
                  <img
                    src={`${import.meta.env.VITE_API_BASE_URL}${form.bukti}`}
                    alt="Bukti"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-image.png";
                    }}
                  />
                </div>
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
