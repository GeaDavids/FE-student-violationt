import React, { useState, useEffect } from "react";
import {
  FiTag,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiAlertTriangle,
  FiAward,
  FiX,
} from "react-icons/fi";
import kategoriAPI from "../../api/kategori";
import axios from "axios";

const Kategori = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedTipe, setSelectedTipe] = useState("pelanggaran");
  const [formData, setFormData] = useState({
    nama: "",
    tipe: "pelanggaran",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const axiosConfig = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  };

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/master/kategori", axiosConfig);
      setCategories(response.data);
      setError("");
    } catch (err) {
      setError("Gagal mengambil data kategori");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await kategoriAPI.update(editingCategory.id, formData);
      } else {
        await kategoriAPI.create(formData);
      }

      await fetchCategories();
      handleCloseModal();
    } catch (err) {
      setError(
        editingCategory
          ? "Gagal memperbarui kategori"
          : "Gagal menambah kategori"
      );
      console.error(err);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      nama: category.nama,
      tipe: category.tipe,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus kategori ini?")) {
      try {
        await kategoriAPI.delete(id);
        await fetchCategories();
      } catch (err) {
        setError("Gagal menghapus kategori");
        console.error(err);
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingCategory(null);
    setFormData({ nama: "", tipe: "pelanggaran" });
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddCategory = (tipe) => {
    setFormData({ nama: "", tipe });
    setShowModal(true);
  };

  // Filter categories by type
  const pelanggaranCategories = categories.filter(
    (cat) => cat.tipe === "pelanggaran"
  );
  const prestasiCategories = categories.filter(
    (cat) => cat.tipe === "prestasi"
  );

  if (loading)
    return (
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-4 border-gray-200 border-t-[#003366]"></div>
          <span className="ml-2 text-gray-600 text-sm">Memuat data...</span>
        </div>
      </div>
    );

  const CategoryTable = ({ categories, title, tipe, bgColor, textColor }) => (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden h-full flex flex-col">
      <div className={`${bgColor} px-4 py-2.5 border-b border-gray-200`}>
        <div className="flex items-center gap-2">
          <div
            className={`p-1.5 rounded-lg shadow-md ${
              tipe === "pelanggaran"
                ? "bg-gradient-to-r from-red-500 to-red-600"
                : "bg-gradient-to-r from-green-500 to-green-600"
            }`}
          >
            {tipe === "pelanggaran" ? (
              <FiAlertTriangle className="text-white text-sm" />
            ) : (
              <FiAward className="text-white text-sm" />
            )}
          </div>
          <h2 className={`text-sm font-bold ${textColor}`}>{title}</h2>
        </div>
      </div>
      <div className="overflow-x-auto flex-1 flex flex-col">
        <table className="min-w-full flex-1">
          <thead
            className="text-gray-700"
            style={{ backgroundColor: "oklch(96.7% 0.003 264.542)" }}
          >
            <tr className="h-10">
              <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider w-12 h-10 align-middle">
                No
              </th>
              <th className="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wider h-10 align-middle">
                Nama Kategori
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider w-16 h-10 align-middle">
                Jumlah
              </th>
              <th className="px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wider w-20 h-10 align-middle">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr className="h-12">
                <td colSpan="4" className="px-4 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`p-3 rounded-full mb-3 ${
                        tipe === "pelanggaran" ? "bg-red-50" : "bg-green-50"
                      }`}
                    >
                      <FiTag
                        className={`text-2xl ${
                          tipe === "pelanggaran"
                            ? "text-red-300"
                            : "text-green-300"
                        }`}
                      />
                    </div>
                    <p className="text-gray-600 font-medium text-xs">
                      Belum ada kategori {title.toLowerCase()}
                    </p>
                    <p className="text-gray-400 text-xs mt-1">
                      Klik tombol tambah untuk membuat kategori baru
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              categories.map((category, index) => (
                <tr
                  key={category.id}
                  className="hover:bg-gray-50 transition-colors duration-200 h-12"
                >
                  <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-700 font-medium text-center h-12 align-middle">
                    {index + 1}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-xs text-gray-900 font-medium h-12 align-middle">
                    {category.nama}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-center h-12 align-middle">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium shadow-sm ${
                        tipe === "pelanggaran"
                          ? "bg-red-100 text-red-800 border border-red-200"
                          : "bg-green-100 text-green-800 border border-green-200"
                      }`}
                    >
                      {category.items?.length || 0}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-center h-12 align-middle">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleEdit(category)}
                        className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                        title="Edit kategori"
                      >
                        <FiEdit2 className="text-xs" />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="inline-flex items-center justify-center w-6 h-6 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-md transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                        title="Hapus kategori"
                      >
                        <FiTrash2 className="text-xs" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
            {/* Add empty rows to maintain consistent height */}
            {categories.length > 0 &&
              categories.length < 5 &&
              Array.from({ length: 5 - categories.length }).map((_, index) => (
                <tr key={`empty-${index}`} className="h-12">
                  <td colSpan="4" className="px-3 py-2.5 h-12 align-middle">
                    &nbsp;
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="space-y-4">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg shadow-md">
              <FiTag className="text-white text-sm" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Kelola Kategori
              </h1>
              <p className="text-gray-600 text-xs">
                Kelola kategori pelanggaran dan prestasi siswa
              </p>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-3 shadow-md">
            <div className="flex items-center gap-2">
              <FiAlertTriangle className="text-red-500 text-sm" />
              <p className="text-red-700 font-medium text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Category Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
          {/* Kategori Pelanggaran */}
          <div className="h-full space-y-3">
            {/* Header dengan tombol tambah */}
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-800">
                Kategori Pelanggaran
              </h3>
              <button
                onClick={() => handleAddCategory("pelanggaran")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 text-xs"
              >
                <FiPlus className="text-xs" />
                Tambah Pelanggaran
              </button>
            </div>
            <CategoryTable
              categories={pelanggaranCategories}
              title="Pelanggaran"
              tipe="pelanggaran"
              bgColor="bg-gradient-to-r from-red-50 to-red-100"
              textColor="text-red-800"
            />
          </div>

          {/* Kategori Prestasi */}
          <div className="h-full space-y-3">
            {/* Header dengan tombol tambah */}
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-800">
                Kategori Prestasi
              </h3>
              <button
                onClick={() => handleAddCategory("prestasi")}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-3 py-1.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-1.5 text-xs"
              >
                <FiPlus className="text-xs" />
                Tambah Prestasi
              </button>
            </div>
            <CategoryTable
              categories={prestasiCategories}
              title="Prestasi"
              tipe="prestasi"
              bgColor="bg-gradient-to-r from-green-50 to-green-100"
              textColor="text-green-800"
            />
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg w-full max-w-md mx-auto shadow-xl border border-gray-100 overflow-hidden">
              {/* Header dengan tema dinamis */}
              <div
                className={`px-4 py-3 ${
                  formData.tipe === "pelanggaran"
                    ? "bg-gradient-to-r from-red-50 to-red-100 border-b border-red-200"
                    : "bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg shadow-md bg-gradient-to-r from-blue-600 to-indigo-600">
                      {formData.tipe === "pelanggaran" ? (
                        <FiAlertTriangle className="text-white text-sm" />
                      ) : (
                        <FiAward className="text-white text-sm" />
                      )}
                    </div>
                    <div>
                      <h3
                        className={`text-sm font-bold ${
                          formData.tipe === "pelanggaran"
                            ? "text-red-800"
                            : "text-green-800"
                        }`}
                      >
                        {editingCategory
                          ? "Edit Kategori"
                          : "Tambah Kategori Baru"}
                      </h3>
                      <p className="text-gray-600 text-xs">
                        {editingCategory
                          ? `Ubah kategori ${formData.tipe}`
                          : `Buat kategori ${formData.tipe} baru`}
                      </p>
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
              <div className="p-4">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Tipe Kategori
                    </label>
                    <div className="relative">
                      <select
                        name="tipe"
                        value={formData.tipe}
                        onChange={handleInputChange}
                        className={`w-full border-2 ${
                          formData.tipe === "pelanggaran"
                            ? "border-red-200 focus:border-red-500 focus:ring-red-100"
                            : "border-green-200 focus:border-green-500 focus:ring-green-100"
                        } p-3 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 bg-gray-50 font-medium text-sm`}
                        disabled={editingCategory}
                      >
                        <option value="pelanggaran">🚫 Pelanggaran</option>
                        <option value="prestasi">🏆 Prestasi</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-2">
                      Nama Kategori
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        className={`w-full border-2 ${
                          formData.tipe === "pelanggaran"
                            ? "border-red-200 focus:border-red-500 focus:ring-red-100"
                            : "border-green-200 focus:border-green-500 focus:ring-green-100"
                        } p-3 rounded-lg focus:ring-2 focus:outline-none transition-all duration-200 bg-gray-50 font-medium placeholder-gray-400 text-sm`}
                        placeholder={`Contoh: ${
                          formData.tipe === "pelanggaran"
                            ? "Kedisiplinan, Tata Tertib"
                            : "Akademik, Olahraga"
                        }`}
                        required
                      />
                      <div
                        className={`absolute right-3 top-1/2 transform -translate-y-1/2 ${
                          formData.tipe === "pelanggaran"
                            ? "text-red-400"
                            : "text-green-400"
                        }`}
                      >
                        <FiTag className="text-sm" />
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-3">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 text-sm"
                    >
                      {formData.tipe === "pelanggaran" ? (
                        <FiAlertTriangle className="text-sm" />
                      ) : (
                        <FiAward className="text-sm" />
                      )}
                      {editingCategory
                        ? "Perbarui Kategori"
                        : "Simpan Kategori"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="bg-gradient-to-r from-gray-400 to-gray-500 hover:from-gray-500 hover:to-gray-600 text-white px-4 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-1.5 text-sm"
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

export default Kategori;
