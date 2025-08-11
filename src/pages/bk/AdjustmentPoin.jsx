import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import API from "../../api/api";
import {
  FiMinus,
  FiPlus,
  FiSearch,
  FiFilter,
  FiRefreshCw,
  FiEdit,
  FiTrash2,
  FiCalendar,
  FiUser,
  FiFileText,
  FiCheckCircle,
} from "react-icons/fi";

const AdjustmentPoin = () => {
  const [siswaList, setSiswaList] = useState([]);
  const [selectedSiswa, setSelectedSiswa] = useState("");
  const [siswaViolations, setSiswaViolations] = useState([]);
  const [siswaAchievements, setSiswaAchievements] = useState([]);
  const [adjustmentHistory, setAdjustmentHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [adjustmentForm, setAdjustmentForm] = useState({
    type: "reduce", // reduce or add
    category: "violation", // violation or achievement
    amount: "",
    reason: "",
    description: "",
  });

  const adjustmentReasons = [
    "Perbaikan Perilaku",
    "Prestasi Tambahan",
    "Kompensasi Kesalahan",
    "Program Pembinaan",
    "Kegiatan Sosial",
    "Partisipasi Aktif",
    "Koreksi Data",
    "Kebijakan Khusus",
  ];

  const fetchSiswa = async () => {
    try {
      const res = await API.get("/api/users/students");
      setSiswaList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data siswa:", err);
    }
  };

  const fetchSiswaData = useCallback(async (siswaId) => {
    if (!siswaId) return;

    try {
      setLoading(true);

      // Fetch violations and achievements for selected student
      const [violationsRes, achievementsRes] = await Promise.all([
        API.get("/api/student-violations"),
        API.get("/api/student-achievements"),
      ]);

      const violations = violationsRes.data.filter(
        (v) => v.studentId === parseInt(siswaId)
      );
      const achievements = achievementsRes.data.filter(
        (a) => a.studentId === parseInt(siswaId)
      );

      setSiswaViolations(violations);
      setSiswaAchievements(achievements);

      // Note: In real implementation, you would fetch actual adjustment history from API
      // For now, we'll simulate some data
      setAdjustmentHistory([
        {
          id: 1,
          type: "reduce",
          category: "violation",
          amount: 10,
          reason: "Perbaikan Perilaku",
          description: "Siswa menunjukkan perbaikan dalam kedisiplinan",
          date: "2024-01-15",
          adjustedBy: "BK Staff",
        },
        {
          id: 2,
          type: "add",
          category: "achievement",
          amount: 15,
          reason: "Prestasi Tambahan",
          description: "Meraih juara dalam lomba debat internal",
          date: "2024-01-10",
          adjustedBy: "BK Staff",
        },
      ]);
    } catch (err) {
      console.error("Gagal mengambil data siswa:", err);
      Swal.fire("Error!", "Gagal mengambil data siswa", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSiswa();
  }, []);

  useEffect(() => {
    if (selectedSiswa) {
      fetchSiswaData(selectedSiswa);
    }
  }, [selectedSiswa, fetchSiswaData]);

  const handleSiswaChange = (e) => {
    setSelectedSiswa(e.target.value);
  };

  const handleFormChange = (e) => {
    setAdjustmentForm({ ...adjustmentForm, [e.target.name]: e.target.value });
  };

  const handleSubmitAdjustment = async (e) => {
    e.preventDefault();

    if (!selectedSiswa) {
      Swal.fire("Error!", "Pilih siswa terlebih dahulu", "error");
      return;
    }

    if (parseInt(adjustmentForm.amount) <= 0) {
      Swal.fire("Error!", "Jumlah poin harus lebih dari 0", "error");
      return;
    }

    const adjustmentData = {
      studentId: parseInt(selectedSiswa),
      type: adjustmentForm.type,
      category: adjustmentForm.category,
      amount: parseInt(adjustmentForm.amount),
      reason: adjustmentForm.reason,
      description: adjustmentForm.description,
      adjustedBy: JSON.parse(localStorage.getItem("user"))?.name || "BK Staff",
      date: new Date().toISOString().split("T")[0],
    };

    try {
      // In real implementation, you would send this to API
      // await API.post("/api/point-adjustments", adjustmentData);

      Swal.fire({
        title: "Adjustment Berhasil!",
        html: `
          <div class="text-left">
            <p><strong>Tipe:</strong> ${
              adjustmentForm.type === "reduce" ? "Pengurangan" : "Penambahan"
            }</p>
            <p><strong>Kategori:</strong> ${
              adjustmentForm.category === "violation"
                ? "Pelanggaran"
                : "Prestasi"
            }</p>
            <p><strong>Jumlah:</strong> ${adjustmentForm.amount} poin</p>
            <p><strong>Alasan:</strong> ${adjustmentForm.reason}</p>
            <p><strong>Deskripsi:</strong> ${adjustmentForm.description}</p>
          </div>
        `,
        icon: "success",
      });

      // Add to history (simulation)
      const newAdjustment = {
        id: adjustmentHistory.length + 1,
        ...adjustmentData,
      };
      setAdjustmentHistory([newAdjustment, ...adjustmentHistory]);

      // Reset form
      setAdjustmentForm({
        type: "reduce",
        category: "violation",
        amount: "",
        reason: "",
        description: "",
      });
      setFormVisible(false);
    } catch (err) {
      console.error("Error:", err);
      Swal.fire(
        "Gagal",
        "Terjadi kesalahan saat menyimpan adjustment",
        "error"
      );
    }
  };

  const calculateTotalScore = () => {
    const totalViolations = siswaViolations.reduce(
      (sum, v) => sum + (v.violation?.point || v.pointSaat || 0),
      0
    );
    const totalAchievements = siswaAchievements.reduce(
      (sum, a) => sum + (a.achievement?.point || a.pointSaat || 0),
      0
    );

    // Apply adjustments
    const violationAdjustments = adjustmentHistory
      .filter((h) => h.category === "violation")
      .reduce((sum, h) => {
        return h.type === "reduce" ? sum - h.amount : sum + h.amount;
      }, 0);

    const achievementAdjustments = adjustmentHistory
      .filter((h) => h.category === "achievement")
      .reduce((sum, h) => {
        return h.type === "add" ? sum + h.amount : sum - h.amount;
      }, 0);

    const adjustedViolations = Math.max(
      0,
      totalViolations + violationAdjustments
    );
    const adjustedAchievements = Math.max(
      0,
      totalAchievements + achievementAdjustments
    );

    return {
      totalViolations,
      totalAchievements,
      adjustedViolations,
      adjustedAchievements,
      finalScore: adjustedAchievements - adjustedViolations,
    };
  };

  const selectedSiswaData = siswaList.find(
    (s) => s.id === parseInt(selectedSiswa)
  );
  const scoreData = calculateTotalScore();

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
          <FiEdit /> Adjustment Poin Siswa
        </h2>
        <button
          onClick={() => {
            setAdjustmentForm({
              type: "reduce",
              category: "violation",
              amount: "",
              reason: "",
              description: "",
            });
            setFormVisible(true);
          }}
          disabled={!selectedSiswa}
          className={`px-4 py-2 rounded flex items-center gap-2 ${
            selectedSiswa
              ? "bg-[#003366] text-white hover:bg-[#004080]"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <FiPlus /> Buat Adjustment
        </button>
      </div>

      {/* Student Selection */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FiUser /> Pilih Siswa
        </h3>
        <select
          value={selectedSiswa}
          onChange={handleSiswaChange}
          className="w-full border rounded px-3 py-2"
        >
          <option value="">Pilih Siswa...</option>
          {siswaList.map((siswa) => (
            <option key={siswa.id} value={siswa.id}>
              {siswa.nisn} - {siswa.name || siswa.user?.name} (
              {siswa.classroom?.namaKelas || "No Class"})
            </option>
          ))}
        </select>
      </div>

      {selectedSiswa && (
        <>
          {/* Student Score Summary */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-lg">
              <h3 className="font-semibold text-blue-800">
                Original Violations
              </h3>
              <p className="text-2xl font-bold text-red-600">
                -{scoreData.totalViolations}
              </p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg">
              <h3 className="font-semibold text-green-800">
                Original Achievements
              </h3>
              <p className="text-2xl font-bold text-green-600">
                +{scoreData.totalAchievements}
              </p>
            </div>
            <div className="bg-yellow-100 p-4 rounded-lg">
              <h3 className="font-semibold text-yellow-800">
                Adjusted Violations
              </h3>
              <p className="text-2xl font-bold text-red-600">
                -{scoreData.adjustedViolations}
              </p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg">
              <h3 className="font-semibold text-purple-800">
                Adjusted Achievements
              </h3>
              <p className="text-2xl font-bold text-green-600">
                +{scoreData.adjustedAchievements}
              </p>
            </div>
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-800">Final Score</h3>
              <p
                className={`text-2xl font-bold ${
                  scoreData.finalScore >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {scoreData.finalScore}
              </p>
            </div>
          </div>

          {/* Adjustment Form Modal */}
          {formVisible && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-semibold mb-4">
                  Buat Adjustment untuk{" "}
                  {selectedSiswaData?.name || selectedSiswaData?.user?.name}
                </h3>
                <form onSubmit={handleSubmitAdjustment} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Tipe
                      </label>
                      <select
                        name="type"
                        value={adjustmentForm.type}
                        onChange={handleFormChange}
                        required
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="reduce">Kurangi</option>
                        <option value="add">Tambah</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Kategori
                      </label>
                      <select
                        name="category"
                        value={adjustmentForm.category}
                        onChange={handleFormChange}
                        required
                        className="w-full border rounded px-3 py-2"
                      >
                        <option value="violation">Pelanggaran</option>
                        <option value="achievement">Prestasi</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Jumlah Poin
                    </label>
                    <input
                      type="number"
                      name="amount"
                      placeholder="Masukkan jumlah poin"
                      value={adjustmentForm.amount}
                      onChange={handleFormChange}
                      required
                      min="1"
                      className="w-full border rounded px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Alasan
                    </label>
                    <select
                      name="reason"
                      value={adjustmentForm.reason}
                      onChange={handleFormChange}
                      required
                      className="w-full border rounded px-3 py-2"
                    >
                      <option value="">Pilih Alasan</option>
                      {adjustmentReasons.map((reason) => (
                        <option key={reason} value={reason}>
                          {reason}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Deskripsi
                    </label>
                    <textarea
                      name="description"
                      placeholder="Deskripsi detail adjustment..."
                      value={adjustmentForm.description}
                      onChange={handleFormChange}
                      required
                      className="w-full border rounded px-3 py-2"
                      rows="3"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="flex-1 bg-[#003366] text-white py-2 rounded"
                    >
                      Simpan
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormVisible(false)}
                      className="flex-1 bg-gray-500 text-white py-2 rounded"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Adjustment History */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FiFileText /> Riwayat Adjustment
            </h3>
            {adjustmentHistory.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full table-auto border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="border px-4 py-2 text-left">Tanggal</th>
                      <th className="border px-4 py-2 text-left">Tipe</th>
                      <th className="border px-4 py-2 text-left">Kategori</th>
                      <th className="border px-4 py-2 text-center">Jumlah</th>
                      <th className="border px-4 py-2 text-left">Alasan</th>
                      <th className="border px-4 py-2 text-left">Deskripsi</th>
                      <th className="border px-4 py-2 text-left">Oleh</th>
                    </tr>
                  </thead>
                  <tbody>
                    {adjustmentHistory.map((adjustment) => (
                      <tr key={adjustment.id} className="hover:bg-gray-50">
                        <td className="border px-4 py-2">
                          {new Date(adjustment.date).toLocaleDateString(
                            "id-ID"
                          )}
                        </td>
                        <td className="border px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              adjustment.type === "reduce"
                                ? "bg-red-100 text-red-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {adjustment.type === "reduce"
                              ? "Kurangi"
                              : "Tambah"}
                          </span>
                        </td>
                        <td className="border px-4 py-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              adjustment.category === "violation"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {adjustment.category === "violation"
                              ? "Pelanggaran"
                              : "Prestasi"}
                          </span>
                        </td>
                        <td className="border px-4 py-2 text-center font-bold">
                          <span
                            className={
                              adjustment.type === "reduce"
                                ? "text-red-600"
                                : "text-green-600"
                            }
                          >
                            {adjustment.type === "reduce" ? "-" : "+"}
                            {adjustment.amount}
                          </span>
                        </td>
                        <td className="border px-4 py-2">
                          {adjustment.reason}
                        </td>
                        <td className="border px-4 py-2 max-w-xs">
                          <div className="text-sm text-gray-600 truncate">
                            {adjustment.description}
                          </div>
                        </td>
                        <td className="border px-4 py-2 text-sm text-gray-600">
                          {adjustment.adjustedBy}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">
                Belum ada riwayat adjustment untuk siswa ini.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AdjustmentPoin;
