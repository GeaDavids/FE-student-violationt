import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../../api/api";
import { fetchWithFallback } from "../../utils/mockDataFallback";
import { FiPlus, FiAward, FiSearch, FiRefreshCw, FiEye } from "react-icons/fi";

const StudentAchievements = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  const fetchData = async () => {
    setLoading(true);
    console.log("Fetching student achievements data...");
    
    try {
      await fetchWithFallback(
        // API call function
        () => API.get("/api/student-achievements"),
        
        // Mock data key
        "studentAchievements", // Kita perlu tambahkan ini ke mockDataFallback.js
        
        // Success callback
        (data) => {
          console.log("Student achievements data:", data);
          setData(data);
          setFiltered(data);
        },
        
        // Error callback
        (error) => {
          console.error("Error fetching student achievements:", error);
          // Only show alert for non-connection errors
          if (error.response) {
            Swal.fire("Error!", "Gagal mengambil data prestasi siswa", "error");
          }
          
          // Jika belum ada data mock, buat data mock sederhana
          const mockData = [
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
          setData(mockData);
          setFiltered(mockData);
        }
      );
    } catch (err) {
      console.error("Unexpected error during fetch:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // Fetch data saat komponen dimount
    fetchData();
    
    // Setup an event listener untuk mendeteksi saat halaman aktif lagi
    const handleFocus = () => {
      // Jika lebih dari 3 detik sejak refresh terakhir, muat ulang data
      if (Date.now() - lastRefresh > 3000) {
        console.log("Window mendapatkan fokus, memuat ulang data prestasi...");
        fetchData();
        setLastRefresh(Date.now());
      }
    };
    
    window.addEventListener("focus", handleFocus);
    
    // Bersihkan event listener ketika komponen unmount
    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Navigate to detail page when clicking on a row
  const handleDetail = (item) => {
    navigate(`/bk/student-achievements/${item.id}`);
  };

  // Navigate to add achievement page
  const handleAddAchievement = () => {
    navigate('/bk/add-achievement');
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    let filtered = data.filter((item) => {
      const siswa = item.student?.user?.name?.toLowerCase() || "";
      const achievement = item.achievement?.nama?.toLowerCase() || "";
      return siswa.includes(value) || achievement.includes(value);
    });
    setFiltered(filtered);
  };
  
  const resetFilters = () => {
    setSearchTerm("");
    setFiltered(data);
  };
  
  const refreshData = async () => {
    setRefreshing(true);
    setLastRefresh(Date.now());
    
    try {
      console.log("Refreshing student achievements data...");
      
      await fetchWithFallback(
        // API call function
        () => API.get("/api/student-achievements"),
        
        // Mock data key
        "studentAchievements",
        
        // Success callback
        (data) => {
          setData(data);
          setFiltered(data);
          // Jika ada kriteria pencarian, terapkan filter
          if (searchTerm) {
            const filtered = data.filter((item) => {
              const siswa = item.student?.user?.name?.toLowerCase() || "";
              const achievement = item.achievement?.nama?.toLowerCase() || "";
              return siswa.includes(searchTerm.toLowerCase()) || 
                    achievement.includes(searchTerm.toLowerCase());
            });
            setFiltered(filtered);
          }
        },
        
        // Error callback
        (error) => {
          console.error("Error refreshing student achievements:", error);
          // Only show alert for non-connection errors
          if (error.response) {
            Swal.fire("Error!", "Gagal memuat ulang data prestasi siswa", "error");
          }
        }
      );
    } catch (err) {
      console.error("Unexpected error during refresh:", err);
    } finally {
      setRefreshing(false);
    }
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
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#003366] flex items-center gap-2 mb-1">
            <FiAward className="text-2xl" /> Prestasi Siswa
          </h2>
          <p className="text-gray-500 text-sm md:text-base">Lihat dan kelola data prestasi siswa.</p>
        </div>
        <button
          onClick={handleAddAchievement}
          className="bg-[#003366] hover:bg-[#002244] transition text-white px-6 py-2 rounded flex items-center gap-2 shadow"
        >
          <FiPlus /> Tambah Prestasi
        </button>
      </div>

      {/* Filter Section */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-white w-full md:w-80">
          <FiSearch className="mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari siswa/prestasi..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full outline-none bg-transparent text-sm"
          />
        </div>
        <button
          onClick={resetFilters}
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded text-sm flex items-center gap-1 border border-gray-300"
        >
          <FiRefreshCw /> Reset
        </button>
        <button
          onClick={refreshData}
          disabled={refreshing}
          className={`px-4 py-2 rounded text-sm flex items-center gap-1 border ${
            refreshing 
              ? "bg-blue-100 border-blue-300 text-blue-500 cursor-not-allowed" 
              : "bg-blue-50 hover:bg-blue-100 border-blue-200 text-blue-700"
          }`}
        >
          <FiRefreshCw className={refreshing ? "animate-spin" : ""} />
          {refreshing ? "Memuat..." : "Muat Ulang Data"}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat data...</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="w-full table-auto min-w-[800px]">
            <thead className="bg-[#f1f5f9] text-[#003366]">
              <tr>
                <th className="border px-4 py-3 text-left font-semibold">Nama Siswa</th>
                <th className="border px-4 py-3 text-left font-semibold">NISN</th>
                <th className="border px-4 py-3 text-left font-semibold">Kelas</th>
                <th className="border px-4 py-3 text-left font-semibold">Prestasi</th>
                <th className="border px-4 py-3 text-center font-semibold">Tingkat</th>
                <th className="border px-4 py-3 text-center font-semibold">Kategori</th>
                <th className="border px-4 py-3 text-center font-semibold">Tanggal</th>
                <th className="border px-4 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((item) => {
                  return (
                    <tr 
                      key={item.id} 
                      className="hover:bg-gray-100 transition cursor-pointer" 
                      onClick={() => handleDetail(item)}
                    >
                      <td className="border px-4 py-2">
                        {item.student?.user?.name || "-"}
                      </td>
                      <td className="border px-4 py-2">{item.student?.nisn || "-"}</td>
                      <td className="border px-4 py-2">{item.student?.classroom?.namaKelas || "-"}</td>
                      <td className="border px-4 py-2">{item.achievement?.nama || "-"}</td>
                      <td className="border px-4 py-2 text-center">
                        <span className="px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 font-medium">
                          {formatTingkat(item.achievement?.tingkat) || "-"}
                        </span>
                      </td>
                      <td className="border px-4 py-2 text-center">
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.achievement?.kategori === 'akademik' 
                            ? 'bg-green-50 text-green-700' 
                            : item.achievement?.kategori === 'non-akademik'
                              ? 'bg-purple-50 text-purple-700'
                              : 'bg-gray-50 text-gray-700'
                        } font-medium`}>
                          {formatKategori(item.achievement?.kategori) || "-"}
                        </span>
                      </td>
                      <td className="border px-4 py-2 text-center">{item.tanggal?.slice(0, 10) || "-"}</td>
                      <td className="border px-4 py-2 text-center">
                        <span className="bg-green-500 text-white px-3 py-1 rounded text-xs inline-block">
                          <FiEye className="inline mr-1" /> Detail
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-6 text-gray-500 text-base">
                    Tidak ada data prestasi siswa.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentAchievements;
