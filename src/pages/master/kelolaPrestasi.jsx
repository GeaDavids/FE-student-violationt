import React, { useState, useEffect } from "react";
import {
  FiAward,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiX,
  FiCheck,
  FiMinus,
  FiTag,
  FiTrendingUp,
  FiStar,
} from "react-icons/fi";
import achievementAPI from "../../api/achievement";
import kategoriAPI from "../../api/kategori";
import axios from "axios";

const KelolaPrestasi = () => {
  const [achievements, setAchievements] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState(null);
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
      const [achievementsRes, categoriesRes] = await axios.all([
        axios.get("/api/master/achievements", axiosConfig),
        axios.get("/api/master/kategori", axiosConfig),
      ]);
      setAchievements(achievementsRes.data);
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

      if (editingAchievement) {
        await achievementAPI.updateAchievement(editingAchievement.id, data);
      } else {
        await achievementAPI.createAchievement(data);
      }

      await fetchData();
      handleCloseModal();
    } catch (err) {
      setError(
        editingAchievement
          ? "Gagal memperbarui prestasi"
          : "Gagal menambah prestasi"
      );
      console.error(err);
    }
  };

  const handleEdit = (achievement) => {
    setEditingAchievement(achievement);
    setFormData({
      nama: achievement.nama,
      kategoriId: achievement.kategoriId,
      point: achievement.point,
      jenis: achievement.jenis || "",
      isActive: achievement.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus prestasi ini?")) {
      try {
        await achievementAPI.deleteAchievement(id);
        await fetchData();
      } catch (err) {
        setError("Gagal menghapus prestasi");
        console.error(err);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAchievement(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-[#003366]/20 border-t-[#003366] rounded-full animate-spin mx-auto"></div>
            <FiAward className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-green-600 text-xl" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">
            Memuat data prestasi...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg">
                <FiAward className="text-2xl text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                  Kelola Prestasi
                </h1>
                <p className="text-gray-600 mt-1">
                  Manajemen data prestasi dan penghargaan siswa
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-xl transition-all duration-200 flex items-center gap-2 font-semibold shadow-lg hover:shadow-xl"
            >
              <FiPlus className="text-lg" />
              Tambah Prestasi
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 flex items-center gap-3">
            <FiX className="text-red-500 text-lg flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Achievements Table */}
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
                    Nama Prestasi
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
                {achievements.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="p-3 rounded-full mb-3 bg-blue-50">
                          <FiTrendingUp className="text-2xl text-blue-300" />
                        </div>
                        <p className="text-gray-600 font-medium text-sm">
                          Belum ada data prestasi
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Klik tombol tambah untuk membuat prestasi baru
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  achievements.map((achievement, index) => (
                    <tr
                      key={achievement.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium text-center">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        <div className="flex items-center gap-2">
                          <FiStar className="text-yellow-500 text-sm flex-shrink-0" />
                          {achievement.nama}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FiTag className="text-green-600 text-xs" />
                          {achievement.kategori?.nama || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                          +{achievement.point}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {achievement.jenis || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            achievement.isActive
                              ? "bg-blue-100 text-blue-800 border border-blue-200"
                              : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                        >
                          {achievement.isActive ? (
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
                            onClick={() => handleEdit(achievement)}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-2.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 text-xs font-medium"
                            title="Edit prestasi"
                          >
                            <FiEdit2 className="text-xs" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(achievement.id)}
                            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-2.5 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1 text-xs font-medium"
                            title="Hapus prestasi"
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

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-md mx-auto shadow-xl border border-gray-200 overflow-hidden">
              {/* Header dengan tema hijau */}
              <div className="px-6 py-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-green-500 to-green-600">
                      <FiAward className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-green-800">
                        {editingAchievement
                          ? "Edit Prestasi"
                          : "Tambah Prestasi"}
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
                      Nama Prestasi
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-green-100 p-3 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 bg-gray-50 font-medium placeholder-gray-400"
                        placeholder="Contoh: Juara 1 Olimpiade, Prestasi Akademik Terbaik"
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400">
                        <FiAward className="text-sm" />
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
                        className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-green-100 p-3 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 bg-gray-50 font-medium"
                        required
                      >
                        <option value="">Pilih Kategori Prestasi</option>
                        {categories
                          .filter((cat) => cat.tipe === "prestasi")
                          .map((category) => (
                            <option key={category.id} value={category.id}>
                              {category.nama}
                            </option>
                          ))}
                      </select>
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400">
                        <FiTag className="text-sm" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Point Prestasi
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="point"
                        value={formData.point}
                        onChange={handleInputChange}
                        className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-green-100 p-3 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 bg-gray-50 font-medium placeholder-gray-400"
                        placeholder="Contoh: 50, 75, 100"
                        required
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400">
                        <FiTrendingUp className="text-sm" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Jenis Prestasi (Opsional)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="jenis"
                        value={formData.jenis}
                        onChange={handleInputChange}
                        className="w-full border-2 border-green-200 focus:border-green-500 focus:ring-green-100 p-3 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 bg-gray-50 font-medium placeholder-gray-400"
                        placeholder="Contoh: Akademik, Olahraga, Seni"
                      />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-400">
                        <FiStar className="text-sm" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className="relative">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-green-600 border-2 border-green-300 rounded focus:ring-green-500 transition-all duration-200"
                        />
                        {formData.isActive && (
                          <FiCheck className="absolute top-0 left-0 w-4 h-4 text-white pointer-events-none" />
                        )}
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-800 group-hover:text-green-700 transition-colors duration-200">
                          Aktifkan prestasi ini
                        </span>
                        <p className="text-xs text-gray-600 mt-0.5">
                          Prestasi aktif akan tersedia untuk digunakan dalam
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
                      className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          Menyimpan...
                        </>
                      ) : (
                        <>
                          <FiCheck className="text-sm" />
                          {editingAchievement ? "Perbarui" : "Simpan"}
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

export default KelolaPrestasi;
