import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../../api/api";
import { fetchWithFallback } from "../../utils/mockDataFallback";
import { FiSave, FiX, FiArrowLeft } from "react-icons/fi";

const AddViolation = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [violationList, setViolationList] = useState([]);
  const [form, setForm] = useState({
    studentId: "",
    violationId: "",
    tanggal: new Date().toISOString().slice(0, 10),
    waktu: "",
    deskripsi: "",
    evidenceUrl: "",
  });

  // Fetch students dan violation untuk dropdown
  const fetchStudents = async () => {
    console.log("Fetching students data...");
    fetchWithFallback(
      // API call function
      () => API.get("/api/users/students"),
      
      // Mock data key
      "students",
      
      // Success callback
      (data) => setStudentList(data),
      
      // Error callback
      (error) => {
        console.error("Error fetching students:", error);
        // Only show alert for non-connection errors (to avoid alert spam during development)
        if (error.response) {
          Swal.fire("Error!", "Gagal mengambil data siswa", "error");
        }
      }
    );
  };
  
  const fetchViolation = async () => {
    console.log("Fetching violations data...");
    fetchWithFallback(
      // API call function
      () => API.get("/api/violations"),
      
      // Mock data key
      "violations",
      
      // Success callback
      (data) => setViolationList(data),
      
      // Error callback
      (error) => {
        console.error("Error fetching violations:", error);
        // Only show alert for non-connection errors
        if (error.response) {
          Swal.fire("Error!", "Gagal mengambil data pelanggaran", "error");
        }
      }
    );
  };

  useEffect(() => {
    fetchStudents();
    fetchViolation();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Prepare payload according to API documentation
    const payload = {
      studentId: form.studentId,
      violationId: form.violationId,
      tanggal: form.tanggal,
      waktu: form.waktu || undefined,
      deskripsi: form.deskripsi || undefined,
      evidenceUrl: form.evidenceUrl || undefined,
    };
    
    try {
      // Use the POST /api/student-violations endpoint as per documentation
      console.log("Creating new violation record");
      const response = await API.post("/api/student-violations", payload);
      console.log("Create response:", response.data);
      
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data pelanggaran siswa berhasil ditambahkan.",
        confirmButtonColor: "#003366",
      }).then(() => {
        // Redirect back to the list page
        navigate("/bk/student-violations");
      });
    } catch (err) {
      console.error("Error saving violation:", err);
      setLoading(false);
      
      // More detailed error handling
      let errorMessage = "Terjadi kesalahan saat menyimpan data.";
      let errorTitle = "Gagal";
      
      if (err.response) {
        // The server responded with an error
        if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = `Error ${err.response.status}: ${err.response.statusText}`;
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorTitle = "Koneksi Gagal";
        errorMessage = "Server tidak merespon. Coba lagi nanti atau periksa koneksi Anda.";
        
        // In development mode, provide a workaround message
        if (import.meta.env.DEV) {
          errorMessage += "\n\nSimulasi berhasil ditambahkan! (Mode Development)";
          
          // Simulate success and redirect in development mode
          Swal.fire({
            icon: "success",
            title: "Berhasil! (Mode Simulasi)",
            text: "Data pelanggaran siswa berhasil ditambahkan.",
            confirmButtonColor: "#003366",
          }).then(() => {
            navigate("/bk/student-violations");
          });
          return;
        }
      }
      
      Swal.fire(errorTitle, errorMessage, "error");
    }
  };

  // Function to check if form is valid
  const isFormValid = () => {
    return form.studentId && form.violationId && form.tanggal;
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header with back button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button 
            onClick={() => navigate("/bk/student-violations")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <FiArrowLeft /> Kembali
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#003366]">
            Tambah Data Pelanggaran Baru
          </h1>
          <p className="text-gray-500 mt-1">
            Isi formulir berikut untuk menambahkan data pelanggaran siswa baru.
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-[#f1f5f9] px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg text-[#003366]">
            Formulir Data Pelanggaran
          </h2>
          <p className="text-sm text-gray-500">
            Kolom bertanda <span className="text-red-500">*</span> wajib diisi
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            {/* Student selection */}
            <div className="form-group">
              <label className="block font-medium text-gray-700 mb-2">
                Siswa <span className="text-red-500">*</span>
              </label>
              <select
                name="studentId"
                value={form.studentId}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition"
              >
                <option value="">-- Pilih Siswa --</option>
                {studentList.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.user?.name} ({student.nisn}) - {student.classroom?.namaKelas || ""}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Pilih siswa yang melakukan pelanggaran
              </p>
            </div>

            {/* Violation selection */}
            <div className="form-group">
              <label className="block font-medium text-gray-700 mb-2">
                Jenis Pelanggaran <span className="text-red-500">*</span>
              </label>
              <select
                name="violationId"
                value={form.violationId}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition"
              >
                <option value="">-- Pilih Pelanggaran --</option>
                {violationList.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.nama} - {v.point} Point ({v.kategori})
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Pilih jenis pelanggaran yang dilakukan
              </p>
            </div>

            {/* Date input */}
            <div className="form-group">
              <label className="block font-medium text-gray-700 mb-2">
                Tanggal <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="tanggal"
                value={form.tanggal}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tanggal pelanggaran terjadi
              </p>
            </div>

            {/* Time input */}
            <div className="form-group">
              <label className="block font-medium text-gray-700 mb-2">
                Waktu
              </label>
              <input
                type="time"
                name="waktu"
                value={form.waktu}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                Waktu pelanggaran (opsional)
              </p>
            </div>

            {/* Evidence URL */}
            <div className="form-group md:col-span-2">
              <label className="block font-medium text-gray-700 mb-2">
                Link Bukti
              </label>
              <input
                type="url"
                name="evidenceUrl"
                value={form.evidenceUrl}
                onChange={handleChange}
                placeholder="https://example.com/bukti-pelanggaran"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                Link ke bukti pelanggaran seperti foto atau video (opsional)
              </p>
            </div>

            {/* Description textarea */}
            <div className="form-group md:col-span-2">
              <label className="block font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                value={form.deskripsi}
                onChange={handleChange}
                rows="4"
                placeholder="Jelaskan detail pelanggaran..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Deskripsi detail tentang pelanggaran yang terjadi (opsional)
              </p>
            </div>
          </div>

          {/* Form buttons */}
          <div className="flex flex-col md:flex-row gap-3 mt-8">
            <button
              type="submit"
              disabled={!isFormValid() || loading}
              className={`flex-1 flex items-center justify-center gap-2 font-medium rounded-lg px-6 py-3 ${
                isFormValid() && !loading
                  ? "bg-[#003366] hover:bg-[#002244] text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              } transition shadow`}
            >
              {loading ? (
                <>
                  <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-r-transparent"></span>
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <FiSave /> Simpan Data Pelanggaran
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/bk/student-violations")}
              className="flex-1 flex items-center justify-center gap-2 font-medium rounded-lg px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition"
            >
              <FiX /> Batal
            </button>
          </div>
        </form>
      </div>

      {/* Informasi tambahan */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-blue-800 mb-2">Informasi Pelanggaran</h3>
        <p className="text-sm text-blue-700">
          Pelanggaran yang dicatat akan mempengaruhi nilai kredit siswa dan dapat memiliki dampak pada status akademik mereka.
          Pastikan informasi yang dimasukkan akurat dan dapat dipertanggungjawabkan.
        </p>
      </div>
    </div>
  );
};

export default AddViolation;
