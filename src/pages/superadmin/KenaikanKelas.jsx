import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiUsers,
  FiArrowUp,
  FiAward,
  FiRotateCw,
  FiEye,
  FiPlay,
  FiTrash2,
  FiDownload,
  FiCalendar,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiArchive,
} from "react-icons/fi";

const KenaikanKelas = () => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [promoteAll, setPromoteAll] = useState(false);
  const [archivedStudents, setArchivedStudents] = useState([]);
  const [kenaikanHistory, setKenaikanHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("preview");

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    if (activeTab === "preview") {
      fetchPreview();
    } else if (activeTab === "alumni") {
      fetchArchivedStudents();
    } else if (activeTab === "history") {
      fetchKenaikanHistory();
    }
  }, [activeTab]);

  const fetchPreview = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "/api/kenaikan-kelas/preview",
        axiosConfig
      );
      setPreview(response.data.data);
    } catch (error) {
      console.error("Error fetching preview:", error);
      Swal.fire("Error!", "Gagal mengambil preview kenaikan kelas", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchArchivedStudents = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        "/api/kenaikan-kelas/archived-students",
        axiosConfig
      );
      setArchivedStudents(response.data.data);
    } catch (error) {
      console.error("Error fetching archived students:", error);
      Swal.fire("Error!", "Gagal mengambil data alumni", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchKenaikanHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/kenaikan-kelas", axiosConfig);
      setKenaikanHistory(response.data);
    } catch (error) {
      console.error("Error fetching history:", error);
      Swal.fire("Error!", "Gagal mengambil riwayat kenaikan kelas", "error");
    } finally {
      setLoading(false);
    }
  };

  const handlePromoteAll = async () => {
    const result = await Swal.fire({
      title: "Konfirmasi Kenaikan Kelas",
      text: promoteAll
        ? "Semua siswa akan dinaikkan kelas/lulus tanpa mempertimbangkan nilai. Lanjutkan?"
        : "Siswa yang memenuhi syarat akan dinaikkan kelas/lulus. Lanjutkan?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, Proses!",
      cancelButtonText: "Batal",
      input: "text",
      inputPlaceholder: "Deskripsi kenaikan kelas (opsional)",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const currentYear = new Date().getFullYear();
        const tahunAjaran = `${currentYear}/${currentYear + 1}`;

        const response = await axios.post(
          "/api/kenaikan-kelas/generate",
          {
            tahunAjaran,
            deskripsi: result.value || `Kenaikan kelas ${tahunAjaran}`,
            promoteAll,
            customPromotions: selectedStudents,
          },
          axiosConfig
        );

        Swal.fire({
          title: "Berhasil!",
          html: `
            <div class="text-left">
              <p><strong>Total Diproses:</strong> ${response.data.summary.totalProcessed}</p>
              <p><strong>Naik Kelas:</strong> ${response.data.summary.totalPromoted}</p>
              <p><strong>Lulus:</strong> ${response.data.summary.totalGraduated}</p>
              <p><strong>Tinggal Kelas:</strong> ${response.data.summary.totalFailed}</p>
            </div>
          `,
          icon: "success",
        });

        // Reset state and refresh data
        setSelectedStudents([]);
        setPromoteAll(false);
        fetchPreview();
        setActiveTab("history");
      } catch (error) {
        console.error("Error promoting students:", error);
        Swal.fire(
          "Error!",
          error.response?.data?.error || "Gagal memproses kenaikan kelas",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAutoDeleteGraduates = async () => {
    const result = await Swal.fire({
      title: "Hapus Alumni Lama",
      text: "Menghapus data alumni yang lulus lebih dari 1 tahun yang lalu. Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal",
    });

    if (result.isConfirmed) {
      try {
        setLoading(true);
        const response = await axios.delete(
          "/api/kenaikan-kelas/auto-delete-graduates",
          axiosConfig
        );

        Swal.fire({
          title: "Berhasil!",
          text: `${response.data.count} data alumni berhasil dihapus`,
          icon: "success",
        });

        fetchArchivedStudents();
      } catch (error) {
        console.error("Error deleting graduates:", error);
        Swal.fire(
          "Error!",
          error.response?.data?.error || "Gagal menghapus data alumni lama",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  const toggleStudentSelection = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const renderPreviewTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#003366]">
            Pengaturan Kenaikan Kelas
          </h3>
          <button
            onClick={fetchPreview}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50"
          >
            <FiRotateCw className={loading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={promoteAll}
              onChange={(e) => setPromoteAll(e.target.checked)}
              className="rounded"
            />
            <span>Naikkan semua siswa (abaikan syarat nilai)</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handlePromoteAll}
            disabled={loading}
            className="bg-green-500 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-green-600 disabled:opacity-50"
          >
            <FiPlay />
            Proses Kenaikan Kelas
          </button>
        </div>
      </div>

      {/* Preview Data */}
      {preview && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Grade X */}
          <div className="bg-white rounded-xl shadow">
            <div className="p-4 bg-blue-50 rounded-t-xl border-b">
              <h4 className="font-semibold text-[#003366] flex items-center gap-2">
                <FiUsers />
                Kelas X → XI (
                {preview.gradeX?.filter(
                  (s) =>
                    s.currentClass?.includes("X ") ||
                    s.currentClass?.includes("X ") ||
                    s.currentClass === "X"
                ).length || 0}{" "}
                siswa)
              </h4>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {preview.gradeX
                ?.filter(
                  (student) =>
                    student.currentClass?.includes("X ") ||
                    student.currentClass === "X"
                )
                .map((student) => (
                  <div
                    key={student.id}
                    className={`p-3 mb-2 rounded-lg border ${
                      student.eligible
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">
                          {student.currentClass}
                        </p>
                        <p className="text-xs">Skor: {student.totalScore}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {student.eligible ? (
                          <FiCheckCircle className="text-green-500" />
                        ) : (
                          <FiXCircle className="text-red-500" />
                        )}
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Grade XI */}
          <div className="bg-white rounded-xl shadow">
            <div className="p-4 bg-blue-50 rounded-t-xl border-b">
              <h4 className="font-semibold text-[#003366] flex items-center gap-2">
                <FiUsers />
                Kelas XI → XII (
                {preview.gradeXI?.filter(
                  (s) =>
                    s.currentClass?.includes("XI ") ||
                    s.currentClass?.includes("XI ") ||
                    s.currentClass === "XI"
                ).length || 0}{" "}
                siswa)
              </h4>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {preview.gradeX
                ?.filter(
                  (student) =>
                    student.currentClass?.includes("XI ") ||
                    student.currentClass === "XI"
                )
                .map((student) => (
                  <div
                    key={student.id}
                    className={`p-3 mb-2 rounded-lg border ${
                      student.eligible
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">
                          {student.currentClass}
                        </p>
                        <p className="text-xs">Skor: {student.totalScore}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {student.eligible ? (
                          <FiCheckCircle className="text-green-500" />
                        ) : (
                          <FiXCircle className="text-red-500" />
                        )}
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Grade XII */}
          <div className="bg-white rounded-xl shadow">
            <div className="p-4 bg-green-50 rounded-t-xl border-b">
              <h4 className="font-semibold text-[#003366] flex items-center gap-2">
                <FiAward />
                Kelas XII → Lulus (
                {preview.gradeXII?.filter(
                  (s) =>
                    s.currentClass?.includes("XII") || s.currentClass === "XII"
                ).length || 0}{" "}
                siswa)
              </h4>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {preview.gradeXII
                ?.filter(
                  (student) =>
                    student.currentClass?.includes("XII") ||
                    student.currentClass === "XII"
                )
                .map((student) => (
                  <div
                    key={student.id}
                    className={`p-3 mb-2 rounded-lg border ${
                      student.eligible
                        ? "bg-green-50 border-green-200"
                        : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{student.name}</p>
                        <p className="text-sm text-gray-600">
                          {student.currentClass}
                        </p>
                        <p className="text-xs">Skor: {student.totalScore}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {student.eligible ? (
                          <FiCheckCircle className="text-green-500" />
                        ) : (
                          <FiXCircle className="text-red-500" />
                        )}
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="rounded"
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const renderAlumniTab = () => (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#003366]">Data Alumni</h3>
          <div className="flex gap-2">
            <button
              onClick={fetchArchivedStudents}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 disabled:opacity-50"
            >
              <FiRotateCw className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={handleAutoDeleteGraduates}
              disabled={loading}
              className="bg-red-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-red-600 disabled:opacity-50"
            >
              <FiTrash2 />
              Hapus Data Lama
            </button>
          </div>
        </div>
      </div>

      {/* Alumni List */}
      <div className="bg-white rounded-xl shadow">
        <div className="overflow-x-auto">
          <table className="w-full table-auto">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  NISN
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Kelas Terakhir
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Angkatan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Tanggal Lulus
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                  Tahun Lulus
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {archivedStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <p className="font-medium text-gray-900">{student.name}</p>
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {student.nisn}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {student.lastClass}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {student.angkatan}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-900">
                    {new Date(student.archivedAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-4 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.yearsGraduated >= 1
                          ? "bg-red-100 text-red-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {student.yearsGraduated} tahun
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderHistoryTab = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold text-[#003366] mb-4">
          Riwayat Kenaikan Kelas
        </h3>

        <div className="space-y-4">
          {kenaikanHistory.map((record) => (
            <div key={record.id} className="border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">
                  {record.tahunAjaran}
                </h4>
                <span className="text-xs text-gray-500">
                  {new Date(record.tanggalProses).toLocaleDateString("id-ID")}
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-3">{record.deskripsi}</p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-blue-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-blue-600">
                    {record.totalSiswa}
                  </p>
                  <p className="text-xs text-gray-600">Total Siswa</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-green-600">
                    {record.sukses}
                  </p>
                  <p className="text-xs text-gray-600">Naik/Lulus</p>
                </div>
                <div className="bg-red-50 rounded-lg p-3">
                  <p className="text-2xl font-bold text-red-600">
                    {record.gagal}
                  </p>
                  <p className="text-xs text-gray-600">Tinggal Kelas</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#003366]">Kenaikan Kelas</h1>
        <p className="text-gray-600">
          Kelola kenaikan kelas siswa X → XI → XII → Lulus
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("preview")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "preview"
                  ? "border-[#003366] text-[#003366]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <FiEye />
                Preview & Proses
              </div>
            </button>
            <button
              onClick={() => setActiveTab("alumni")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "alumni"
                  ? "border-[#003366] text-[#003366]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <FiArchive />
                Data Alumni
              </div>
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "history"
                  ? "border-[#003366] text-[#003366]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-2">
                <FiClock />
                Riwayat
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366]"></div>
        </div>
      )}

      {!loading && activeTab === "preview" && renderPreviewTab()}
      {!loading && activeTab === "alumni" && renderAlumniTab()}
      {!loading && activeTab === "history" && renderHistoryTab()}
    </div>
  );
};

export default KenaikanKelas;
