import React, { useState, useEffect } from "react";
import kategoriAPI from "../../api/kategori";

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

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await kategoriAPI.getAll();
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

  if (loading) return <div className="p-4">Memuat data...</div>;

  const CategoryTable = ({ categories, title, tipe, bgColor, textColor }) => (
    <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
      <div className={`${bgColor} px-6 py-4 flex justify-between items-center`}>
        <h2 className={`text-xl font-bold ${textColor}`}>{title}</h2>
        <button
          onClick={() => handleAddCategory(tipe)}
          className={`${
            tipe === "pelanggaran"
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          } text-white px-4 py-2 rounded`}
        >
          Tambah Kategori {title}
        </button>
      </div>
      <table className="min-w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              No
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nama Kategori
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Jumlah Item
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Aksi
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {categories.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                Belum ada kategori {title.toLowerCase()}
              </td>
            </tr>
          ) : (
            categories.map((category, index) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {index + 1}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {category.nama}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {category.items?.length || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(category)}
                    className="text-indigo-600 hover:text-indigo-900 mr-4"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Kelola Kategori</h1>
        <p className="text-gray-600 mt-2">
          Kelola kategori pelanggaran dan prestasi siswa
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kategori Pelanggaran */}
        <div>
          <CategoryTable
            categories={pelanggaranCategories}
            title="Pelanggaran"
            tipe="pelanggaran"
            bgColor="bg-red-50"
            textColor="text-red-800"
          />
        </div>

        {/* Kategori Prestasi */}
        <div>
          <CategoryTable
            categories={prestasiCategories}
            title="Prestasi"
            tipe="prestasi"
            bgColor="bg-green-50"
            textColor="text-green-800"
          />
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingCategory
                  ? "Edit Kategori"
                  : `Tambah Kategori ${
                      formData.tipe === "pelanggaran"
                        ? "Pelanggaran"
                        : "Prestasi"
                    }`}
              </h3>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipe Kategori
                  </label>
                  <select
                    name="tipe"
                    value={formData.tipe}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={editingCategory} // Disable when editing
                  >
                    <option value="pelanggaran">Pelanggaran</option>
                    <option value="prestasi">Prestasi</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    name="nama"
                    value={formData.nama}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Masukkan nama kategori ${formData.tipe}`}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                      formData.tipe === "pelanggaran"
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {editingCategory ? "Perbarui" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Kategori;
