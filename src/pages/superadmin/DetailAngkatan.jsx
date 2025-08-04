import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiCalendar,
  FiEdit,
  FiSave,
  FiX,
  FiTrash2,
  FiArrowLeft,
  FiUsers,
  FiAward,
  FiFileText,
  FiTag,
} from "react-icons/fi";

const DetailAngkatan = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [angkatan, setAngkatan] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const token = localStorage.getItem("token");
  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const statusList = [
    { value: "", label: "Aktif", color: "bg-green-100 text-green-800" },
    { value: "graduated", label: "Lulus", color: "bg-blue-100 text-blue-800" },
    { value: "inactive", label: "Non-Aktif", color: "bg-gray-100 text-gray-800" },
  ];

  useEffect(() => {
    if (location.state?.angkatan) {
      setAngkatan(location.state.angkatan);
      setEditForm({
        tahun: location.state.angkatan.tahun || location.state.angkatan.year || "",
        nama: location.state.angkatan.nama || location.state.angkatan.name || "",
        keterangan: location.state.angkatan.keterangan || "",
        lulusDate: location.state.angkatan.lulusDate || "",
      });
    } else {
      navigate("/superadmin/kelola-angkatan");
    }
  }, [location.state, navigate]);

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        tahun: editForm.tahun,
        nama: editForm.nama || `Angkatan ${editForm.tahun}`,
        keterangan: editForm.keterangan,
        lulusDate: editForm.lulusDate || null,
      };

      await axios.put(
        `/api/angkatan/${angkatan.id}`,
        payload,
        axiosConfig
      );

      // Update local state
      setAngkatan({
        ...angkatan,
        tahun: editForm.tahun,
        nama: editForm.nama,
        keterangan: editForm.keterangan,
        lulusDate: editForm.lulusDate,
      });

      setIsEditing(false);
      Swal.fire("Berhasil!", "Data angkatan berhasil diperbarui.", "success");
    } catch (err) {
      console.error("Error updating angkatan:", err.response || err);
      let errorMessage = "Terjadi kesalahan saat memperbarui data angkatan.";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      Swal.fire("Gagal", errorMessage, "error");
    }
  };

  const handleDelete = () => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data angkatan tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/angkatan/${angkatan.id}`, axiosConfig);
          Swal.fire("Terhapus!", "Data angkatan telah dihapus.", "success");
          navigate("/superadmin/kelola-angkatan");
        } catch (err) {
          console.error("Delete error:", err.response || err);
          Swal.fire("Gagal", "Gagal menghapus data angkatan.", "error");
        }
      }
    });
  };

  const viewStudents = () => {
    Swal.fire({
      title: `Siswa ${angkatan.nama || angkatan.name}`,
      text: "Fitur ini akan menampilkan daftar siswa di angkatan tersebut",
      icon: "info",
    });
  };

  const handleCancel = () => {
    setEditForm({
      tahun: angkatan.tahun || angkatan.year || "",
      nama: angkatan.nama || angkatan.name || "",
      keterangan: angkatan.keterangan || "",
      status: angkatan.status || "aktif",
    });
    setIsEditing(false);
  };

  const handleBack = () => {
    navigate("/superadmin/kelola-angkatan");
  };

  const getStatusBadge = (angkatan) => {
    let status = "";
    let color = "";
    let label = "";

    if (angkatan.lulusDate && angkatan.lulusDate !== null) {
      const lulusYear = new Date(angkatan.lulusDate).getFullYear();
      status = "graduated";
      color = "bg-blue-100 text-blue-800";
      label = `Lulus ${lulusYear}`;
    } else if (angkatan.status === "inactive") {
      status = "inactive";
      color = "bg-gray-100 text-gray-800";
      label = "Non-Aktif";
    } else {
      status = "active";
      color = "bg-green-100 text-green-800";
      label = "Aktif";
    }
    
    return (
      <span className={`${color} px-2 py-1 rounded-full text-xs font-medium`}>
        {label}
      </span>
    );
  };

  // Generate tahun options
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear + 2; i >= currentYear - 10; i--) {
    yearOptions.push(i);
  }

  if (!angkatan) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors duration-200"
          >
            <FiArrowLeft />
            Kembali
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Detail Angkatan</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <FiCalendar className="text-4xl text-orange-600" />
              </div>
              <h2 className="text-xl font-bold text-white">
                {angkatan.nama || angkatan.name || `Angkatan ${angkatan.tahun || angkatan.year}`}
              </h2>
              <p className="text-orange-100">Tahun {angkatan.tahun || angkatan.year}</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiCalendar className="text-gray-500" />
                  <span className="text-gray-700">Tahun: {angkatan.tahun || angkatan.year}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiTag className="text-gray-500" />
                  <span>Status: {getStatusBadge(angkatan)}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiUsers className="text-gray-500" />
                  <span className="text-gray-700">
                    {angkatan.jmlSiswa || 0} Siswa
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FiAward className="text-gray-500" />
                  <span className="text-gray-700">ID: {angkatan.id}</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={viewStudents}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-200 shadow-md"
                >
                  <FiUsers />
                  Lihat Siswa
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-800">
                Informasi Detail
              </h3>
              <div className="flex gap-2">
                {!isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-lg hover:from-yellow-600 hover:to-orange-600 transition-all duration-200 shadow-md"
                    >
                      <FiEdit />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg hover:from-red-600 hover:to-pink-600 transition-all duration-200 shadow-md"
                    >
                      <FiTrash2 />
                      Hapus
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleSave}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-md"
                    >
                      <FiSave />
                      Simpan
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-500 to-slate-500 text-white rounded-lg hover:from-gray-600 hover:to-slate-600 transition-all duration-200 shadow-md"
                    >
                      <FiX />
                      Batal
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody className="space-y-2">
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium text-gray-700 w-1/3">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-blue-500" />
                        Tahun
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      {isEditing ? (
                        <select
                          name="tahun"
                          value={editForm.tahun}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        >
                          <option value="">Pilih Tahun</option>
                          {yearOptions.map((year) => (
                            <option key={year} value={year}>
                              {year}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-800">{angkatan.tahun || angkatan.year}</span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <FiTag className="text-green-500" />
                        Nama Angkatan
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      {isEditing ? (
                        <input
                          type="text"
                          name="nama"
                          value={editForm.nama}
                          onChange={handleInputChange}
                          placeholder="Nama Angkatan (opsional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-gray-800">
                          {angkatan.nama || angkatan.name || `Angkatan ${angkatan.tahun || angkatan.year}`}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <FiAward className="text-purple-500" />
                        Status Kelulusan
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span>{getStatusBadge(angkatan)}</span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-blue-500" />
                        Tanggal Lulus
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      {isEditing ? (
                        <input
                          type="date"
                          name="lulusDate"
                          value={editForm.lulusDate}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-gray-700">
                          {angkatan.lulusDate ? new Date(angkatan.lulusDate).toLocaleDateString('id-ID') : "Belum lulus"}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <FiUsers className="text-orange-500" />
                        Jumlah Siswa
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-800">{angkatan.jmlSiswa || 0} siswa</span>
                        <button
                          onClick={viewStudents}
                          className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-200"
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <FiFileText className="text-red-500" />
                        Keterangan
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      {isEditing ? (
                        <textarea
                          name="keterangan"
                          value={editForm.keterangan}
                          onChange={handleInputChange}
                          placeholder="Keterangan (opsional)"
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      ) : (
                        <span className="text-gray-800">
                          {angkatan.keterangan || "Tidak ada keterangan"}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <FiAward className="text-indigo-500" />
                        ID Angkatan
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-gray-800">{angkatan.id}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailAngkatan;
