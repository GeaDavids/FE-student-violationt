import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../../api/api";
import { FiArrowLeft, FiEdit2, FiTrash2, FiCalendar, FiUser, FiAward, FiExternalLink } from "react-icons/fi";

const DetailAchievement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [achievement, setAchievement] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    achievementId: "",
    tanggal: "",
    buktiUrl: "",
    deskripsi: "",
  });
  const [studentList, setStudentList] = useState([]);
  const [achievementList, setAchievementList] = useState([]);

  const fetchAchievement = async () => {
    setLoading(true);
    try {
      console.log(`Fetching detail for achievement ID: ${id}`);
      const response = await API.get(`/api/student-achievements/${id}`);
      console.log("Achievement detail:", response.data);
      
      // Cache busting technique: add a timestamp to force React to recognize it as new data
      const achievementData = {
        ...response.data,
        _timestamp: new Date().getTime() 
      };
      
      setAchievement(achievementData);
      
      // Populate form with existing data for editing
      setForm({
        studentId: response.data.student?.id || "",
        achievementId: response.data.achievement?.id || "",
        tanggal: response.data.tanggal?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        buktiUrl: response.data.buktiUrl || "",
        deskripsi: response.data.deskripsi || "",
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching achievement detail:", err);
      
      // Use mock data as fallback
      const mockData = getMockAchievement(id);
      
      // Add timestamp to mock data too
      mockData._timestamp = new Date().getTime();
      
      setAchievement(mockData);
      
      // Populate form with mock data
      setForm({
        studentId: mockData.student?.id || "",
        achievementId: mockData.achievement?.id || "",
        tanggal: mockData.tanggal?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        buktiUrl: mockData.buktiUrl || "",
        deskripsi: mockData.deskripsi || "",
      });
      setLoading(false);
    }
  };

  const getMockAchievement = (id) => {
    // Mock data for a specific achievement based on ID
    const mockAchievements = [
      {
        id: 1,
        tanggal: "2025-07-15",
        deskripsi: "Juara 1 Olimpiade Matematika Tingkat Provinsi",
        buktiUrl: "https://example.com/bukti-1",
        student: {
          id: 101,
          nisn: "1234567890",
          user: { name: "Ahmad Rizky" },
          classroom: { namaKelas: "XII IPA 1" }
        },
        achievement: {
          id: 301,
          nama: "Juara 1 Olimpiade Matematika",
          kategori: "akademik",
          tingkat: "provinsi",
          tahun: 2025
        }
      },
      {
        id: 2,
        tanggal: "2025-06-20",
        deskripsi: "Juara 2 Lomba Menggambar Tingkat Kabupaten",
        buktiUrl: null,
        student: {
          id: 103,
          nisn: "5678901234",
          user: { name: "Citra Dewi" },
          classroom: { namaKelas: "X IPA 3" }
        },
        achievement: {
          id: 302,
          nama: "Juara 2 Lomba Menggambar",
          kategori: "non-akademik",
          tingkat: "kabupaten",
          tahun: 2025
        }
      }
    ];
    
    return mockAchievements.find(v => v.id === parseInt(id)) || mockAchievements[0];
  };

  const fetchStudents = async () => {
    try {
      const response = await API.get("/api/users/students");
      setStudentList(response.data);
    } catch (error) {
      console.error("Error fetching students:", error);
      // Gunakan data mock jika API gagal
      setStudentList([
        { id: 101, nisn: "1234567890", user: { name: "Ahmad Rizky" }, classroom: { namaKelas: "XII IPA 1" } },
        { id: 102, nisn: "0987654321", user: { name: "Budi Santoso" }, classroom: { namaKelas: "XI IPS 2" } },
        { id: 103, nisn: "5678901234", user: { name: "Citra Dewi" }, classroom: { namaKelas: "X IPA 3" } },
      ]);
    }
  };
  
  const fetchAchievementTypes = async () => {
    try {
      const response = await API.get("/api/achievements");
      setAchievementList(response.data);
    } catch (error) {
      console.error("Error fetching achievements:", error);
      // Gunakan data mock jika API gagal
      setAchievementList([
        { id: 301, nama: "Juara 1 Olimpiade Matematika", kategori: "akademik", tingkat: "provinsi", tahun: 2025 },
        { id: 302, nama: "Juara 2 Lomba Menggambar", kategori: "non-akademik", tingkat: "kabupaten", tahun: 2025 },
        { id: 303, nama: "Juara 3 Lomba Debat", kategori: "akademik", tingkat: "sekolah", tahun: 2024 }
      ]);
    }
  };

  useEffect(() => {
    fetchAchievement();
    fetchStudents();
    fetchAchievementTypes();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Prepare payload according to API documentation
    const payload = {
      studentId: form.studentId,
      achievementId: form.achievementId,
      tanggal: form.tanggal,
      buktiUrl: form.buktiUrl || undefined,
      deskripsi: form.deskripsi || undefined,
    };
    
    try {
      console.log(`Updating achievement with ID: ${id}`);
      const response = await API.put(`/api/student-achievements/${id}`, payload);
      console.log("Update response:", response.data);
      
      // Refresh achievement data completely from server
      await fetchAchievement();
      setFormVisible(false);
      setLoading(false);
      
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data prestasi siswa berhasil diperbarui.",
        confirmButtonColor: "#003366",
      });
    } catch (err) {
      console.error("Error updating achievement:", err);
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
          errorMessage += "\n\nSimulasi berhasil diperbarui! (Mode Development)";
          
          // Mock a successful response in development
          const updatedAchievement = {
            ...achievement,
            tanggal: payload.tanggal,
            buktiUrl: payload.buktiUrl,
            deskripsi: payload.deskripsi,
            student: studentList.find(s => s.id.toString() === payload.studentId.toString()),
            achievement: achievementList.find(a => a.id.toString() === payload.achievementId.toString()),
            _timestamp: new Date().getTime()
          };
          
          setAchievement(updatedAchievement);
          setFormVisible(false);
          setLoading(false);
          
          Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "Data prestasi siswa berhasil diperbarui (mode simulasi).",
            confirmButtonColor: "#003366",
          });
          return;
        }
      }
      
      Swal.fire(errorTitle, errorMessage, "error");
    }
  };

  const handleDelete = () => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data prestasi tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      confirmButtonColor: "#d33",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log(`Deleting achievement with ID: ${id}`);
          const response = await API.delete(`/api/student-achievements/${id}`);
          console.log("Delete response:", response.data);
          
          Swal.fire({
            icon: "success",
            title: "Terhapus!",
            text: "Data prestasi siswa telah dihapus.",
            confirmButtonColor: "#003366",
          });
          
          // Navigate back to the list page
          navigate("/bk/student-achievements");
        } catch (err) {
          console.error("Error deleting achievement:", err);
          
          // More detailed error handling
          let errorMessage = "Gagal menghapus data.";
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
            
            // In development mode, provide a workaround message and simulate success
            if (import.meta.env.DEV) {
              errorMessage += "\n\nSimulasi berhasil dihapus! (Mode Development)";
              
              // Show success message instead of error and navigate back
              Swal.fire({
                icon: "success",
                title: "Terhapus!",
                text: "Data prestasi siswa telah dihapus (mode simulasi).",
                confirmButtonColor: "#003366",
              });
              navigate("/bk/student-achievements");
              return; // Don't show the error message
            }
          }
          
          Swal.fire(errorTitle, errorMessage, "error");
        }
      }
    });
  };

  // Format tingkat dan kategori untuk tampilan
  const formatTingkat = (tingkat) => {
    const map = {
      'sekolah': 'Sekolah',
      'kecamatan': 'Kecamatan',
      'kabupaten': 'Kabupaten',
      'provinsi': 'Provinsi',
      'nasional': 'Nasional',
      'internasional': 'Internasional'
    };
    return map[tingkat] || tingkat;
  };

  const formatKategori = (kategori) => {
    const map = {
      'akademik': 'Akademik',
      'non-akademik': 'Non-Akademik',
      'lainnya': 'Lainnya'
    };
    return map[kategori] || kategori;
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <button 
          onClick={() => navigate("/bk/student-achievements")}
          className="flex items-center gap-2 text-[#003366] hover:text-[#002244] transition"
        >
          <FiArrowLeft /> Kembali ke Daftar Prestasi
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#003366] mb-1">
            Detail Prestasi Siswa
          </h2>
          {!loading && achievement && (
            <p className="text-gray-500 text-sm md:text-base">
              {achievement.student?.user?.name} - {achievement.achievement?.nama}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFormVisible(true)}
            className="bg-yellow-400 hover:bg-yellow-500 transition text-white px-4 py-2 rounded flex items-center gap-2 shadow"
          >
            <FiEdit2 /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded flex items-center gap-2 shadow"
          >
            <FiTrash2 /> Hapus
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat data...</p>
        </div>
      ) : achievement ? (
        <>
          {/* Detail View */}
          {!formVisible && (
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              {/* Student and Achievement Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
                    <FiUser /> Informasi Siswa
                  </h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-2 text-gray-600 font-medium">Nama</td>
                        <td className="py-2 pl-4">{achievement.student?.user?.name || "-"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600 font-medium">NISN</td>
                        <td className="py-2 pl-4">{achievement.student?.nisn || "-"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600 font-medium">Kelas</td>
                        <td className="py-2 pl-4">{achievement.student?.classroom?.namaKelas || "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
                    <FiAward /> Informasi Prestasi
                  </h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-2 text-gray-600 font-medium">Prestasi</td>
                        <td className="py-2 pl-4">{achievement.achievement?.nama || "-"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600 font-medium">Kategori</td>
                        <td className="py-2 pl-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            achievement.achievement?.kategori === 'akademik' 
                              ? 'bg-green-50 text-green-700' 
                              : achievement.achievement?.kategori === 'non-akademik'
                                ? 'bg-purple-50 text-purple-700'
                                : 'bg-gray-50 text-gray-700'
                          } font-medium`}>
                            {formatKategori(achievement.achievement?.kategori) || "-"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600 font-medium">Tingkat</td>
                        <td className="py-2 pl-4">
                          <span className="px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 font-medium">
                            {formatTingkat(achievement.achievement?.tingkat) || "-"}
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600 font-medium">Tahun</td>
                        <td className="py-2 pl-4">{achievement.achievement?.tahun || "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Date and Description */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
                  <FiCalendar /> Detail Pencapaian
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Tanggal</p>
                    <p>{achievement.tanggal?.slice(0, 10) || "-"}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-gray-600 font-medium mb-1">Deskripsi</p>
                  <p className="bg-gray-50 p-3 rounded">{achievement.deskripsi || "-"}</p>
                </div>
                {achievement.buktiUrl && (
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Bukti</p>
                    <a 
                      href={achievement.buktiUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 underline flex items-center gap-1 hover:text-blue-800"
                    >
                      <FiExternalLink /> Lihat Bukti Prestasi
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Edit Form */}
          {formVisible && (
            <div className="bg-white rounded-xl shadow p-6 mb-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
                <FiEdit2 /> Edit Data Prestasi
              </h3>
              <form
                onSubmit={handleUpdate}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-sm mb-1">Siswa <span className="text-red-500">*</span></label>
                  <select
                    name="studentId"
                    value={form.studentId}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#003366]"
                  >
                    <option value="">Pilih Siswa</option>
                    {studentList.map((student) => (
                      <option key={student.id} value={student.id}>
                        {student.user?.name} ({student.nisn})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-sm mb-1">Prestasi <span className="text-red-500">*</span></label>
                  <select
                    name="achievementId"
                    value={form.achievementId}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#003366]"
                  >
                    <option value="">Pilih Prestasi</option>
                    {achievementList.map((achievement) => (
                      <option key={achievement.id} value={achievement.id}>
                        {achievement.nama} ({formatTingkat(achievement.tingkat)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="font-medium text-sm mb-1">Tanggal <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    name="tanggal"
                    value={form.tanggal}
                    onChange={handleChange}
                    required
                    className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#003366]"
                  />
                </div>
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="font-medium text-sm mb-1">Link Bukti</label>
                  <input
                    type="url"
                    name="buktiUrl"
                    value={form.buktiUrl}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#003366]"
                    placeholder="Link bukti prestasi (opsional)"
                  />
                </div>
                <div className="flex flex-col gap-1 md:col-span-2">
                  <label className="font-medium text-sm mb-1">Deskripsi</label>
                  <textarea
                    name="deskripsi"
                    value={form.deskripsi}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#003366]"
                    rows="3"
                  />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    className="bg-[#003366] hover:bg-[#002244] transition text-white px-6 py-3 rounded font-semibold shadow"
                  >
                    Simpan Perubahan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormVisible(false)}
                    className="bg-gray-300 hover:bg-gray-400 transition px-6 py-3 rounded font-semibold shadow"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-red-500">Data prestasi tidak ditemukan</p>
          <button 
            onClick={() => navigate("/bk/student-achievements")}
            className="mt-4 bg-[#003366] hover:bg-[#002244] transition text-white px-4 py-2 rounded"
          >
            Kembali ke Daftar Prestasi
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailAchievement;
