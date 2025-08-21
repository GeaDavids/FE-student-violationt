import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiCalendar,
  FiAlertTriangle,
} from "react-icons/fi";
import academicYearAPI from "../api/academicYear";
import superadminAPI from "../api/superadmin";

const AcademicYearManagement = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [formData, setFormData] = useState({
    tahunAjaran: "",
    tahunMulai: "",
    tahunSelesai: "",
    tanggalMulai: "",
    tanggalSelesai: "",
    isActive: false,
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const response = await academicYearAPI.getAll();
      setAcademicYears(response.data.data || []);
    } catch (error) {
      console.error("Error fetching academic years:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingYear) {
        await superadminAPI.updateAcademicYear(editingYear.id, formData);
      } else {
        await superadminAPI.createAcademicYear(formData);
      }

      setShowModal(false);
      setEditingYear(null);
      setFormData({
        tahunAjaran: "",
        tahunMulai: "",
        tahunSelesai: "",
        tanggalMulai: "",
        tanggalSelesai: "",
        isActive: false,
      });
      fetchAcademicYears();
    } catch (error) {
      console.error("Error saving academic year:", error);
      alert("Gagal menyimpan tahun ajaran");
    }
  };

  const handleEdit = (year) => {
    setEditingYear(year);
    setFormData({
      tahunAjaran: year.tahunAjaran,
      tahunMulai: year.tahunMulai.toString(),
      tahunSelesai: year.tahunSelesai.toString(),
      tanggalMulai: new Date(year.tanggalMulai).toISOString().split("T")[0],
      tanggalSelesai: new Date(year.tanggalSelesai).toISOString().split("T")[0],
      isActive: year.isActive,
    });
    setShowModal(true);
  };

  const handleDelete = async (yearId) => {
    try {
      await superadminAPI.deleteAcademicYear(yearId);
      setDeleteConfirm(null);
      fetchAcademicYears();
    } catch (error) {
      console.error("Error deleting academic year:", error);
      alert("Gagal menghapus tahun ajaran. Mungkin masih ada data terkait.");
    }
  };

  const handleSetActive = async (yearId) => {
    try {
      await superadminAPI.setActiveAcademicYear(yearId);
      fetchAcademicYears();
    } catch (error) {
      console.error("Error setting active academic year:", error);
      alert("Gagal mengaktifkan tahun ajaran");
    }
  };

  const generateTahunAjaran = () => {
    const { tahunMulai, tahunSelesai } = formData;
    if (tahunMulai && tahunSelesai) {
      setFormData((prev) => ({
        ...prev,
        tahunAjaran: `${tahunMulai}/${tahunSelesai}`,
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Manajemen Tahun Ajaran
            </h3>
            <p className="text-sm text-gray-500">
              Kelola tahun ajaran akademik sekolah
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FiPlus className="w-5 h-5 mr-2" />
            Tambah Tahun Ajaran
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tahun Ajaran
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Periode
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Mulai
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal Selesai
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aksi
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {academicYears.map((year) => (
              <tr key={year.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <FiCalendar className="w-5 h-5 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">
                      {year.tahunAjaran}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {year.tahunMulai} - {year.tahunSelesai}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(year.tanggalMulai).toLocaleDateString("id-ID")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(year.tanggalSelesai).toLocaleDateString("id-ID")}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {year.isActive ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <FiCheckCircle className="w-4 h-4 mr-1" />
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Tidak Aktif
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {!year.isActive && (
                      <button
                        onClick={() => handleSetActive(year.id)}
                        className="text-green-600 hover:text-green-900"
                        title="Aktifkan"
                      >
                        <FiCheckCircle className="w-5 h-5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(year)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title="Edit"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(year)}
                      className="text-red-600 hover:text-red-900"
                      title="Hapus"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {academicYears.length === 0 && (
          <div className="text-center py-12">
            <FiCalendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Belum ada tahun ajaran
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Mulai dengan menambahkan tahun ajaran pertama.
            </p>
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingYear ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tahun Mulai
                    </label>
                    <input
                      type="number"
                      value={formData.tahunMulai}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tahunMulai: e.target.value,
                        }))
                      }
                      onBlur={generateTahunAjaran}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tahun Selesai
                    </label>
                    <input
                      type="number"
                      value={formData.tahunSelesai}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          tahunSelesai: e.target.value,
                        }))
                      }
                      onBlur={generateTahunAjaran}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tahun Ajaran
                  </label>
                  <input
                    type="text"
                    value={formData.tahunAjaran}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tahunAjaran: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Contoh: 2023/2024"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalMulai}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tanggalMulai: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tanggal Selesai
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalSelesai}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        tanggalSelesai: e.target.value,
                      }))
                    }
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>

                <div className="flex items-center">
                  <input
                    id="isActive"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    Aktifkan tahun ajaran ini
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingYear(null);
                      setFormData({
                        tahunAjaran: "",
                        tahunMulai: "",
                        tahunSelesai: "",
                        tanggalMulai: "",
                        tanggalSelesai: "",
                        isActive: false,
                      });
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                  >
                    {editingYear ? "Update" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <FiAlertTriangle className="mx-auto h-12 w-12 text-red-600" />
              <h3 className="text-lg font-medium text-gray-900 mt-4">
                Hapus Tahun Ajaran
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Apakah Anda yakin ingin menghapus tahun ajaran{" "}
                <strong>{deleteConfirm.tahunAjaran}</strong>? Tindakan ini tidak
                dapat dibatalkan.
              </p>
              <div className="flex justify-center space-x-3 mt-6">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Batal
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicYearManagement;
