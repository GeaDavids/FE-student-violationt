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
} from "react-icons/fi";

const SiswaCreditScore = () => {
  const [creditScore, setCreditScore] = useState(null);
  const [violations, setViolations] = useState([]);
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
      // Get siswa info
      const siswaRes = await axios.get(`/api/users/students/profile`, axiosConfig);
      setSiswaInfo(siswaRes.data);

      // Get credit score
      const scoreRes = await axios.get(`/api/credit-scores/my-score`, axiosConfig);
      setCreditScore(scoreRes.data);

      // Get violations
      const violationsRes = await axios.get(`/api/violation-records/my-violations`, axiosConfig);
      setViolations(violationsRes.data);
    } catch (err) {
      console.error("Gagal mengambil data siswa:", err);
      Swal.fire("Error!", "Gagal mengambil data credit score", "error");
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
    if (score >= 80) return "BAIK";
    if (score >= 60) return "PERLU PERHATIAN";
    return "BERESIKO";
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
                <div>
                  <h3 className="text-xl font-bold text-[#003366]">{siswaInfo.name || siswaInfo.user?.name}</h3>
                  <p className="text-gray-600">NISN: {siswaInfo.nisn}</p>
                  <p className="text-gray-600">Kelas: {siswaInfo.classroom?.namaKelas}</p>
                  <p className="text-gray-600">Angkatan: {siswaInfo.angkatan?.tahun || siswaInfo.angkatan?.year}</p>
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
                  <span className="text-gray-600">Score Awal:</span>
                  <span className="font-semibold">100</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Pelanggaran:</span>
                  <span className="font-semibold text-red-600">{violations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Poin Dikurangi:</span>
                  <span className="font-semibold text-red-600">
                    -{violations.reduce((sum, v) => sum + (v.violation?.poin || 0), 0)}
                  </span>
                </div>
                <hr />
                <div className="flex justify-between font-bold">
                  <span>Score Akhir:</span>
                  <span className={getScoreColor(creditScore?.totalScore || 0)}>
                    {creditScore?.totalScore || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Riwayat Pelanggaran */}
          <div className="bg-white rounded-xl shadow p-6">
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
                          {formatDateForDisplay(violation.tglKejadian)}
                        </td>
                        <td className="border px-4 py-2">
                          {violation.violation?.namaViolation}
                        </td>
                        <td className="border px-4 py-2">
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                            {violation.violation?.kategori}
                          </span>
                        </td>
                        <td className="border px-4 py-2 text-center font-bold text-red-600">
                          -{violation.violation?.poin}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <span className={`px-2 py-1 rounded text-xs ${
                            violation.status === 'selesai' ? 'bg-green-100 text-green-800' :
                            violation.status === 'proses' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {violation.status}
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
        </>
      )}
    </div>
  );
};

export default SiswaCreditScore;
