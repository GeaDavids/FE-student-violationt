import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../../api/api";
import { fetchWithFallback } from "../../utils/mockDataFallback";
import { FiSave, FiX, FiArrowLeft, FiAward } from "react-icons/fi";

// Kategori dan Tingkat Prestasi sesuai API
const kategoriList = [
  { value: "akademik", label: "Akademik" },
  { value: "non-akademik", label: "Non-Akademik" },
  { value: "lainnya", label: "Lainnya" },
];

const tingkatList = [
  { value: "sekolah", label: "Sekolah" },
  { value: "kecamatan", label: "Kecamatan" },
  { value: "kabupaten", label: "Kabupaten" },
  { value: "provinsi", label: "Provinsi" },
  { value: "nasional", label: "Nasional" },
  { value: "internasional", label: "Internasional" },
];

const AddAchievement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [studentList, setStudentList] = useState([]);
  const [achievementList, setAchievementList] = useState([]);
  const [form, setForm] = useState({
    studentId: "",
    achievementId: "",
    tanggal: new Date().toISOString().slice(0, 10),
    buktiUrl: "",
    deskripsi: "",
    // Jika ingin menambahkan prestasi baru
    newAchievement: false,
    nama: "",
    kategori: "akademik",
    tingkat: "sekolah",
    tahun: new Date().getFullYear(),
  });

  // Fetch students dan achievements untuk dropdown
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
  
  const fetchAchievements = async () => {
    console.log("Fetching achievements data...");
    try {
      const response = await API.get("/api/achievements");
      console.log("Achievements data:", response.data);
      setAchievementList(response.data);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      // Fallback untuk mock data (kita perlu tambahkan ke mockDataFallback.js)
      const mockAchievements = [
        { id: 301, nama: "Juara 1 Olimpiade Matematika", kategori: "akademik", tingkat: "provinsi", tahun: 2025 },
        { id: 302, nama: "Juara 2 Lomba Menggambar", kategori: "non-akademik", tingkat: "kabupaten", tahun: 2025 },
        { id: 303, nama: "Juara 3 Lomba Debat", kategori: "akademik", tingkat: "sekolah", tahun: 2024 }
      ];
      setAchievementList(mockAchievements);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchAchievements();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ 
      ...form, 
      [name]: type === "checkbox" ? checked : value 
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let achievementIdToUse = form.achievementId;
      
      // Jika opsi buat prestasi baru dipilih, buat prestasi terlebih dahulu
      if (form.newAchievement) {
        const achievementPayload = {
          nama: form.nama,
          kategori: form.kategori,
          tingkat: form.tingkat,
          tahun: parseInt(form.tahun),
          keterangan: form.deskripsi,
          isActive: true
        };
        
        console.log("Creating new achievement:", achievementPayload);
        const achievementResponse = await API.post("/api/achievements", achievementPayload);
        console.log("Achievement created:", achievementResponse.data);
        
        // Gunakan ID prestasi yang baru dibuat
        achievementIdToUse = achievementResponse.data.id;
      }
      
      // Siapkan payload untuk pencatatan prestasi siswa
      const studentAchievementPayload = {
        studentId: form.studentId,
        achievementId: achievementIdToUse,
        tanggal: form.tanggal,
        buktiUrl: form.buktiUrl || undefined,
        deskripsi: form.deskripsi || undefined
      };
      
      console.log("Creating student achievement record:", studentAchievementPayload);
      const response = await API.post("/api/student-achievements", studentAchievementPayload);
      console.log("Student achievement created:", response.data);
      
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data prestasi siswa berhasil ditambahkan.",
        confirmButtonColor: "#003366",
      }).then(() => {
        // Redirect ke halaman daftar prestasi atau dashboard
        navigate("/bk/student-achievements");
      });
    } catch (err) {
      console.error("Error saving achievement:", err);
      setLoading(false);
      
      // More detailed error handling
      let errorMessage = "Terjadi kesalahan saat menyimpan data prestasi.";
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
            text: "Data prestasi siswa berhasil ditambahkan.",
            confirmButtonColor: "#003366",
          }).then(() => {
            navigate("/bk/student-achievements");
          });
          return;
        }
      }
      
      Swal.fire(errorTitle, errorMessage, "error");
    }
  };

  // Function to check if form is valid
  const isFormValid = () => {
    if (form.newAchievement) {
      return form.studentId && form.nama && form.kategori && form.tingkat && form.tanggal;
    } else {
      return form.studentId && form.achievementId && form.tanggal;
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Header with back button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <button 
            onClick={() => navigate("/bk/student-achievements")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2"
          >
            <FiArrowLeft /> Kembali
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-[#003366]">
            Tambah Prestasi Siswa
          </h1>
          <p className="text-gray-500 mt-1">
            Isi formulir berikut untuk menambahkan data prestasi siswa.
          </p>
        </div>
      </div>

      {/* Form card */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-[#f1f5f9] px-6 py-4 border-b border-gray-200">
          <h2 className="font-semibold text-lg text-[#003366]">
            Formulir Data Prestasi
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
            </div>

            {/* Option to create new achievement or select existing */}
            <div className="form-group md:col-span-2 mb-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="newAchievement"
                  checked={form.newAchievement}
                  onChange={handleChange}
                  className="rounded text-[#003366] focus:ring-[#003366]"
                />
                <span className="text-gray-700">
                  Tambah prestasi baru (tidak ada di daftar)
                </span>
              </label>
            </div>

            {!form.newAchievement ? (
              // Existing achievement selection
              <div className="form-group md:col-span-2">
                <label className="block font-medium text-gray-700 mb-2">
                  Prestasi <span className="text-red-500">*</span>
                </label>
                <select
                  name="achievementId"
                  value={form.achievementId}
                  onChange={handleChange}
                  required={!form.newAchievement}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition"
                >
                  <option value="">-- Pilih Prestasi --</option>
                  {achievementList.map((achievement) => (
                    <option key={achievement.id} value={achievement.id}>
                      {achievement.nama} - {achievement.kategori} ({achievement.tingkat})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              // New achievement form fields
              <>
                <div className="form-group md:col-span-2">
                  <label className="block font-medium text-gray-700 mb-2">
                    Nama Prestasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={form.nama}
                    onChange={handleChange}
                    required={form.newAchievement}
                    placeholder="Contoh: Juara 1 Olimpiade Matematika"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition"
                  />
                </div>
                
                <div className="form-group">
                  <label className="block font-medium text-gray-700 mb-2">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="kategori"
                    value={form.kategori}
                    onChange={handleChange}
                    required={form.newAchievement}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition"
                  >
                    {kategoriList.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="block font-medium text-gray-700 mb-2">
                    Tingkat <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="tingkat"
                    value={form.tingkat}
                    onChange={handleChange}
                    required={form.newAchievement}
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition"
                  >
                    {tingkatList.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="block font-medium text-gray-700 mb-2">
                    Tahun
                  </label>
                  <input
                    type="number"
                    name="tahun"
                    value={form.tahun}
                    onChange={handleChange}
                    min="2000"
                    max="2100"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition"
                  />
                </div>
              </>
            )}

            {/* Evidence URL */}
            <div className="form-group md:col-span-2">
              <label className="block font-medium text-gray-700 mb-2">
                Link Bukti
              </label>
              <input
                type="url"
                name="buktiUrl"
                value={form.buktiUrl}
                onChange={handleChange}
                placeholder="https://example.com/bukti-prestasi"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition"
              />
              <p className="text-xs text-gray-500 mt-1">
                Link ke bukti prestasi seperti foto sertifikat, piala, atau dokumentasi (opsional)
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
                rows="3"
                placeholder="Jelaskan detail tentang prestasi ini..."
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-[#003366] focus:border-[#003366] transition resize-none"
              />
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
                  <FiSave /> Simpan Prestasi
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/bk/student-achievements")}
              className="flex-1 flex items-center justify-center gap-2 font-medium rounded-lg px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition"
            >
              <FiX /> Batal
            </button>
          </div>
        </form>
      </div>

      {/* Informasi tambahan */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
        <h3 className="font-semibold text-blue-800 mb-2">Informasi Pencatatan Prestasi</h3>
        <p className="text-sm text-blue-700">
          Prestasi yang dicatat akan mempengaruhi nilai kredit siswa secara positif. Pastikan informasi yang dimasukkan 
          akurat dan dapat dipertanggungjawabkan dengan bukti yang memadai.
        </p>
      </div>
    </div>
  );
};

export default AddAchievement;
