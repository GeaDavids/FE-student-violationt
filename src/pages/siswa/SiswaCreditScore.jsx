import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import {
  FiUser,
  FiAward,
  FiTrendingUp,
  FiTrendingDown,
  FiInfo,
  FiCalendar,
  FiStar,
  FiActivity,
} from "react-icons/fi";

const SiswaCreditScore = () => {
  const [creditScore, setCreditScore] = useState(null);
  const [violations, setViolations] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [siswaInfo, setSiswaInfo] = useState(null);

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString('id-ID');
  };

  const fetchSiswaData = async () => {
    try {
      setLoading(true);
      // Get student profile with credit score and basic info
      const profileRes = await axios.get(`/api/users/students/profile`, axiosConfig);
      const profileData = profileRes.data;
      
      console.log("Data profil siswa:", profileData);
      
      // Set credit score
      setCreditScore({
        totalScore: profileData.totalScore || profileData.statistics?.currentScore || 100,
        ...profileData.statistics
      });
      
      // Set student info dan log struktur data untuk debugging
      console.log("Wali Kelas:", profileData.classroom?.waliKelas);
      setSiswaInfo(profileData);

      // Get violations with pagination
      const violationsRes = await axios.get(`/api/users/students/my-violations?page=1&limit=10`, axiosConfig);
      console.log("Data pelanggaran:", violationsRes.data);
      
      // Make sure we have an array for violations
      if (Array.isArray(violationsRes.data)) {
        setViolations(violationsRes.data);
      } else if (violationsRes.data && Array.isArray(violationsRes.data.data)) {
        // Handle if response has a data property that contains the array (sesuai struktur API)
        setViolations(violationsRes.data.data);
      } else {
        console.warn("Unexpected violations data format:", violationsRes.data);
        setViolations([]);
      }
      
      // Get achievements
      const achievementsRes = await axios.get(`/api/users/students/my-achievements?page=1&limit=10`, axiosConfig);
      // Make sure we have an array for achievements
      if (Array.isArray(achievementsRes.data)) {
        setAchievements(achievementsRes.data);
      } else if (achievementsRes.data && Array.isArray(achievementsRes.data.data)) {
        // Handle if response has a data property that contains the array
        setAchievements(achievementsRes.data.data);
      } else {
        console.warn("Unexpected achievements data format:", achievementsRes.data);
        setAchievements([]);
      }

    } catch (err) {
      console.error("Gagal mengambil data siswa:", err);
      Swal.fire("Error!", "Gagal mengambil data credit score", "error");
      // Initialize empty arrays on error
      setViolations([]);
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSiswaData();
  }, []);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getScoreStatus = (score) => {
    if (score >= 100) return "SANGAT BAIK";
    if (score >= 80) return "BAIK";
    if (score >= 60) return "CUKUP";
    if (score >= 40) return "PERLU PERHATIAN";
    return "KRITIS";
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
          <FiAward /> Credit Score Saya
        </h2>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-2 text-gray-500">Memuat data...</p>
        </div>
      ) : (
        <>
          {/* Profil Siswa */}
          {siswaInfo && (
            <div className="bg-white rounded-xl shadow p-6 mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-[#003366] text-white rounded-full w-16 h-16 flex items-center justify-center">
                  <FiUser size={24} />
                </div>
                <div className="grow">
                  <h3 className="text-xl font-bold text-[#003366]">{siswaInfo.name || siswaInfo.user?.name}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 mt-1">
                    <p className="text-gray-600">NISN: {siswaInfo.nisn}</p>
                    <p className="text-gray-600">Kelas: {siswaInfo.classroom?.namaKelas}</p>
                    <p className="text-gray-600">Angkatan: {siswaInfo.angkatan?.tahun || siswaInfo.angkatan?.year}</p>
                    <p className="text-gray-600">Wali Kelas: {
                      siswaInfo.classroom?.waliKelas?.user?.name || 
                      siswaInfo.classroom?.waliKelas?.name ||
                      '-'
                    }</p>
                    {siswaInfo.orangTua && (
                      <p className="text-gray-600">Orang Tua: {siswaInfo.orangTua?.user?.name || siswaInfo.orangTua?.nama || '-'}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Credit Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className={`rounded-xl shadow p-8 text-center ${getScoreBg(creditScore?.totalScore || 0)}`}>
              <div className="flex items-center justify-center mb-4">
                <FiAward size={48} className={getScoreColor(creditScore?.totalScore || 0)} />
              </div>
              <h3 className="text-3xl font-bold mb-2 text-gray-800">
                {creditScore?.totalScore || 0}
              </h3>
              <p className="text-lg font-semibold mb-2 text-gray-700">Credit Score</p>
              <p className={`text-sm font-bold ${getScoreColor(creditScore?.totalScore || 0)}`}>
                {getScoreStatus(creditScore?.totalScore || 0)}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-6">
              <h4 className="text-lg font-semibold text-[#003366] mb-4">Informasi Score</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pelanggaran:</span>
                  <span className="font-semibold text-red-600">
                    {creditScore?.totalViolations || violations.length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Prestasi:</span>
                  <span className="font-semibold text-green-600">
                    {creditScore?.totalAchievements || achievements.length}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between font-bold">
                  <span>Score Saat Ini:</span>
                  <span className={getScoreColor(creditScore?.totalScore || 0)}>
                    {creditScore?.totalScore || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Riwayat Pelanggaran */}
          <div className="bg-white rounded-xl shadow p-6 mb-6">
            <h4 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
              <FiInfo /> Riwayat Pelanggaran
            </h4>
            
            {violations.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto border border-gray-300 rounded">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border px-4 py-2 text-left">Tanggal</th>
                      <th className="border px-4 py-2 text-left">Jenis Pelanggaran</th>
                      <th className="border px-4 py-2 text-left">Kategori</th>
                      <th className="border px-4 py-2 text-center">Poin</th>
                      <th className="border px-4 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {violations.map((violation) => (
                      <tr key={violation.id} className="hover:bg-gray-50">
                        <td className="border px-4 py-2">
                          {formatDateForDisplay(violation.tglKejadian || violation.tanggal)}
                        </td>
                        <td className="border px-4 py-2">
                          {violation.violation?.namaViolation || violation.violation?.nama}
                        </td>
                        <td className="border px-4 py-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {violation.violation?.kategori}
                          </span>
                        </td>
                        <td className="border px-4 py-2 text-center font-bold text-red-600">
                          -{violation.violation?.poin || violation.violation?.point}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            violation.status === 'selesai' ? 'bg-green-100 text-green-800' :
                            violation.status === 'proses' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {violation.status || 'Tercatat'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FiAward size={48} className="mx-auto text-green-500 mb-4" />
                <p className="text-gray-500">Selamat! Anda belum memiliki pelanggaran</p>
                <p className="text-sm text-gray-400">Pertahankan prestasi Anda</p>
              </div>
            )}
          </div>
          
          {/* Riwayat Prestasi */}
          <div className="bg-white rounded-xl shadow p-6">
            <h4 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
              <FiStar className="text-yellow-500" /> Prestasi Siswa
            </h4>
            
            {achievements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto border border-gray-300 rounded">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border px-4 py-2 text-left">Tanggal</th>
                      <th className="border px-4 py-2 text-left">Prestasi</th>
                      <th className="border px-4 py-2 text-left">Jenis</th>
                      <th className="border px-4 py-2 text-center">Tingkat</th>
                      <th className="border px-4 py-2 text-left">Penyelenggara</th>
                    </tr>
                  </thead>
                  <tbody>
                    {achievements.map((achievement) => (
                      <tr key={achievement.id} className="hover:bg-gray-50">
                        <td className="border px-4 py-2">
                          {formatDateForDisplay(achievement.tanggal)}
                        </td>
                        <td className="border px-4 py-2 font-medium">
                          {achievement.nama}
                        </td>
                        <td className="border px-4 py-2">
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                            {achievement.jenis}
                          </span>
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            achievement.tingkat === 'Internasional' ? 'bg-purple-100 text-purple-800' :
                            achievement.tingkat === 'Nasional' ? 'bg-indigo-100 text-indigo-800' :
                            achievement.tingkat === 'Provinsi' ? 'bg-blue-100 text-blue-800' :
                            achievement.tingkat === 'Kabupaten/Kota' ? 'bg-teal-100 text-teal-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {achievement.tingkat}
                          </span>
                        </td>
                        <td className="border px-4 py-2 text-sm text-gray-600">
                          {achievement.penyelenggara || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <FiActivity size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">Belum ada prestasi yang tercatat</p>
                <p className="text-sm text-gray-400">Tetap semangat untuk meraih prestasi!</p>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="mt-6 bg-blue-50 p-6 rounded-xl">
            <h4 className="font-semibold text-blue-800 mb-3">💡 Tips Meningkatkan Credit Score:</h4>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• Patuhi semua peraturan sekolah</li>
              <li>• Datang tepat waktu ke sekolah</li>
              <li>• Jaga kebersihan dan ketertiban</li>
              <li>• Hormati guru dan teman</li>
              <li>• Aktif dalam kegiatan sekolah</li>
            </ul>
          </div>
          
          {/* Analisis dan Rekomendasi */}
          {creditScore && (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-yellow-50 p-6 rounded-xl">
                <h4 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                  <FiActivity /> Analisis Perilaku
                </h4>
                <div className="text-yellow-700 text-sm space-y-2">
                  <p><strong>Status Skor:</strong> {getScoreStatus(creditScore?.totalScore || 0)}</p>
                  <p><strong>Tren:</strong> {
                    Array.isArray(violations) && violations.length > 0 && violations[0]?.tanggal && new Date(violations[0]?.tanggal) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
                    ? "Terdapat pelanggaran dalam 30 hari terakhir"
                    : "Tidak ada pelanggaran baru dalam 30 hari terakhir"
                  }</p>
                  <p><strong>Area Perhatian:</strong> {
                    Array.isArray(violations) && violations.length > 0 
                    ? (() => {
                        const categories = {};
                        violations.forEach(v => {
                          const kategori = v.violation?.kategori;
                          if (kategori) {
                            if (!categories[kategori]) categories[kategori] = 0;
                            categories[kategori]++;
                          }
                        });
                        
                        let maxCategory = null;
                        let maxCount = 0;
                        
                        Object.keys(categories).forEach(cat => {
                          if (categories[cat] > maxCount) {
                            maxCount = categories[cat];
                            maxCategory = cat;
                          }
                        });
                        
                        return maxCategory || "Tidak teridentifikasi";
                      })()
                    : "Tidak ada area khusus yang perlu diperhatikan"
                  }</p>
                </div>
              </div>
              
              <div className="bg-green-50 p-6 rounded-xl">
                <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <FiStar /> Prestasi dan Pencapaian
                </h4>
                <div className="text-green-700 text-sm space-y-2">
                  <p><strong>Total Prestasi:</strong> {achievements.length}</p>
                  <p><strong>Prestasi Tertinggi:</strong> {
                    Array.isArray(achievements) && achievements.length > 0 
                    ? (() => {
                        const levelOrder = {
                          'Internasional': 5,
                          'Nasional': 4,
                          'Provinsi': 3,
                          'Kabupaten/Kota': 2,
                          'Sekolah': 1
                        };
                        
                        // Create a copy of the array to avoid mutating the original
                        const sortedAchievements = [...achievements].sort((a, b) => {
                          return (levelOrder[b.tingkat] || 0) - (levelOrder[a.tingkat] || 0);
                        });
                        
                        if (sortedAchievements.length > 0 && sortedAchievements[0].nama && sortedAchievements[0].tingkat) {
                          return `${sortedAchievements[0].nama} (${sortedAchievements[0].tingkat})`;
                        }
                        return "Data prestasi tidak lengkap";
                      })()
                    : "Belum ada prestasi tercatat"
                  }</p>
                  <p><strong>Saran Pengembangan:</strong> {
                    Array.isArray(achievements) && achievements.length > 0 && achievements[0]?.jenis
                    ? `Lanjutkan pengembangan di bidang ${achievements[0].jenis}`
                    : "Mulai aktif di kegiatan ekstrakurikuler untuk meraih prestasi"
                  }</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SiswaCreditScore;
