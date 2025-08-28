import React, { useState, useEffect } from "react";
import {
  FiAlertTriangle,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiMinus,
  FiTag,
  FiTrendingDown,
} from "react-icons/fi";
import violationAPI from "../../api/violation";
import kategoriAPI from "../../api/kategori";
import API from "../../api/api";

const KelolaPelanggaran = () => {
  const [violations, setViolations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingViolation, setEditingViolation] = useState(null);
  const [formData, setFormData] = useState({
    nama: "",
    kategoriId: "",
    point: "",
    jenis: "",
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [violationsRes, categoriesRes] = await Promise.all([
        API.get("/master/violations", axiosConfig),
        API.get("/master/kategori", axiosConfig),
      ]);
      setViolations(violationsRes.data);
      setCategories(categoriesRes.data);
      setError("");
    } catch (err) {
      setError("Gagal mengambil data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        kategoriId: parseInt(formData.kategoriId),
        point: parseInt(formData.point),
      };

      if (editingViolation) {
        await violationAPI.updateViolation(editingViolation.id, data);
      } else {
        await violationAPI.createViolation(data);
      }

      await fetchData();
      handleCloseModal();
    } catch (err) {
      setError(
        editingViolation
          ? "Gagal memperbarui pelanggaran"
          : "Gagal menambah pelanggaran"
      );
      console.error(err);
    }
  };

  const handleEdit = (violation) => {
    setEditingViolation(violation);
    setFormData({
      nama: violation.nama,
      kategoriId: violation.kategoriId,
      point: violation.point,
      jenis: violation.jenis || "",
      isActive: violation.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pelanggaran ini?")) {
      try {
        await violationAPI.deleteViolation(id);
        await fetchData();
      } catch (err) {
        setError("Gagal menghapus pelanggaran");
        console.error(err);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingViolation(null);
    setFormData({
      nama: "",
      kategoriId: "",
      point: "",
      jenis: "",
      isActive: true,
    });
  };

  const handleInputChange = (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  if (loading)
    return (
      <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-[#003366]"></div>
            <span className="ml-3 text-gray-600">Memuat data...</span>
          </div>
        </div>
      </div>
    );

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-3 rounded-xl shadow-lg">
                <FiAlertTriangle className="text-white text-xl" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-500 to-red-600 bg-clip-text text-transparent">
                  Kelola Pelanggaran
                </h1>
                <p className="text-gray-600 mt-1 text-sm">
                  Manajemen data pelanggaran siswa dan sistem poin
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <FiPlus />
              Tambah Pelanggaran
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-xl p-4 shadow-lg">
            <div className="flex items-center gap-3">
              <FiAlertTriangle className="text-red-500 text-lg" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Violations Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full table-fixed">
              <thead
                className="text-gray-700"
                style={{ backgroundColor: "oklch(96.7% 0.003 264.542)" }}
              >
                <tr>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider w-16">
                    No
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider w-1/3">
                    Nama Pelanggaran
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider w-1/6">
                    Kategori
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider w-20">
                    Point
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider w-1/6">
                    Jenis
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider w-24">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold uppercase tracking-wider w-32">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {violations.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="p-3 rounded-full mb-3 bg-red-50">
                          <FiTrendingDown className="text-2xl text-red-300" />
                        </div>
                        <p className="text-gray-600 font-medium text-sm">
                          Belum ada data pelanggaran
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Klik tombol tambah untuk membuat pelanggaran baru
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  violations.map((violation, index) => (
                    <tr
                      key={violation.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium text-center">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        {violation.nama}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FiTag className="text-red-500 text-xs" />
                          {violation.kategori?.nama || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                          -{violation.point}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {violation.jenis || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            violation.isActive
                              ? "bg-green-100 text-green-800 border border-green-200"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                        >
                          {violation.isActive ? (
                            <>
                              <FiCheck className="mr-1 text-xs" />
                              Aktif
                            </>
                          ) : (
                            <>
                              <FiMinus className="mr-1 text-xs" />
                              Tidak Aktif
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleEdit(violation)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-2.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 text-xs font-medium"
                            title="Edit pelanggaran"
                          >
                            <FiEdit2 className="text-xs" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(violation.id)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-2.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 text-xs font-medium"
                            title="Hapus pelanggaran"
                          >
                            <FiTrash2 className="text-xs" />
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modern Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-md mx-auto shadow-xl border border-gray-200 overflow-hidden">
              {/* Header dengan tema merah untuk peringatan */}
              <div className="px-6 py-4 bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600">
                      <FiAlertTriangle className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-red-800">
                        {editingViolation
                          ? "Edit Pelanggaran"
                          : "Tambah Pelanggaran"}
                      </h3>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-1.5 hover:bg-white/50 rounded-lg transition-colors duration-200 group"
                  >
                    <FiX className="text-lg text-gray-500 group-hover:text-gray-700" />
                  </button>
                </div>
              </div>

              {/* Form Content */}
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Nama Pelanggaran
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        className="w-full border-2 border-red-200 focus:border-red-500 focus:ring-red-100 p-3 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 bg-gray-50 font-medium placeholder-gray-400"
                        placeholder="Contoh: Terlambat masuk kelas, Tidak mengerjakan tugas"
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400">
                        <FiAlertTriangle className="text-sm" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kategori
                    </label>
                    <div className="relative">
                      <select
                        name="kategoriId"
                        value={formData.kategoriId}
                        onChange={handleInputChange}
                        className="w-full border-2 border-red-200 focus:border-red-500 focus:ring-red-100 p-3 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 bg-gray-50 font-medium"
                        required
                      >
                        <option value="">Pilih Kategori Pelanggaran</option>
                        {categories
                          .filter((cat) => cat.tipe === "pelanggaran")
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.nama}
                            </option>
                          ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400">
                        <FiTag className="text-sm" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Point Pelanggaran
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="point"
                        value={formData.point}
                        onChange={handleInputChange}
                        className="w-full border-2 border-red-200 focus:border-red-500 focus:ring-red-100 p-3 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 bg-gray-50 font-medium placeholder-gray-400"
                        placeholder="Contoh: 10, 25, 50"
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400">
                        <FiMinus className="text-sm" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Jenis Pelanggaran (Opsional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="jenis"
                        value={formData.jenis}
                        onChange={handleInputChange}
                        className="w-full border-2 border-red-200 focus:border-red-500 focus:ring-red-100 p-3 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 bg-gray-50 font-medium placeholder-gray-400"
                        placeholder="Contoh: Ringan, Sedang, Berat"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-400">
                        <FiTrendingDown className="text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-red-600 border-2 border-red-300 rounded focus:ring-red-500 transition-all duration-200"
                        />
                        {formData.isActive && (
                          <FiCheck className="absolute top-0 left-0 w-4 h-4 text-white pointer-events-none" />
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-red-700 transition-colors duration-200">
                          Aktifkan pelanggaran ini
                        </span>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Pelanggaran aktif akan tersedia untuk digunakan dalam
                          sistem
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <FiCheck className="text-sm" />
                          {editingViolation ? "Perbarui" : "Simpan"}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      <FiX className="text-sm" />
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KelolaPelanggaran;
