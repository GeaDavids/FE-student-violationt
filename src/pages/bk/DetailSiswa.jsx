import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiArrowLeft,
  FiUser,
  FiFileText,
  FiAward,
  FiBarChart2,
  FiCalendar,
  FiMail,
  FiPhone,
  FiMapPin,
  FiBook,
  FiUsers,
} from "react-icons/fi";

const DetailMonitoringSiswa = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [summary, setSummary] = useState(null);
  const [violations, setViolations] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  useEffect(() => {
    fetchStudentDetail();
  }, [studentId]);

  const fetchStudentDetail = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `/api/bk/students/${studentId}`,
        axiosConfig
      );
      const detailData = response.data;

      setStudent(detailData.student);
      setSummary(detailData.summary);
      setViolations(detailData.violations || []);
      setAchievements(detailData.achievements || []);
    } catch (err) {
      console.error("Error fetching student detail:", err);
      navigate("/bk/monitoring");
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case "HIGH":
        return "text-red-600 bg-red-100 border-red-300";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100 border-yellow-300";
      default:
        return "text-green-600 bg-green-100 border-green-300";
    }
  };

  const getRiskBg = (riskLevel) => {
    switch (riskLevel) {
      case "HIGH":
        return "bg-red-50 border-red-200";
      case "MEDIUM":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-green-50 border-green-200";
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-2 text-gray-500">Memuat detail siswa...</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8">
        <div className="text-center py-8">
          <p className="text-gray-500">Data siswa tidak ditemukan</p>
          <button
            onClick={() => navigate("/bk/monitoring")}
            className="mt-4 bg-[#003366] text-white px-4 py-2 rounded"
          >
            Kembali ke Monitoring
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "profile", label: "Data Siswa", icon: FiUser },
    {
      id: "violations",
      label: `Pelanggaran (${violations.length})`,
      icon: FiFileText,
    },
    {
      id: "achievements",
      label: `Prestasi (${achievements.length})`,
      icon: FiAward,
    },
    { id: "summary", label: "Summary", icon: FiBarChart2 },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/bk/monitoring")}
            className="flex items-center gap-2 text-gray-600 hover:text-[#003366] transition-colors"
          >
            <FiArrowLeft /> Kembali
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[#003366]">
              Detail Siswa - {student.nama}
            </h1>
            <p className="text-gray-600">NISN: {student.nisn}</p>
          </div>
        </div>
        <div
          className={`px-4 py-2 rounded-full border font-medium ${getRiskColor(
            summary.riskLevel
          )}`}
        >
          Risk Level: {summary.riskLevel}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b mb-6">
        <nav className="flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-[#003366] text-[#003366]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiUser className="text-[#003366]" />
                    Informasi Pribadi
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FiMail className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">Email:</span>
                      <span className="text-sm font-medium">
                        {student.email || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiUser className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">
                        Jenis Kelamin:
                      </span>
                      <span className="text-sm font-medium">
                        {student.jenisKelamin === "L"
                          ? "Laki-laki"
                          : "Perempuan"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiMapPin className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">
                        Tempat Lahir:
                      </span>
                      <span className="text-sm font-medium">
                        {student.tempatLahir || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiCalendar className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">
                        Tanggal Lahir:
                      </span>
                      <span className="text-sm font-medium">
                        {student.tglLahir
                          ? new Date(student.tglLahir).toLocaleDateString(
                              "id-ID"
                            )
                          : "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiMapPin className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">Alamat:</span>
                      <span className="text-sm font-medium">
                        {student.alamat || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiPhone className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">No HP:</span>
                      <span className="text-sm font-medium">
                        {student.noHp || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <FiBook className="text-[#003366]" />
                    Informasi Akademik
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <FiBook className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">Kelas:</span>
                      <span className="text-sm font-medium">
                        {student.kelas || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiCalendar className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">Angkatan:</span>
                      <span className="text-sm font-medium">
                        {student.angkatan || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiUser className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">Wali Kelas:</span>
                      <span className="text-sm font-medium">
                        {student.waliKelas || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiMail className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">
                        Email Wali Kelas:
                      </span>
                      <span className="text-sm font-medium">
                        {student.waliKelasEmail || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiUsers className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">Orang Tua:</span>
                      <span className="text-sm font-medium">
                        {student.orangTua || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <FiMail className="text-gray-400" size={16} />
                      <span className="text-sm text-gray-600">
                        Email Orang Tua:
                      </span>
                      <span className="text-sm font-medium">
                        {student.orangTuaEmail || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status & Recommendation */}
            <div
              className={`mt-8 p-6 rounded-lg border ${getRiskBg(
                summary.riskLevel
              )}`}
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FiBarChart2 className="text-[#003366]" />
                Status & Rekomendasi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">
                    <strong>Level Resiko:</strong>
                    <span
                      className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getRiskColor(
                        summary.riskLevel
                      )}`}
                    >
                      {summary.riskLevel}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Total Score:</strong>
                    <span
                      className={`ml-2 font-bold ${
                        summary.totalScore >= 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {summary.totalScore}
                    </span>
                  </p>
                </div>
                <div className="bg-white p-4 rounded">
                  <h4 className="font-medium text-gray-900 mb-2">
                    Rekomendasi Tindakan:
                  </h4>
                  <p className="text-sm text-gray-600">
                    {summary.riskLevel === "HIGH"
                      ? "⚠️ Siswa memerlukan perhatian khusus dan konseling intensif. Pertimbangkan panggilan orang tua."
                      : summary.riskLevel === "MEDIUM"
                      ? "📋 Siswa perlu pemantauan lebih ketat dan bimbingan rutin."
                      : "✅ Siswa dalam kondisi baik. Pertahankan prestasi dan berikan apresiasi."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Violations Tab */}
        {activeTab === "violations" && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FiFileText className="text-red-600" />
                Riwayat Pelanggaran
              </h3>
              <div className="flex gap-6 text-sm text-gray-600">
                <span>
                  Total: <strong>{summary.totalViolations}</strong> kasus
                </span>
                <span>
                  Total Poin:{" "}
                  <strong className="text-red-600">
                    -{summary.totalViolationPoints}
                  </strong>
                </span>
                <span>
                  Bulan Ini: <strong>{summary.violationsThisMonth}</strong>
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {violations.length > 0 ? (
                violations.map((violation, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-red-400 pl-4 py-3 bg-red-50 rounded-r"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-red-800">
                        {violation.violation?.nama || "Unknown Violation"}
                      </h4>
                      <span className="text-red-600 font-bold text-sm">
                        -
                        {violation.pointSaat || violation.violation?.point || 0}{" "}
                        poin
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Tanggal:</strong>{" "}
                        {new Date(violation.createdAt).toLocaleDateString(
                          "id-ID"
                        )}
                        {violation.waktu &&
                          ` • ${new Date(violation.waktu).toLocaleTimeString(
                            "id-ID",
                            { hour: "2-digit", minute: "2-digit" }
                          )}`}
                      </p>
                      <p>
                        <strong>Pelapor:</strong>{" "}
                        {violation.reporter?.name || "Unknown"}
                      </p>
                      {violation.deskripsi && (
                        <p>
                          <strong>Deskripsi:</strong> {violation.deskripsi}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiFileText
                    size={48}
                    className="mx-auto text-gray-300 mb-4"
                  />
                  <p>Tidak ada riwayat pelanggaran</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Achievements Tab */}
        {activeTab === "achievements" && (
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <FiAward className="text-green-600" />
                Riwayat Prestasi
              </h3>
              <div className="flex gap-6 text-sm text-gray-600">
                <span>
                  Total: <strong>{summary.totalAchievements}</strong> prestasi
                </span>
                <span>
                  Total Poin:{" "}
                  <strong className="text-green-600">
                    +{summary.totalAchievementPoints}
                  </strong>
                </span>
                <span>
                  Bulan Ini: <strong>{summary.achievementsThisMonth}</strong>
                </span>
              </div>
            </div>

            <div className="space-y-4">
              {achievements.length > 0 ? (
                achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className="border-l-4 border-green-400 pl-4 py-3 bg-green-50 rounded-r"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-green-800">
                        {achievement.achievement?.nama || "Unknown Achievement"}
                      </h4>
                      <span className="text-green-600 font-bold text-sm">
                        +
                        {achievement.pointSaat ||
                          achievement.achievement?.point ||
                          0}{" "}
                        poin
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>Tanggal:</strong>{" "}
                        {new Date(achievement.createdAt).toLocaleDateString(
                          "id-ID"
                        )}
                        {achievement.waktu &&
                          ` • ${new Date(achievement.waktu).toLocaleTimeString(
                            "id-ID",
                            { hour: "2-digit", minute: "2-digit" }
                          )}`}
                      </p>
                      <p>
                        <strong>Pelapor:</strong>{" "}
                        {achievement.reporter?.name || "Unknown"}
                      </p>
                      {achievement.deskripsi && (
                        <p>
                          <strong>Deskripsi:</strong> {achievement.deskripsi}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiAward size={48} className="mx-auto text-gray-300 mb-4" />
                  <p>Tidak ada riwayat prestasi</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Summary Tab */}
        {activeTab === "summary" && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <FiBarChart2 className="text-[#003366]" />
              Analisis Summary
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Violation Stats */}
              <div className="bg-red-50 p-6 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-4 flex items-center gap-2">
                  <FiFileText />
                  Statistik Pelanggaran
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Kasus:</span>
                    <span className="font-bold">{summary.totalViolations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Poin:</span>
                    <span className="font-bold text-red-600">
                      -{summary.totalViolationPoints}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bulan Ini:</span>
                    <span className="font-bold">
                      {summary.violationsThisMonth}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Rata-rata per Kasus:
                    </span>
                    <span className="font-bold">
                      {summary.totalViolations > 0
                        ? Math.round(
                            summary.totalViolationPoints /
                              summary.totalViolations
                          )
                        : 0}{" "}
                      poin
                    </span>
                  </div>
                </div>
              </div>

              {/* Achievement Stats */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-4 flex items-center gap-2">
                  <FiAward />
                  Statistik Prestasi
                </h4>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Total Prestasi:
                    </span>
                    <span className="font-bold">
                      {summary.totalAchievements}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Total Poin:</span>
                    <span className="font-bold text-green-600">
                      +{summary.totalAchievementPoints}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bulan Ini:</span>
                    <span className="font-bold">
                      {summary.achievementsThisMonth}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">
                      Rata-rata per Prestasi:
                    </span>
                    <span className="font-bold">
                      {summary.totalAchievements > 0
                        ? Math.round(
                            summary.totalAchievementPoints /
                              summary.totalAchievements
                          )
                        : 0}{" "}
                      poin
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Score Analysis */}
            <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <FiBarChart2 />
                Analisis Score
              </h4>
              <div className="grid grid-cols-3 gap-6 text-center">
                <div>
                  <div
                    className={`text-3xl font-bold ${
                      summary.totalScore >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {summary.totalScore}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Total Score</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    +{summary.totalAchievementPoints}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Poin Positif</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-red-600">
                    -{summary.totalViolationPoints}
                  </div>
                  <div className="text-sm text-gray-600 mt-1">Poin Negatif</div>
                </div>
              </div>
              <div className="mt-6 text-center">
                <span
                  className={`inline-block px-4 py-2 rounded-full text-sm font-medium ${getRiskColor(
                    summary.riskLevel
                  )}`}
                >
                  Risk Level: {summary.riskLevel}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailMonitoringSiswa;
