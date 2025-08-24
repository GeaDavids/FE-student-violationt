import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiCheckCircle,
  FiCalendar,
  FiAlertTriangle,
  FiX,
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
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-xl">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                  <FiCalendar className="text-blue-600" />
                  {editingYear ? "Edit Tahun Ajaran" : "Tambah Tahun Ajaran"}
                </h3>
                <button
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
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  <FiX size={24} />
                </button>
              </div>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6">
              <div className="space-y-6">
                {/* Tahun Ajaran Display */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tahun Ajaran
                  </label>
                  <input
                    type="text"
                    value={formData.tahunAjaran}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    placeholder="Akan dibuat otomatis dari tahun mulai dan selesai"
                  />
                </div>

                {/* Grid untuk Tahun Mulai dan Selesai */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tahun Mulai <span className="text-red-500">*</span>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="2020"
                      max="2050"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tahun Selesai <span className="text-red-500">*</span>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      min="2020"
                      max="2050"
                    />
                  </div>
                </div>

                {/* Grid untuk Tanggal Mulai dan Selesai */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Mulai <span className="text-red-500">*</span>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tanggal Selesai <span className="text-red-500">*</span>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                {/* Status Aktif */}
                <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
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
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="isActive"
                    className="text-sm font-medium text-blue-900"
                  >
                    Aktifkan tahun ajaran ini
                  </label>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200 mt-6">
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
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <FiCheckCircle size={16} />
                  {editingYear ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
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
