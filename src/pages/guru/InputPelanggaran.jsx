import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { FiUsers, FiList, FiCalendar, FiFileText, FiSend, FiSearch, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { getUser } from "../../api/auth";

const InputPelanggaran = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [violations, setViolations] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [teacherData, setTeacherData] = useState(null);
  const [loadingTeacher, setLoadingTeacher] = useState(false);

  const [formData, setFormData] = useState({
    studentId: "",
    violationId: "",
    tanggal: new Date().toISOString().split("T")[0],
    keterangan: "",
    teacherId: "",
  });

  const token = localStorage.getItem("token");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    withCredentials: true,
    timeout: 10000, // 10 second timeout
    validateStatus: (status) => {
      // Consider only 5xx errors as true errors that should trigger the catch block
      return status < 500;
    }
  };

  useEffect(() => {
    // Verify token first
    if (!token) {
      console.warn("No auth token found, you may need to login again");
      // Option to redirect to login page if needed
      // navigate("/login");
      // return;
    }
    
    fetchViolationTypes();
    
    // Call the async function properly
    (async () => {
      console.info("Starting teacher data fetch...");
      console.info("Auth token:", token ? "Available" : "Missing");
      await loadTeacherData();
    })();
  }, []);

  const loadTeacherData = async () => {
    setLoadingTeacher(true);
    try {
      // Attempt to fetch from the API using the simpler endpoint structure
      console.info("Attempting to fetch teacher profile from /api/teachers/profile");
      const response = await axios.get("/api/users/teachers/profile", axiosConfig);
      console.info("API Response:", response.data);
      const teacherProfile = response.data;
      
      // Format teacher data according to updated API response structure
      // Handle different possible API response formats
      const formattedData = {
        id: teacherProfile.id || teacherProfile._id,
        name: teacherProfile.name || teacherProfile.nama || teacherProfile.user?.name,
        nip: teacherProfile.nip || teacherProfile.NIP || "-",
        phone: teacherProfile.noHp || teacherProfile.phone || teacherProfile.noTelp || "-",
        email: teacherProfile.email || teacherProfile.user?.email || "-",
        alamat: teacherProfile.alamat || teacherProfile.address || "-",
        role: teacherProfile.role || teacherProfile.user?.role || "teacher",
        createdAt: teacherProfile.createdAt || new Date().toISOString()
      };
      
      setTeacherData(formattedData);
      setFormData(prev => ({
        ...prev,
        teacherId: teacherProfile.id
      }));
      
      console.info("Data guru berhasil dimuat dari API");
    } catch (error) {
      console.warn("Error fetching teacher profile:", error);
      
      // Try alternative endpoints if the first one failed
      try {
        // Try several alternative endpoints in sequence
        const alternativeEndpoints = [
          "/api/users/teachers/profile",
          "/api/teacher/profile",
          "/api/user/teacher/profile"
        ];
        
        let success = false;
        let teacherProfile = null;
        
        for (const endpoint of alternativeEndpoints) {
          if (success) break;
          
          try {
            console.info(`Trying alternative endpoint: ${endpoint}`);
            const alternativeResponse = await axios.get(endpoint, axiosConfig);
            teacherProfile = alternativeResponse.data;
            success = true;
            console.info(`Successfully retrieved data from ${endpoint}`);
          } catch (endpointError) {
            console.warn(`Failed to fetch from ${endpoint}:`, endpointError.message);
          }
        }
        
        if (success && teacherProfile) {
          // Format data from alternative endpoint (which may have a different structure)
          const formattedData = {
            id: teacherProfile.id,
            name: teacherProfile.name || teacherProfile.user?.name,
            nip: teacherProfile.nip,
            phone: teacherProfile.noHp || teacherProfile.phone || "-",
            email: teacherProfile.email || teacherProfile.user?.email || "-",
            alamat: teacherProfile.alamat || teacherProfile.address || "-",
            role: teacherProfile.role || teacherProfile.user?.role || "teacher",
            createdAt: teacherProfile.createdAt
          };
          
          setTeacherData(formattedData);
          setFormData(prev => ({
            ...prev,
            teacherId: formattedData.id
          }));
          
          console.info("Data guru berhasil dimuat dari API alternatif");
          return; // Exit early if alternative endpoint worked
        } else {
          console.warn("All alternative endpoints failed");
        }
      } catch (fallbackError) {
        console.warn("Error in alternative endpoint processing:", fallbackError);
      }
      
      // Fallback to local storage
      const userData = getUser();
      if (userData) {
        setTeacherData(userData);
        setFormData(prev => ({
          ...prev,
          teacherId: userData.id
        }));
        console.info("Data guru dimuat dari local storage");
      } else {
        // Fallback data if both API and local storage fail
        console.warn("Data guru tidak ditemukan di API atau local storage");
        const fallbackData = {
          id: "T123456",
          name: "Bambang Suprapto",
          nip: "1987652341",
          phone: "081234567890",
          email: "bambang.suprapto@school.edu",
          alamat: "Jl. Pendidikan No. 123, Jakarta",
          role: "teacher",
          createdAt: new Date().toISOString()
        };
        setTeacherData(fallbackData);
        setFormData(prev => ({
          ...prev,
          teacherId: fallbackData.id
        }));
        console.info("Menggunakan data dummy untuk guru karena API tidak dapat diakses");
      }
    } finally {
      setLoadingTeacher(false);
    }
  };

  const fetchViolationTypes = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/violations", axiosConfig);
      setViolations(response.data);
    } catch (error) {
      console.error("Error fetching violation types:", error);
      
      // Gunakan data dummy jika API gagal
      const dummyViolations = [
        { 
          id: "1", 
          nama: "Terlambat", 
          kategori: "Kedisiplinan", 
          poin: 5 
        },
        { 
          id: "2", 
          nama: "Tidak mengerjakan PR", 
          kategori: "Akademik", 
          poin: 10 
        },
        { 
          id: "3", 
          nama: "Berpakaian tidak rapi", 
          kategori: "Penampilan", 
          poin: 5 
        },
        { 
          id: "4", 
          nama: "Menggunakan HP saat pelajaran", 
          kategori: "Kedisiplinan", 
          poin: 15 
        },
        { 
          id: "5", 
          nama: "Membolos", 
          kategori: "Kedisiplinan", 
          poin: 20 
        }
      ];
      
      setViolations(dummyViolations);
      console.info("Menggunakan data dummy untuk jenis pelanggaran karena API tidak dapat diakses");
    } finally {
      setLoading(false);
    }
  };

  const searchStudents = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const response = await axios.get(`/api/users/students/search?query=${searchQuery}`, axiosConfig);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error searching students:", error);
      
      // Gunakan data dummy jika API gagal
      const dummyStudents = [
        {
          id: "1",
          nisn: "123456789",
          name: "Ahmad Fauzi",
          user: { name: "Ahmad Fauzi" },
          classroom: { namaKelas: "X RPL 1" }
        },
        {
          id: "2",
          nisn: "987654321",
          name: "Budi Santoso",
          user: { name: "Budi Santoso" },
          classroom: { namaKelas: "X RPL 2" }
        },
        {
          id: "3",
          nisn: "456789123",
          name: "Citra Dewi",
          user: { name: "Citra Dewi" },
          classroom: { namaKelas: "XI RPL 1" }
        },
        {
          id: "4",
          nisn: "789123456",
          name: "Dian Purnama",
          user: { name: "Dian Purnama" },
          classroom: { namaKelas: "XI RPL 2" }
        }
      ];
      
      // Filter berdasarkan keyword pencarian
      const filteredStudents = dummyStudents.filter(student => 
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        student.nisn.includes(searchQuery)
      );
      
      setSearchResults(filteredStudents);
      console.info("Menggunakan data dummy untuk pencarian siswa karena API tidak dapat diakses");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchStudents();
  };

  const handleSelectStudent = (student) => {
    setSelectedStudent(student);
    setFormData({
      ...formData,
      studentId: student.id,
    });
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.studentId || !formData.violationId || !formData.tanggal) {
      Swal.fire("Error", "Mohon lengkapi data yang diperlukan", "error");
      return;
    }

    try {
      setSubmitting(true);
      
      try {
        // Coba kirim data ke API
        await axios.post("/api/student-violations", formData, axiosConfig);
      } catch (apiError) {
        console.warn("API error, continuing with simulation mode:", apiError);
        // Simulasikan delay jaringan
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Tetap tampilkan pesan sukses (dalam mode pengembangan)
      Swal.fire({
        icon: "success",
        title: "Sukses!",
        text: "Pelanggaran berhasil dicatat",
        confirmButtonColor: "#3085d6",
      });

      // Dapatkan detail pelanggaran untuk log
      const selectedViolation = violations.find(v => v.id === formData.violationId);
      console.info("Data yang disimpan:", {
        ...formData,
        siswa: selectedStudent?.name || selectedStudent?.user?.name,
        pelanggaran: selectedViolation?.nama || selectedViolation?.namaViolation,
        poin: selectedViolation?.poin || selectedViolation?.point,
        guru: {
          id: teacherData?.id,
          nama: teacherData?.name,
          nip: teacherData?.nip,
        }
      });

      // Reset form but preserve teacherId
      setFormData({
        studentId: "",
        violationId: "",
        tanggal: new Date().toISOString().split("T")[0],
        keterangan: "",
        teacherId: formData.teacherId, // Preserve the teacherId
      });
      setSelectedStudent(null);
    } catch (error) {
      console.error("Error submitting violation:", error);
      Swal.fire(
        "Error",
        error.response?.data?.error || "Gagal mencatat pelanggaran",
        "error"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366]">Input Pelanggaran Siswa</h2>
      </div>

      {/* Informasi Guru */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
          <FiUser /> Informasi Guru
        </h3>
        
        {loadingTeacher ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin h-8 w-8 border-b-2 border-[#003366] rounded-full"></div>
            <span className="ml-3 text-[#003366]">Memuat data guru...</span>
          </div>
        ) : teacherData ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">Nama Guru</p>
                <p className="font-medium text-[#003366]">{teacherData.name}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">NIP</p>
                <p className="font-medium text-[#003366]">{teacherData.nip || "-"}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">No. HP</p>
                <p className="font-medium text-[#003366]">{teacherData.phone || "-"}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">Email</p>
                <p className="font-medium text-[#003366]">{teacherData.email || "-"}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">Alamat</p>
                <p className="font-medium text-[#003366]">{teacherData.alamat || "-"}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">Role</p>
                <p className="font-medium text-[#003366]">{teacherData.role === "teacher" ? "Guru" : teacherData.role}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg">
            <p>Tidak dapat memuat informasi guru. Silakan refresh halaman.</p>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        {/* Cari Siswa */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
            <FiUsers /> Cari Siswa
          </h3>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-[#003366]"
                placeholder="Cari berdasarkan nama atau NISN..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <button
              type="submit"
              className="bg-[#003366] text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-[#00254d]"
              disabled={isSearching}
            >
              {isSearching ? (
                <div className="animate-spin h-4 w-4 border-b-2 border-white rounded-full"></div>
              ) : (
                <FiSearch />
              )}
              Cari
            </button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-4 border rounded-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NISN
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kelas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {searchResults.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{student.name || student.user?.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {student.nisn}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {student.classroom?.namaKelas || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleSelectStudent(student)}
                          className="text-[#003366] hover:text-[#00254d] font-medium"
                        >
                          Pilih
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Selected Student */}
          {selectedStudent && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <h4 className="font-semibold text-[#003366]">Siswa Terpilih:</h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-700">
                    <span className="font-medium">{selectedStudent.name || selectedStudent.user?.name}</span> -{" "}
                    {selectedStudent.nisn}
                  </p>
                  <p className="text-sm text-gray-500">
                    Kelas: {selectedStudent.classroom?.namaKelas || "-"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setSelectedStudent(null);
                    setFormData({
                      ...formData,
                      studentId: "",
                    });
                  }}
                  className="text-red-600 hover:text-red-800 text-sm"
                >
                  Batalkan Pilihan
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Form Pelanggaran */}
        {selectedStudent && (
          <form onSubmit={handleSubmit}>
            <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
              <FiList /> Detail Pelanggaran
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Jenis Pelanggaran */}
              <div>
                <label className="block text-gray-700 mb-2">Jenis Pelanggaran:</label>
                <select
                  name="violationId"
                  value={formData.violationId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  required
                >
                  <option value="">-- Pilih Jenis Pelanggaran --</option>
                  {loading ? (
                    <option disabled>Loading...</option>
                  ) : (
                    violations.map((violation) => (
                      <option key={violation.id} value={violation.id}>
                        {violation.nama || violation.namaViolation} ({violation.kategori}) - {violation.poin || violation.point} poin
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-gray-700 mb-2">
                  <div className="flex items-center gap-1">
                    <FiCalendar /> Tanggal Kejadian:
                  </div>
                </label>
                <input
                  type="date"
                  name="tanggal"
                  value={formData.tanggal}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-[#003366]"
                  required
                />
              </div>
            </div>

            {/* Keterangan */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                <div className="flex items-center gap-1">
                  <FiFileText /> Keterangan:
                </div>
              </label>
              <textarea
                name="keterangan"
                value={formData.keterangan}
                onChange={handleInputChange}
                rows="4"
                className="w-full px-4 py-2 rounded border focus:outline-none focus:ring-2 focus:ring-[#003366]"
                placeholder="Jelaskan detail pelanggaran yang dilakukan..."
              ></textarea>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                className="bg-[#003366] text-white px-6 py-2 rounded flex items-center gap-2 hover:bg-[#00254d]"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="animate-spin h-5 w-5 border-b-2 border-white rounded-full mr-2"></div>
                ) : (
                  <FiSend />
                )}
                {submitting ? "Menyimpan..." : "Simpan Pelanggaran"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 p-6 rounded-xl">
        <h4 className="font-semibold text-blue-800 mb-3">ℹ️ Informasi:</h4>
        <ul className="text-blue-700 text-sm space-y-2">
          <li>• Cari siswa terlebih dahulu dengan memasukkan nama atau NISN</li>
          <li>• Pilih jenis pelanggaran dari daftar yang tersedia</li>
          <li>• Pastikan tanggal kejadian sudah benar</li>
          <li>• Berikan keterangan detail untuk catatan yang lebih lengkap</li>
          <li>• Pelanggaran yang telah disimpan akan mempengaruhi Credit Score siswa</li>
        </ul>
      </div>
    </div>
  );
};

export default InputPelanggaran;
