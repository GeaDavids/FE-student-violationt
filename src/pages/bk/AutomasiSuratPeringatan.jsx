import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../api/api";

const AutomasiSuratPeringatan = () => {
  const [configs, setConfigs] = useState([]);
  const [historySurat, setHistorySurat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("config");
  const [editingConfig, setEditingConfig] = useState(null);
  const [selectedConfig, setSelectedConfig] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

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

  const PlusIcon = () => (
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
        d="M12 4v16m8-8H4"
      />
    </svg>
  );

  const TrashIcon = () => (
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
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
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
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-slate-200"></div>
        <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
      </div>
      <div className="mt-4 text-center">
        <h3 className="text-sm font-semibold text-slate-900 mb-1">
          Memuat data...
        </h3>
        <p className="text-slate-500 text-xs">Mohon tunggu sebentar</p>
      </div>
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
  }, [activeTab, pagination.page]);

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
      const response = await api.get("/automasi/history", {
        params: {
          page: pagination.page,
          limit: pagination.limit,
        },
      });

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
      // Set historySurat ke array kosong jika error
      setHistorySurat([]);

      // Mock data untuk development
      const mockHistorySurat = [
        {
          id: 1,
          student: {
            nama: "Ahmad Rizki Pratama",
            nisn: "1234567890",
            kelas: "XII RPL 1",
          },
          jenisSurat: "SP1",
          tingkatSurat: 1,
          totalScoreSaat: 25,
          judul: "Surat Peringatan Pertama - Pelanggaran Tata Tertib",
          statusKirim: "sent",
          tanggalKirim: "2024-03-15T10:30:00Z",
          createdAt: "2024-03-15T10:30:00Z",
        },
        {
          id: 2,
          student: {
            nama: "Siti Nurhaliza",
            nisn: "1234567891",
            kelas: "XI TKJ 2",
          },
          jenisSurat: "SP2",
          tingkatSurat: 2,
          totalScoreSaat: 50,
          judul: "Surat Peringatan Kedua - Pelanggaran Tata Tertib",
          statusKirim: "sent",
          tanggalKirim: "2024-03-10T14:15:00Z",
          createdAt: "2024-03-10T14:15:00Z",
        },
      ];

      // Set mock data untuk development
      setTimeout(() => {
        setHistorySurat(mockHistorySurat);
        setPagination((prev) => ({
          ...prev,
          total: mockHistorySurat.length,
          totalPages: Math.ceil(mockHistorySurat.length / prev.limit),
        }));
      }, 100);

      // Swal.fire("Error", "Gagal memuat history surat", "error");
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

  const handleCreateConfig = async (newConfig) => {
    try {
      await api.post("/automasi/config", newConfig);
      loadConfigs();
      setShowCreateModal(false);
      Swal.fire("Berhasil", "Konfigurasi berhasil dibuat", "success");
    } catch (error) {
      console.error("Error creating config:", error);
      Swal.fire("Error", "Gagal membuat konfigurasi", "error");
    }
  };

  const handleDeleteConfig = async (configId) => {
    try {
      const result = await Swal.fire({
        title: "Konfirmasi Hapus",
        text: "Apakah Anda yakin ingin menghapus konfigurasi ini?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc2626",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "Ya, Hapus!",
        cancelButtonText: "Batal",
      });

      if (result.isConfirmed) {
        await api.delete(`/automasi/config/${configId}`);
        loadConfigs();
        Swal.fire("Terhapus!", "Konfigurasi berhasil dihapus.", "success");
      }
    } catch (error) {
      console.error("Error deleting config:", error);
      Swal.fire("Error", "Gagal menghapus konfigurasi", "error");
    }
  };

  // Config Edit Form Component
  const ConfigEditForm = ({ config, onSave, onCancel, isCreate = false }) => {
    const [formData, setFormData] = useState({
      nama: config?.nama || "",
      jenisSurat: config?.jenisSurat || "SP1",
      threshold: config?.threshold || 0,
      tingkat: config?.tingkat || 1,
      judulTemplate: config?.judulTemplate || "",
      isiTemplate: config?.isiTemplate || "",
      isActive: config?.isActive || false,
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      if (isCreate) {
        onSave(formData);
      } else {
        onSave({ ...config, ...formData });
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Nama Konfigurasi
            </label>
            <input
              type="text"
              value={formData.nama}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, nama: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-slate-900 font-medium text-sm"
              placeholder="Masukkan nama konfigurasi"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Jenis Surat
            </label>
            <select
              value={formData.jenisSurat}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, jenisSurat: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-slate-900 font-medium text-sm"
            >
              <option value="SP1">SP1 - Surat Peringatan 1</option>
              <option value="SP2">SP2 - Surat Peringatan 2</option>
              <option value="SP3">SP3 - Surat Peringatan 3</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
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
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-slate-900 font-medium text-sm"
              placeholder="Masukkan threshold score"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Level Tingkat
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
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-slate-900 font-medium text-sm"
              placeholder="Masukkan level tingkat"
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
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
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-slate-900 font-medium text-sm"
            placeholder="Masukkan judul template surat"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-slate-700">
            Isi Template
          </label>
          <textarea
            value={formData.isiTemplate}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isiTemplate: e.target.value }))
            }
            rows={6}
            className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-slate-900 font-medium text-sm resize-none"
            placeholder="Masukkan isi template surat..."
            required
          />
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-700 font-medium mb-2">
              📝 Placeholder yang tersedia:
            </p>
            <div className="grid grid-cols-3 gap-1 text-xs">
              <code className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                {"{NAMA_SISWA}"}
              </code>
              <code className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                {"{KELAS}"}
              </code>
              <code className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                {"{TOTAL_SCORE}"}
              </code>
              <code className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                {"{NISN}"}
              </code>
              <code className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                {"{TANGGAL}"}
              </code>
              <code className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-mono">
                {"{NAMA_ORTU}"}
              </code>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
            }
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded transition-all duration-200"
          />
          <label className="text-xs font-semibold text-slate-700">
            Aktifkan konfigurasi ini
          </label>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 hover:border-slate-400 transition-all duration-200"
          >
            Batal
          </button>
          <button
            type="submit"
            className="px-6 py-2 border border-transparent rounded-lg shadow-md text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 hover:shadow-lg"
          >
            {isCreate ? "Buat Konfigurasi" : "Simpan Perubahan"}
          </button>
        </div>
      </form>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200/60 mb-6 backdrop-blur-sm bg-white/90">
          <div className="px-6 py-4 border-b border-slate-200/60">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                  <svg
                    className="w-5 h-5 text-white"
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
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                    Automasi Surat Peringatan
                  </h1>
                  <p className="text-slate-600 mt-1 text-sm">
                    Kelola konfigurasi dan pantau riwayat surat peringatan
                    otomatis
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border border-green-200">
                  <span className="text-xs font-medium text-green-700">
                    Sistem Aktif
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="border-b border-slate-200/60">
            <nav className="flex space-x-1 px-6">
              <button
                onClick={() => setActiveTab("config")}
                className={`py-3 px-4 font-medium text-sm transition-all duration-300 relative ${
                  activeTab === "config"
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg transition-all duration-300 ${
                      activeTab === "config"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <MailIcon />
                  </div>
                  <span>Konfigurasi Surat</span>
                </div>
                {activeTab === "config" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`py-3 px-4 font-medium text-sm transition-all duration-300 relative ${
                  activeTab === "history"
                    ? "text-blue-600"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className={`p-1.5 rounded-lg transition-all duration-300 ${
                      activeTab === "history"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <HistoryIcon />
                  </div>
                  <span>Riwayat Surat</span>
                </div>
                {activeTab === "history" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>
                )}
              </button>
            </nav>
          </div>

          {/* Content Area */}
          <div className="p-6">
            {loading ? (
              <LoadingSpinner />
            ) : activeTab === "config" ? (
              <div>
                {safeConfigs.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mb-4">
                      <DocumentIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      Belum ada konfigurasi
                    </h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto mb-4">
                      Konfigurasi surat peringatan akan muncul di sini setelah
                      Anda menambahkannya
                    </p>
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <PlusIcon />
                      <span className="ml-2">Buat Konfigurasi Pertama</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    {/* Header dengan tombol tambah */}
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h2 className="text-lg font-bold text-slate-900">
                          Daftar Konfigurasi Surat
                        </h2>
                        <p className="text-sm text-slate-600">
                          Kelola template surat peringatan otomatis
                        </p>
                      </div>
                      <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        <PlusIcon />
                        <span className="ml-2">Tambah Konfigurasi</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {safeConfigs.map((config) => (
                        <div
                          key={config.id}
                          className="group bg-white border border-slate-200/60 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                        >
                          <div className="p-6">
                            <div className="flex items-start justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                                  <span className="text-lg">
                                    {getSuratTypeIcon(config.jenisSurat)}
                                  </span>
                                </div>
                                <div>
                                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                                    {config.nama}
                                  </h3>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getSuratTypeColor(
                                      config.jenisSurat
                                    )}`}
                                  >
                                    {config.jenisSurat}
                                  </span>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <div
                                  className={`w-2.5 h-2.5 rounded-full shadow-sm ${
                                    config.isActive
                                      ? "bg-emerald-500"
                                      : "bg-slate-300"
                                  }`}
                                ></div>
                                <span className="text-xs font-medium text-slate-500">
                                  {config.isActive ? "Aktif" : "Nonaktif"}
                                </span>
                              </div>
                            </div>

                            <div className="space-y-3 mb-6">
                              <div className="bg-slate-50 rounded-lg p-3 space-y-2">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-medium text-slate-600">
                                    Threshold Score
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                    <span className="text-sm font-bold text-slate-900">
                                      {config.threshold}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex justify-between items-center">
                                  <span className="text-xs font-medium text-slate-600">
                                    Level Tingkat
                                  </span>
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></div>
                                    <span className="text-sm font-bold text-slate-900">
                                      {config.tingkat}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewDetail(config)}
                                className="flex-1 group/btn inline-flex items-center justify-center px-3 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                              >
                                <EyeIcon />
                                <span className="ml-1">Detail</span>
                              </button>
                              <button
                                onClick={() => setEditingConfig(config)}
                                className="flex-1 group/btn inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                              >
                                <EditIcon />
                                <span className="ml-1">Edit</span>
                              </button>
                              <button
                                onClick={() => handleDeleteConfig(config.id)}
                                className="group/btn inline-flex items-center justify-center px-2 py-2 border border-transparent rounded-lg text-xs font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg"
                                title="Hapus konfigurasi"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                {safeHistorySurat.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center mb-4">
                      <HistoryIcon className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      Belum ada riwayat surat
                    </h3>
                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                      Riwayat surat peringatan akan muncul di sini setelah
                      sistem mengirim surat
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {safeHistorySurat.map((surat) => (
                      <div
                        key={surat.id}
                        className="bg-white border border-slate-200/60 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                                  <span className="text-lg text-white">
                                    {getSuratTypeIcon(surat.jenisSurat)}
                                  </span>
                                </div>
                                <div>
                                  <h4 className="text-lg font-bold text-slate-900 mb-1">
                                    {surat.judul}
                                  </h4>
                                  <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getSuratTypeColor(
                                      surat.jenisSurat
                                    )}`}
                                  >
                                    {surat.jenisSurat}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div className="bg-slate-50 rounded-lg p-3">
                                  <span className="text-xs font-medium text-slate-600 block mb-1">
                                    Informasi Siswa
                                  </span>
                                  <div className="space-y-1">
                                    <p className="font-bold text-slate-900 text-sm">
                                      {surat.student?.nama}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      NISN: {surat.student?.nisn}
                                    </p>
                                    <p className="text-xs text-slate-600">
                                      Kelas: {surat.student?.kelas}
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-slate-50 rounded-lg p-3">
                                  <span className="text-xs font-medium text-slate-600 block mb-1">
                                    Detail Pelanggaran
                                  </span>
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5">
                                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                                      <span className="text-sm font-bold text-slate-900">
                                        {surat.totalScoreSaat} Score
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-600">
                                      Level {surat.tingkatSurat}
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-slate-50 rounded-lg p-3">
                                  <span className="text-xs font-medium text-slate-600 block mb-1">
                                    Status Pengiriman
                                  </span>
                                  <div className="space-y-1">
                                    <span
                                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                        surat.statusKirim === "sent"
                                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                                          : surat.statusKirim === "pending"
                                          ? "bg-yellow-100 text-yellow-700 border border-yellow-200"
                                          : "bg-red-100 text-red-700 border border-red-200"
                                      }`}
                                    >
                                      {surat.statusKirim === "sent"
                                        ? "✓ Terkirim"
                                        : surat.statusKirim === "pending"
                                        ? "⏳ Pending"
                                        : "✗ Gagal"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                                <div className="flex items-center gap-1.5">
                                  <svg
                                    className="w-3 h-3"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                    />
                                  </svg>
                                  <span>
                                    Dibuat:{" "}
                                    {new Date(
                                      surat.createdAt
                                    ).toLocaleDateString("id-ID", {
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                                {surat.tanggalKirim && (
                                  <div className="flex items-center gap-1.5">
                                    <svg
                                      className="w-3 h-3 text-emerald-500"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                      />
                                    </svg>
                                    <span className="text-emerald-600 font-medium">
                                      Dikirim:{" "}
                                      {new Date(
                                        surat.tanggalKirim
                                      ).toLocaleDateString("id-ID", {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      })}
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 pt-4 border-t border-slate-200">
                        <div className="text-xs text-slate-500 mb-3 sm:mb-0">
                          Menampilkan{" "}
                          {(pagination.page - 1) * pagination.limit + 1} -{" "}
                          {Math.min(
                            pagination.page * pagination.limit,
                            pagination.total
                          )}{" "}
                          dari {pagination.total} data
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: Math.max(1, prev.page - 1),
                              }))
                            }
                            disabled={pagination.page === 1}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                          >
                            ← Sebelumnya
                          </button>
                          <div className="px-3 py-1.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
                            {pagination.page} / {pagination.totalPages}
                          </div>
                          <button
                            onClick={() =>
                              setPagination((prev) => ({
                                ...prev,
                                page: Math.min(prev.totalPages, prev.page + 1),
                              }))
                            }
                            disabled={pagination.page === pagination.totalPages}
                            className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 hover:border-slate-300 transition-all duration-200"
                          >
                            Selanjutnya →
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
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                      <DocumentIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Detail Konfigurasi Surat
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Nama Konfigurasi
                    </label>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm font-medium text-slate-900">
                        {selectedConfig.nama}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Jenis Surat
                    </label>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${getSuratTypeColor(
                          selectedConfig.jenisSurat
                        )}`}
                      >
                        {selectedConfig.jenisSurat}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Threshold Score
                    </label>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm font-bold text-slate-900">
                        {selectedConfig.threshold} score
                      </p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Level Tingkat
                    </label>
                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-sm font-bold text-slate-900">
                        Level {selectedConfig.tingkat}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Judul Template
                  </label>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <p className="text-slate-900 font-medium text-sm">
                      {selectedConfig.judulTemplate}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Isi Template
                  </label>
                  <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 max-h-60 overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-slate-900 leading-relaxed text-sm">
                      {selectedConfig.isiTemplate}
                    </pre>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Konfigurasi
                  </label>
                  <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <div
                      className={`w-3 h-3 rounded-full shadow-sm ${
                        selectedConfig.isActive
                          ? "bg-emerald-500"
                          : "bg-slate-400"
                      }`}
                    ></div>
                    <span
                      className={`text-sm font-bold ${
                        selectedConfig.isActive
                          ? "text-emerald-600"
                          : "text-slate-500"
                      }`}
                    >
                      {selectedConfig.isActive ? "Aktif" : "Nonaktif"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="sticky bottom-0 bg-slate-50 px-6 py-4 rounded-b-xl border-t border-slate-200">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 bg-gradient-to-r from-slate-600 to-slate-700 text-white text-sm font-semibold rounded-lg hover:from-slate-700 hover:to-slate-800 transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg shadow-lg">
                      <PlusIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Buat Konfigurasi Baru
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
                  >
                    <CloseIcon />
                  </button>
                </div>
              </div>
              <div className="p-6">
                <ConfigEditForm
                  config={{}}
                  onSave={handleCreateConfig}
                  onCancel={() => setShowCreateModal(false)}
                  isCreate={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingConfig && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-slate-200">
              <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 rounded-t-xl">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                      <EditIcon className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">
                      Edit Konfigurasi
                    </h3>
                  </div>
                  <button
                    onClick={() => setEditingConfig(null)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
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
