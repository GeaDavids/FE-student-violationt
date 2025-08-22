import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
  FiArrowLeft,
  FiSave,
  FiUser,
  FiSearch,
  FiAlertTriangle,
  FiAward,
  FiPlus,
  FiX,
  FiUpload,
  FiImage,
} from "react-icons/fi";
import {
  createReport,
  getAllStudents,
  getViolations,
  getAchievements,
} from "../../api/reports";

const TambahLaporan = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [violations, setViolations] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Student search state
  const [studentSearch, setStudentSearch] = useState("");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Form state
  const [form, setForm] = useState({
    studentId: "",
    tipe: "pelanggaran",
    itemId: "",
    tanggal: new Date().toISOString().split("T")[0],
    waktu: "",
    deskripsi: "",
    bukti: [], // Array of evidence objects
  });

  // Evidence form state
  const [evidenceForm, setEvidenceForm] = useState({
    file: null,
    tipe: "image",
  });

  // File upload state
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
        setForm((prev) => ({ ...prev, point: selectedItem.point }));
      }
    }
  };

  // Handle student search
  const handleStudentSearch = (e) => {
    const value = e.target.value;
    setStudentSearch(value);

    if (value.trim() === "") {
      setFilteredStudents([]);
      setShowStudentDropdown(false);
      return;
    }

    const filtered = students.filter(
      (student) =>
        student.nama.toLowerCase().includes(value.toLowerCase()) ||
        student.nisn.toLowerCase().includes(value.toLowerCase()) ||
        student.kelas.toLowerCase().includes(value.toLowerCase())
    );

    setFilteredStudents(filtered);
    setShowStudentDropdown(true);
  };

  // Handle student selection
  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setStudentSearch(`${student.nama} - ${student.kelas} (${student.nisn})`);
    setForm((prev) => ({ ...prev, studentId: student.id.toString() }));
    setShowStudentDropdown(false);
  };

  // Clear student selection
  const clearStudentSelection = () => {
    setSelectedStudent(null);
    setStudentSearch("");
    setForm((prev) => ({ ...prev, studentId: "" }));
    setShowStudentDropdown(false);
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

  // Fetch helper data
  const fetchHelperData = async () => {
    try {
      setLoading(true);
      const [studentsRes, violationsRes, achievementsRes] = await Promise.all([
        getAllStudents({ limit: 1000 }),
        getViolations(),
        getAchievements(),
      ]);

      console.log("Students response:", studentsRes);
      console.log("Violations response:", violationsRes);
      console.log("Achievements response:", achievementsRes);

      setStudents(studentsRes.data || []);
      setViolations(violationsRes || []); // violationsRes is already the data array
      setAchievements(achievementsRes || []); // achievementsRes is already the data array
    } catch (error) {
      console.error("Error fetching helper data:", error);
      Swal.fire("Error!", "Gagal mengambil data pendukung", "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedStudent) {
      Swal.fire("Error!", "Silakan pilih siswa terlebih dahulu", "error");
      return;
    }

    if (!form.itemId) {
      Swal.fire("Error!", "Silakan pilih item pelanggaran/prestasi", "error");
      return;
    }

    try {
      setSubmitLoading(true);

      const reportData = {
        studentId: parseInt(form.studentId),
        itemId: parseInt(form.itemId),
        tanggal: form.tanggal,
        waktu: form.waktu || null,
        deskripsi: form.deskripsi || null,
        bukti: form.bukti.length > 0 ? form.bukti : null,
      };

      const response = await createReport(reportData);

      Swal.fire(
        "Berhasil!",
        response.message || "Laporan berhasil dibuat",
        "success"
      );
      navigate("/reports");
    } catch (error) {
      console.error("Error creating report:", error);
      const message = error.response?.data?.error || "Gagal membuat laporan";
      Swal.fire("Error!", message, "error");
    } finally {
      setSubmitLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setForm({
      studentId: "",
      tipe: "pelanggaran",
      itemId: "",
      tanggal: new Date().toISOString().split("T")[0],
      waktu: "",
      deskripsi: "",
      bukti: [],
    });
    setSelectedStudent(null);
    setStudentSearch("");
    setShowStudentDropdown(false);
    setEvidenceForm({ file: null, tipe: "image" });
  };

  useEffect(() => {
    fetchHelperData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Memuat data...</p>
          </div>
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
            <FiPlus className="text-blue-600" />
            Tambah Laporan Baru
          </h2>
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
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Siswa *
              </label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={handleStudentSearch}
                  placeholder="Cari siswa berdasarkan nama, NISN, atau kelas..."
                  required={!selectedStudent}
                  className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {selectedStudent && (
                  <button
                    type="button"
                    onClick={clearStudentSelection}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX />
                  </button>
                )}
                {showStudentDropdown && filteredStudents.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                    {filteredStudents.map((student) => (
                      <button
                        key={student.id}
                        type="button"
                        onClick={() => handleSelectStudent(student)}
                        className="w-full px-4 py-3 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none border-b border-gray-100 last:border-b-0"
                      >
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.nama}
                          </p>
                          <p className="text-sm text-gray-600">
                            {student.kelas} • NISN: {student.nisn}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Report Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipe Laporan *
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
              {getCurrentItems().length > 0 ? (
                getCurrentItems().map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nama} ({item.point} poin) - {item.kategori?.nama}
                  </option>
                ))
              ) : (
                <option disabled>
                  Tidak ada data{" "}
                  {form.tipe === "pelanggaran" ? "pelanggaran" : "prestasi"}
                </option>
              )}
            </select>
            {/* Debug info */}
            <p className="text-xs text-gray-500 mt-1">
              Debug:{" "}
              {form.tipe === "pelanggaran"
                ? violations.length
                : achievements.length}{" "}
              item tersedia
            </p>
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
            <h4 className="font-medium text-gray-900 mb-3">
              Upload Bukti Gambar
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
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
                    />
                  </label>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <select
                  name="tipe"
                  value={evidenceForm.tipe}
                  onChange={handleEvidenceFormChange}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="image">Gambar</option>
                  <option value="document">Dokumen</option>
                  <option value="video">Video</option>
                  <option value="other">Lainnya</option>
                </select>
                <button
                  type="button"
                  onClick={addEvidence}
                  disabled={!evidenceForm.file || uploadLoading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg flex items-center justify-center gap-1"
                >
                  {uploadLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Upload...
                    </>
                  ) : (
                    <>
                      <FiPlus size={16} />
                      Tambah
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Evidence List */}
          {form.bukti.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Daftar Bukti:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {form.bukti.map((bukti, index) => (
                  <div
                    key={index}
                    className="relative border border-gray-200 rounded-lg p-3 bg-gray-50"
                  >
                    <div className="aspect-square mb-2 bg-gray-100 rounded-lg overflow-hidden">
                      {bukti.tipe === "image" ? (
                        <img
                          src={`${import.meta.env.VITE_API_BASE_URL}${
                            bukti.url
                          }`}
                          alt={`Bukti ${index + 1}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.src =
                              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23f3f4f6'/%3E%3Ctext x='50' y='50' font-family='Arial' font-size='12' fill='%236b7280' text-anchor='middle' dy='0.3em'%3EGambar tidak dapat dimuat%3C/text%3E%3C/svg%3E";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <FiImage className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium text-gray-900">
                        {bukti.tipe || "File"} {index + 1}
                      </p>
                      <p className="text-xs text-gray-600 truncate">
                        {bukti.originalName || bukti.url.split("/").pop()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeEvidence(index)}
                      className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
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
                  <FiSave /> Simpan Laporan
                </>
              )}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={submitLoading}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed font-medium"
            >
              Reset Form
            </button>
            <button
              type="button"
              onClick={() => navigate("/reports")}
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

export default TambahLaporan;
