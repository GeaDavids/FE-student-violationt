import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../api/api";
import academicYearAPI from "../../api/academicYear";

const AutomasiSuratPeringatan = () => {
  const [configs, setConfigs] = useState([]);
  const [historySurat, setHistorySurat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("config");
  const [editingConfig, setEditingConfig] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");
  useEffect(() => {
    // Load academic years on mount
    const fetchYears = async () => {
      try {
        const res = await academicYearAPI.getAll();
        let arr = [];
        if (Array.isArray(res.data)) arr = res.data;
        else if (Array.isArray(res.data?.data)) arr = res.data.data;
        setAcademicYears(arr);
      } catch {
        setAcademicYears([]);
      }
    };
    fetchYears();
  }, []);

  // Ensure configs and historySurat are always arrays
  const safeConfigs = Array.isArray(configs) ? configs : [];
  const safeHistorySurat = Array.isArray(historySurat) ? historySurat : [];

  // Icon Components
  const MailIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );

  const HistoryIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );

  const DocumentIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );

  const EyeIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
      />
    </svg>
  );

  const EditIcon = () => (
    <svg
      className="w-4 h-4"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
      />
    </svg>
  );

  const CloseIcon = () => (
    <svg
      className="w-5 h-5"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      <span className="ml-3 text-gray-600">Memuat data...</span>
    </div>
  );

  const handleViewDetail = (config) => {
    setSelectedConfig(config);
    setShowDetailModal(true);
  };

  const getSuratTypeColor = (jenisSurat) => {
    switch (jenisSurat) {
      case "SP1":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "SP2":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "SP3":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getSuratTypeIcon = (jenisSurat) => {
    switch (jenisSurat) {
      case "SP1":
        return "⚠️";
      case "SP2":
        return "🔶";
      case "SP3":
        return "🚨";
      default:
        return "📄";
    }
  };

  useEffect(() => {
    loadConfigs();
    if (activeTab === "history") {
      loadHistorySurat();
    }
  }, [activeTab, pagination.page, selectedYear]);

  const loadConfigs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/automasi/config");
      // Backend mengembalikan { data: configs }
      setConfigs(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error("Error loading configs:", error);
      // Set configs ke array kosong jika error
      setConfigs([]);
      // Untuk development, gunakan mock data
      const mockConfigs = [
        {
          id: 1,
          nama: "Peringatan Pertama",
          jenisSurat: "SP1",
          threshold: 25,
          tingkat: 1,
          judulTemplate: "Surat Peringatan Pertama - Pelanggaran Tata Tertib",
          isiTemplate: `Kepada Yth. Orang Tua/Wali Siswa {NAMA_SISWA} Kelas {KELAS}

Dengan hormat, berdasarkan catatan pelanggaran yang dilakukan oleh putra/putri Bapak/Ibu, dengan ini kami sampaikan bahwa siswa tersebut telah mencapai {TOTAL_SCORE} poin pelanggaran.

Oleh karena itu, kami memberikan surat peringatan pertama dan mohon perhatian serta bimbingan dari orang tua.

Hormat kami,
Kepala Sekolah`,
          isActive: true,
        },
        {
          id: 2,
          nama: "Peringatan Kedua",
          jenisSurat: "SP2",
          threshold: 50,
          tingkat: 2,
          judulTemplate: "Surat Peringatan Kedua - Pelanggaran Tata Tertib",
          isiTemplate: `Kepada Yth. Orang Tua/Wali Siswa {NAMA_SISWA} Kelas {KELAS}

Dengan hormat, ini merupakan peringatan kedua setelah peringatan pertama. Siswa telah mencapai {TOTAL_SCORE} poin pelanggaran.

Kami harap ada perhatian khusus dari orang tua untuk membimbing putra/putri Anda.

Hormat kami,
Kepala Sekolah`,
          isActive: true,
        },
      ];

      // Set mock data untuk development
      setTimeout(() => {
        setConfigs(mockConfigs);
      }, 100);

      // Swal.fire("Error", "Gagal memuat konfigurasi", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadHistorySurat = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (selectedYear && selectedYear !== "all") {
        params.tahunAjaranId = selectedYear;
      }
      const response = await api.get("/automasi/history", { params });

      // Backend mengembalikan { data: [...], pagination: {...} }
      setHistorySurat(
        Array.isArray(response.data.data) ? response.data.data : []
      );
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination?.total || 0,
        totalPages: response.data.pagination?.totalPages || 0,
      }));
    } catch (error) {
      console.error("Error loading history:", error);
      setHistorySurat([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (configId) => {
    try {
      // Toggle status dengan menggunakan endpoint update
      const config = safeConfigs.find((c) => c.id === configId);
      if (!config) return;

      await api.put(`/automasi/config/${configId}`, {
        ...config,
        isActive: !config.isActive,
      });
      loadConfigs();
      Swal.fire("Berhasil", "Status konfigurasi berhasil diubah", "success");
    } catch (error) {
      console.error("Error toggling status:", error);
      Swal.fire("Error", "Gagal mengubah status konfigurasi", "error");
    }
  };

  const handleUpdateConfig = async (updatedConfig) => {
    try {
      await api.put(`/automasi/config/${updatedConfig.id}`, updatedConfig);
      loadConfigs();
      setEditingConfig(null);
      Swal.fire("Berhasil", "Konfigurasi berhasil diupdate", "success");
    } catch (error) {
      console.error("Error updating config:", error);
      Swal.fire("Error", "Gagal mengupdate konfigurasi", "error");
    }
  };

  // Config Edit Form Component
  const ConfigEditForm = ({ config, onSave, onCancel }) => {
    const [formData, setFormData] = useState({
      nama: config.nama || "",
      jenisSurat: config.jenisSurat || "SP1",
      threshold: config.threshold || 0,
      tingkat: config.tingkat || 1,
      judulTemplate: config.judulTemplate || "",
      isiTemplate: config.isiTemplate || "",
      isActive: config.isActive || false,
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({ ...config, ...formData });
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nama Konfigurasi
            </label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nama: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Jenis Surat
            </label>
            <select
              value={formData.jenisSurat}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, jenisSurat: e.target.value }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="SP1">SP1 - Surat Peringatan 1</option>
              <option value="SP2">SP2 - Surat Peringatan 2</option>
              <option value="SP3">SP3 - Surat Peringatan 3</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Threshold (Score)
            </label>
            <input
              type="number"
              value={formData.threshold}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  threshold: parseInt(e.target.value),
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tingkat
            </label>
            <input
              type="number"
              value={formData.tingkat}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  tingkat: parseInt(e.target.value),
                }))
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Judul Template
          </label>
          <input
            type="text"
            value={formData.judulTemplate}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                judulTemplate: e.target.value,
              }))
            }
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Isi Template
          </label>
          <textarea
            value={formData.isiTemplate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isiTemplate: e.target.value }))
            }
            rows={6}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Gunakan placeholder: {"{NAMA_SISWA}"}, {"{KELAS}"},{" "}
            {"{TOTAL_SCORE}"}, {"{NISN}"}, {"{TANGGAL}"}, {"{NAMA_ORTU}"}
          </p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Aktifkan konfigurasi
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Simpan
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Automasi Surat Peringatan
                </h1>
                <p className="text-gray-600 mt-1">
                  Kelola konfigurasi dan pantau riwayat surat peringatan
                  otomatis
                </p>
              </div>
              <div className="text-3xl">📧</div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("config")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === "config"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MailIcon />
                  Konfigurasi
                </div>
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                  activeTab === "history"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-2">
                  <HistoryIcon />
                  Riwayat Surat
                </div>
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {/* Filter Tahun Ajaran untuk tab history */}
            {activeTab === "history" && (
              <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-end gap-2">
                <label className="text-xs font-semibold text-slate-700 mr-2">
                  Tahun Ajaran:
                </label>
                <select
                  className="border border-gray-300 rounded px-2 py-1 text-sm"
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                >
                  <option value="all">Semua Tahun</option>
                  {(Array.isArray(academicYears) ? academicYears : []).map(
                    (y) => (
                      <option key={y.id} value={y.id}>
                        {y.tahunAjaran} - {y.semester}
                      </option>
                    )
                  )}
                </select>
              </div>
            )}
            {loading ? (
              <LoadingSpinner />
            ) : activeTab === "config" ? (
              <div>
                {safeConfigs.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Belum ada konfigurasi
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Konfigurasi surat peringatan akan muncul di sini
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {safeConfigs.map((config) => (
                      <div
                        key={config.id}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">
                                {getSuratTypeIcon(config.jenisSurat)}
                              </span>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {config.nama}
                                </h3>
                                <span
                                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSuratTypeColor(
                                    config.jenisSurat
                                  )}`}
                                >
                                  {config.jenisSurat}
                                </span>
                              </div>
                            </div>
                            <div
                              className={`w-3 h-3 rounded-full ${
                                config.isActive ? "bg-green-500" : "bg-gray-300"
                              }`}
                            ></div>
                          </div>

                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Threshold:</span>
                              <span className="font-medium text-gray-900">
                                {config.threshold} score
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Tingkat:</span>
                              <span className="font-medium text-gray-900">
                                Level {config.tingkat}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-500">Status:</span>
                              <span
                                className={`font-medium ${
                                  config.isActive
                                    ? "text-green-600"
                                    : "text-gray-500"
                                }`}
                              >
                                {config.isActive ? "Aktif" : "Nonaktif"}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetail(config)}
                              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                            >
                              <EyeIcon />
                              <span className="ml-1">Detail</span>
                            </button>
                            <button
                              onClick={() => setEditingConfig(config)}
                              className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                            >
                              <EditIcon />
                              <span className="ml-1">Edit</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div>
                {safeHistorySurat.length === 0 ? (
                  <div className="text-center py-12">
                    <HistoryIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Belum ada riwayat surat
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Riwayat surat peringatan akan muncul di sini
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {safeHistorySurat.map((surat) => (
                      <div
                        key={surat.id}
                        className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-lg">
                                {getSuratTypeIcon(surat.jenisSurat)}
                              </span>
                              <h4 className="font-semibold text-gray-900">
                                {surat.judul}
                              </h4>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Siswa:</span>
                                <p className="font-medium text-gray-900">
                                  {surat.student?.nama}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">NISN:</span>
                                <p className="font-medium text-gray-900">
                                  {surat.student?.nisn}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Kelas:</span>
                                <p className="font-medium text-gray-900">
                                  {surat.student?.kelas}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">
                                  Total Score:
                                </span>
                                <p className="font-medium text-gray-900">
                                  {surat.totalScoreSaat}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Status:</span>
                                <p
                                  className={`font-medium ${
                                    surat.statusKirim === "sent"
                                      ? "text-green-600"
                                      : surat.statusKirim === "pending"
                                      ? "text-yellow-600"
                                      : "text-red-600"
                                  }`}
                                >
                                  {surat.statusKirim === "sent"
                                    ? "Terkirim"
                                    : surat.statusKirim === "pending"
                                    ? "Pending"
                                    : "Gagal"}
                                </p>
                              </div>
                              <div>
                                <span className="text-gray-500">Tingkat:</span>
                                <p className="font-medium text-gray-900">
                                  Level {surat.tingkatSurat}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2">
                              {new Date(surat.createdAt).toLocaleDateString(
                                "id-ID",
                                {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                              {surat.tanggalKirim && (
                                <span className="ml-2 text-green-600">
                                  • Dikirim:{" "}
                                  {new Date(
                                    surat.tanggalKirim
                                  ).toLocaleDateString("id-ID", {
                                    day: "numeric",
                                    month: "long",
                                    year: "numeric",
                                  })}
                                </span>
                              )}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${getSuratTypeColor(
                                surat.jenisSurat
                              )}`}
                            >
                              {surat.jenisSurat}
                            </span>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                surat.statusKirim === "sent"
                                  ? "bg-green-100 text-green-800"
                                  : surat.statusKirim === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }`}
                            >
                              {surat.statusKirim === "sent"
                                ? "Terkirim"
                                : surat.statusKirim === "pending"
                                ? "Pending"
                                : "Gagal"}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex justify-between items-center mt-6 pt-4 border-t">
                        <div className="text-sm text-gray-500">
                          Menampilkan{" "}
                          {(pagination.page - 1) * pagination.limit + 1} -{" "}
                          {Math.min(
                            pagination.page * pagination.limit,
                            pagination.total
                          )}{" "}
                          dari {pagination.total} data
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: Math.max(1, prev.page - 1),
                              }))
                            }
                            disabled={pagination.page === 1}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                          >
                            Sebelumnya
                          </button>
                          <span className="px-3 py-1 text-sm text-gray-600">
                            Halaman {pagination.page} dari{" "}
                            {pagination.totalPages}
                          </span>
                          <button
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: Math.min(prev.totalPages, prev.page + 1),
                              }))
                            }
                            disabled={pagination.page === pagination.totalPages}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200"
                          >
                            Selanjutnya
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedConfig && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Detail Konfigurasi Surat
                  </h3>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Konfigurasi
                    </label>
                    <p className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                      {selectedConfig.nama}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jenis Surat
                    </label>
                    <div className="p-3 bg-gray-50 rounded-md">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getSuratTypeColor(
                          selectedConfig.jenisSurat
                        )}`}
                      >
                        {selectedConfig.jenisSurat}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Threshold
                    </label>
                    <p className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                      {selectedConfig.threshold} score
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tingkat
                    </label>
                    <p className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                      Level {selectedConfig.tingkat}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Template
                  </label>
                  <p className="text-sm text-gray-900 p-3 bg-gray-50 rounded-md">
                    {selectedConfig.judulTemplate}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Isi Template
                  </label>
                  <div className="text-sm text-gray-900 p-4 bg-gray-50 rounded-md max-h-60 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans">
                      {selectedConfig.isiTemplate}
                    </pre>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        selectedConfig.isActive ? "bg-green-500" : "bg-gray-400"
                      }`}
                    ></div>
                    <span
                      className={`text-sm font-medium ${
                        selectedConfig.isActive
                          ? "text-green-600"
                          : "text-gray-500"
                      }`}
                    >
                      {selectedConfig.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-xl border-t border-gray-200">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors duration-200"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingConfig && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Edit Konfigurasi
                  </h3>
                  <button
                    onClick={() => setEditingConfig(null)}
                    className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <ConfigEditForm
                  config={editingConfig}
                  onSave={handleUpdateConfig}
                  onCancel={() => setEditingConfig(null)}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomasiSuratPeringatan;
