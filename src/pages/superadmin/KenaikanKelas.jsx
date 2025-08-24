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
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md border border-blue-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <FiPlay className="text-white text-sm" />
            </div>
            <h3 className="text-sm font-semibold text-blue-600">
              Pengaturan Kenaikan Kelas
            </h3>
          </div>
          <button
            onClick={fetchPreview}
            disabled={loading}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 text-sm"
          >
            <FiRotateCw className={loading ? "animate-spin" : ""} />
            Refresh Data
          </button>
        </div>

        <div className="bg-white rounded-lg p-3 mb-4 border border-blue-200">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={promoteAll}
              onChange={(e) => setPromoteAll(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
            />
            <span className="text-gray-700 font-medium text-sm">
              Naikkan semua siswa (abaikan syarat nilai)
            </span>
          </label>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handlePromoteAll}
            disabled={loading}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-md transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 text-sm"
          >
            <FiPlay />
            Proses Kenaikan Kelas
          </button>
        </div>
      </div>

      {/* Preview Data */}
      {preview && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Grade X */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
              <h4 className="font-semibold text-blue-600 flex items-center gap-2 text-sm">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-1 rounded-lg">
                  <FiUsers className="text-white text-xs" />
                </div>
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
            <div className="p-3 max-h-64 overflow-y-auto">
              {preview.gradeX
                ?.filter(
                  (student) =>
                    student.currentClass?.includes("X ") ||
                    student.currentClass === "X"
                )
                .map((student) => (
                  <div
                    key={student.id}
                    className={`p-2 mb-1.5 rounded-md border transition-all duration-200 hover:shadow-sm ${
                      student.eligible
                        ? "bg-green-50 border-green-200 hover:bg-green-100"
                        : "bg-red-50 border-red-200 hover:bg-red-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-xs">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {student.currentClass}
                        </p>
                        <p className="text-xs text-gray-500">
                          Skor: {student.totalScore}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {student.eligible ? (
                          <FiCheckCircle className="text-green-500 text-sm" />
                        ) : (
                          <FiXCircle className="text-red-500 text-sm" />
                        )}
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-600 w-3 h-3"
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Grade XI */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-3 bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
              <h4 className="font-semibold text-blue-600 flex items-center gap-2 text-sm">
                <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-1 rounded-lg">
                  <FiUsers className="text-white text-xs" />
                </div>
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
            <div className="p-3 max-h-64 overflow-y-auto">
              {preview.gradeX
                ?.filter(
                  (student) =>
                    student.currentClass?.includes("XI ") ||
                    student.currentClass === "XI"
                )
                .map((student) => (
                  <div
                    key={student.id}
                    className={`p-2 mb-1.5 rounded-md border transition-all duration-200 hover:shadow-sm ${
                      student.eligible
                        ? "bg-green-50 border-green-200 hover:bg-green-100"
                        : "bg-red-50 border-red-200 hover:bg-red-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-xs">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {student.currentClass}
                        </p>
                        <p className="text-xs text-gray-500">
                          Skor: {student.totalScore}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {student.eligible ? (
                          <FiCheckCircle className="text-green-500 text-sm" />
                        ) : (
                          <FiXCircle className="text-red-500 text-sm" />
                        )}
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-600 w-3 h-3"
                        />
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Grade XII */}
          <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            <div className="p-3 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
              <h4 className="font-semibold text-blue-600 flex items-center gap-2 text-sm">
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-1 rounded-lg">
                  <FiAward className="text-white text-xs" />
                </div>
                Kelas XII → Lulus (
                {preview.gradeXII?.filter(
                  (s) =>
                    s.currentClass?.includes("XII") || s.currentClass === "XII"
                ).length || 0}{" "}
                siswa)
              </h4>
            </div>
            <div className="p-3 max-h-64 overflow-y-auto">
              {preview.gradeXII
                ?.filter(
                  (student) =>
                    student.currentClass?.includes("XII") ||
                    student.currentClass === "XII"
                )
                .map((student) => (
                  <div
                    key={student.id}
                    className={`p-2 mb-1.5 rounded-md border transition-all duration-200 hover:shadow-sm ${
                      student.eligible
                        ? "bg-green-50 border-green-200 hover:bg-green-100"
                        : "bg-red-50 border-red-200 hover:bg-red-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 text-xs">
                          {student.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {student.currentClass}
                        </p>
                        <p className="text-xs text-gray-500">
                          Skor: {student.totalScore}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {student.eligible ? (
                          <FiCheckCircle className="text-green-500 text-sm" />
                        ) : (
                          <FiXCircle className="text-red-500 text-sm" />
                        )}
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.id)}
                          onChange={() => toggleStudentSelection(student.id)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-600 w-3 h-3"
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
    <div className="space-y-4">
      {/* Controls */}
      <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg shadow-md border border-indigo-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
              <FiArchive className="text-white text-sm" />
            </div>
            <h3 className="text-sm font-semibold text-blue-600">Data Alumni</h3>
          </div>
          <div className="flex gap-2">
            <button
              onClick={fetchArchivedStudents}
              disabled={loading}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 text-sm"
            >
              <FiRotateCw className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={handleAutoDeleteGraduates}
              disabled={loading}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50 text-sm"
            >
              <FiTrash2 />
              Hapus Data Lama
            </button>
          </div>
        </div>
      </div>

      {/* Alumni List */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full table-fixed">
            <thead
              className="text-gray-700"
              style={{ backgroundColor: "oklch(96.7% 0.003 264.542)" }}
            >
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/4">
                  Nama
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/6">
                  NISN
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/6">
                  Kelas Terakhir
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/6">
                  Angkatan
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider w-1/6">
                  Tanggal Lulus
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider w-1/6">
                  Tahun Lulus
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {archivedStudents.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-gray-50 transition-colors duration-200"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-gray-900 text-sm">
                      {student.name}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {student.nisn}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {student.lastClass}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {student.angkatan}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {new Date(student.archivedAt).toLocaleDateString("id-ID")}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.yearsGraduated >= 1
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : "bg-green-100 text-green-800 border border-green-200"
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
    <div className="space-y-4">
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg shadow-md border border-purple-200 p-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
            <FiClock className="text-white text-sm" />
          </div>
          <h3 className="text-sm font-semibold text-blue-600">
            Riwayat Kenaikan Kelas
          </h3>
        </div>

        <div className="space-y-3">
          {kenaikanHistory.map((record) => (
            <div
              key={record.id}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-md hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-1.5 rounded-lg">
                    <FiCalendar className="text-white text-xs" />
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm">
                    {record.tahunAjaran}
                  </h4>
                </div>
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {new Date(record.tanggalProses).toLocaleDateString("id-ID")}
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded-md border">
                {record.deskripsi}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-3 text-center">
                  <div className="bg-gradient-to-r from-blue-500 to-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                    <FiUsers className="text-white text-sm" />
                  </div>
                  <p className="text-lg font-bold text-blue-600 mb-0.5">
                    {record.totalSiswa}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    Total Siswa
                  </p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-3 text-center">
                  <div className="bg-gradient-to-r from-green-500 to-green-600 w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                    <FiCheckCircle className="text-white text-sm" />
                  </div>
                  <p className="text-lg font-bold text-green-600 mb-0.5">
                    {record.sukses}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    Naik/Lulus
                  </p>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-3 text-center">
                  <div className="bg-gradient-to-r from-red-500 to-red-600 w-8 h-8 rounded-lg flex items-center justify-center mx-auto mb-1.5">
                    <FiXCircle className="text-white text-sm" />
                  </div>
                  <p className="text-lg font-bold text-red-600 mb-0.5">
                    {record.gagal}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    Tinggal Kelas
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="space-y-5">
        {/* Header Section */}
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg shadow-md">
              <FiArrowUp className="text-white text-lg" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Kenaikan Kelas
              </h1>
              <p className="text-gray-600 text-xs">
                Kelola kenaikan kelas siswa X → XI → XII → Lulus
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b border-gray-200">
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab("preview")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5 text-sm ${
                  activeTab === "preview"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200"
                }`}
              >
                <FiEye className="text-sm" />
                Preview & Proses
              </button>
              <button
                onClick={() => setActiveTab("alumni")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5 text-sm ${
                  activeTab === "alumni"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200"
                }`}
              >
                <FiArchive className="text-sm" />
                Data Alumni
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5 text-sm ${
                  activeTab === "history"
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 shadow-sm border border-gray-200"
                }`}
              >
                <FiClock className="text-sm" />
                Riwayat
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-4">
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#003366]"></div>
              </div>
            )}

            {!loading && activeTab === "preview" && renderPreviewTab()}
            {!loading && activeTab === "alumni" && renderAlumniTab()}
            {!loading && activeTab === "history" && renderHistoryTab()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KenaikanKelas;
