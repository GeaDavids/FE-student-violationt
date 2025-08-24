import React, { useState, useEffect } from "react";
import Swal from "sweetalert2";
import api from "../../api/api";

// Simple Card components
const Card = ({ children, className = "" }) => (
  <div className={`bg-white shadow rounded-lg ${className}`}>{children}</div>
);

const CardHeader = ({ children }) => (
  <div className="px-6 py-4 border-b border-gray-200">{children}</div>
);

const CardTitle = ({ children, className = "" }) => (
  <h3 className={`text-lg font-medium text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardContent = ({ children }) => (
  <div className="px-6 py-4">{children}</div>
);

const AutomasiSuratPeringatan = () => {
  const [configs, setConfigs] = useState([]);
  const [historySurat, setHistorySurat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("config");
  const [editingConfig, setEditingConfig] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  // Load data
  useEffect(() => {
    loadConfigs();
    if (activeTab === "history") {
      loadHistorySurat();
    }
  }, [activeTab, pagination.page]);

  const loadConfigs = async () => {
    try {
      const response = await api.get("/automasi/config");
      setConfigs(response.data.data);
    } catch (error) {
      console.error("Error loading configs:", error);
      Swal.fire("Error", "Gagal memuat konfigurasi automasi", "error");
    } finally {
      setLoading(false);
    }
  };

  const loadHistorySurat = async () => {
    try {
      const response = await api.get(
        `/automasi/history?page=${pagination.page}&limit=${pagination.limit}`
      );
      setHistorySurat(response.data.data);
      setPagination((prev) => ({
        ...prev,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.totalPages,
      }));
    } catch (error) {
      console.error("Error loading history:", error);
      Swal.fire("Error", "Gagal memuat history surat", "error");
    }
  };

  const handleUpdateConfig = async (configId, updatedData) => {
    try {
      setLoading(true);

      console.log("Sending data:", updatedData); // Debug log

      // Pastikan semua field ada nilai yang valid
      const dataToSend = {
        nama: updatedData.nama || "",
        threshold: updatedData.threshold || 0,
        jenisSurat: updatedData.jenisSurat || "SP1",
        tingkat: updatedData.tingkat || 1,
        judulTemplate: updatedData.judulTemplate || "",
        isiTemplate: updatedData.isiTemplate || "",
        isActive:
          updatedData.isActive !== undefined ? updatedData.isActive : true,
      };

      console.log("Data to send:", dataToSend); // Debug log

      const response = await api.put(
        `/automasi/config/${configId}`,
        dataToSend
      );

      console.log("Response:", response.data); // Debug log

      Swal.fire("Sukses", "Konfigurasi berhasil diupdate", "success");
      await loadConfigs(); // Reload data
    } catch (err) {
      console.error("Error updating config:", err); // Debug log
      console.error("Error response:", err.response?.data); // Debug log

      Swal.fire(
        "Error",
        err.response?.data?.error || "Gagal update konfigurasi",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleManualTrigger = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Trigger Manual Surat Peringatan",
      html: `
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium mb-1">Student ID</label>
            <input id="studentId" class="swal2-input" placeholder="ID Siswa" type="number">
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Jenis Surat</label>
            <select id="configId" class="swal2-input">
              ${configs
                .map(
                  (config) =>
                    `<option value="${config.id}">${config.nama} (${config.threshold})</option>`
                )
                .join("")}
            </select>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Kirim",
      cancelButtonText: "Batal",
      preConfirm: () => {
        const studentId = document.getElementById("studentId").value;
        const configId = document.getElementById("configId").value;

        if (!studentId || !configId) {
          Swal.showValidationMessage("Semua field harus diisi");
          return false;
        }

        return { studentId: parseInt(studentId), configId: parseInt(configId) };
      },
    });

    if (formValues) {
      try {
        await api.post("/automasi/trigger", formValues);
        Swal.fire("Berhasil", "Surat peringatan berhasil dibuat", "success");
        if (activeTab === "history") {
          loadHistorySurat();
        }
      } catch (error) {
        console.error("Error manual trigger:", error);
        Swal.fire("Error", "Gagal membuat surat peringatan", "error");
      }
    }
  };

  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      sent: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };

    const labels = {
      pending: "Pending",
      sent: "Terkirim",
      failed: "Gagal",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  const getJenisSuratBadge = (jenis) => {
    const colors = {
      SP1: "bg-yellow-100 text-yellow-800",
      PANGGIL_ORTU: "bg-orange-100 text-orange-800",
      TERANCAM_KELUAR: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[jenis]}`}
      >
        {jenis}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">
          Automasi Surat Peringatan
        </h1>
        <button
          onClick={handleManualTrigger}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Trigger Manual
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("config")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "config"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Konfigurasi
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "history"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            History Surat
          </button>
        </nav>
      </div>

      {/* Content */}
      {activeTab === "config" && (
        <div className="grid gap-6">
          {configs.map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{config.nama}</CardTitle>
                  <div className="flex space-x-2">
                    {getJenisSuratBadge(config.jenisSurat)}
                    <span className="text-sm text-gray-500">
                      Threshold: {config.threshold}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingConfig === config.id ? (
                  <ConfigEditForm
                    config={config}
                    onSave={(data) => handleUpdateConfig(config.id, data)}
                    onCancel={() => setEditingConfig(null)}
                  />
                ) : (
                  <div className="space-y-4">
                    <div>
                      <strong>Template Judul:</strong>
                      <p className="text-gray-600">{config.judulTemplate}</p>
                    </div>
                    <div>
                      <strong>Template Isi:</strong>
                      <div className="text-gray-600 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded">
                        {config.isiTemplate.split("\\n").map((line, index) => (
                          <p key={index}>{line}</p>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          config.isActive
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {config.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                      <button
                        onClick={() => setEditingConfig(config.id)}
                        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activeTab === "history" && (
        <Card>
          <CardHeader>
            <CardTitle>History Surat Peringatan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Siswa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis Surat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score Saat Dibuat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {historySurat.map((surat) => (
                    <tr key={surat.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {surat.student.nama}
                          </div>
                          <div className="text-sm text-gray-500">
                            {surat.student.nisn} • {surat.student.kelas}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getJenisSuratBadge(surat.jenisSurat)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {surat.totalScoreSaat}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(surat.statusKirim)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(surat.createdAt).toLocaleDateString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )}{" "}
                  of {pagination.total} results
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page - 1,
                      }))
                    }
                    disabled={pagination.page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: prev.page + 1,
                      }))
                    }
                    disabled={pagination.page === pagination.totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Component untuk edit konfigurasi
const ConfigEditForm = ({ config, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    nama: config.nama,
    threshold: config.threshold,
    jenisSurat: config.jenisSurat,
    tingkat: config.tingkat,
    judulTemplate: config.judulTemplate,
    isiTemplate: config.isiTemplate,
    isActive: config.isActive,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Nama</label>
        <input
          type="text"
          value={formData.nama}
          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Threshold
        </label>
        <input
          type="number"
          value={formData.threshold}
          onChange={(e) =>
            setFormData({ ...formData, threshold: parseInt(e.target.value) })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Jenis Surat
        </label>
        <select
          value={formData.jenisSurat}
          onChange={(e) =>
            setFormData({ ...formData, jenisSurat: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="SP1">Surat Peringatan 1</option>
          <option value="PANGGIL_ORTU">Pemanggilan Orang Tua</option>
          <option value="TERANCAM_KELUAR">Terancam Dikeluarkan</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Tingkat Surat
        </label>
        <select
          value={formData.tingkat}
          onChange={(e) =>
            setFormData({ ...formData, tingkat: parseInt(e.target.value) })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value={1}>Tingkat 1</option>
          <option value={2}>Tingkat 2</option>
          <option value={3}>Tingkat 3</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Template Judul
        </label>
        <input
          type="text"
          value={formData.judulTemplate}
          onChange={(e) =>
            setFormData({ ...formData, judulTemplate: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Template Isi
        </label>
        <textarea
          rows={10}
          value={formData.isiTemplate}
          onChange={(e) =>
            setFormData({ ...formData, isiTemplate: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700">Aktif</span>
        </label>
      </div>

      <div className="flex justify-end space-x-2">
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

export default AutomasiSuratPeringatan;
