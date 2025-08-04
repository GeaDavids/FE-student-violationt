import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit,
  FiSave,
  FiX,
  FiTrash2,
  FiArrowLeft,
  FiKey,
  FiUserCheck,
} from "react-icons/fi";

const DetailGuru = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [guru, setGuru] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const token = localStorage.getItem("token");
  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    if (location.state?.guru) {
      setGuru(location.state.guru);
      setEditForm({
        name: location.state.guru.user.name,
        email: location.state.guru.user.email,
        nip: location.state.guru.nip || "",
        noHp: location.state.guru.noHp || "",
        alamat: location.state.guru.alamat || "",
      });
    } else {
      navigate("/superadmin/kelola-guru");
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
        name: editForm.name,
        email: editForm.email,
        nip: editForm.nip,
        noHp: editForm.noHp,
        alamat: editForm.alamat,
      };

      await axios.put(
        `/api/users/teachers/${guru.user.id}`,
        payload,
        axiosConfig
      );

      // Update local state
      setGuru({
        ...guru,
        user: {
          ...guru.user,
          name: editForm.name,
          email: editForm.email,
        },
        nip: editForm.nip,
        noHp: editForm.noHp,
        alamat: editForm.alamat,
      });

      setIsEditing(false);
      Swal.fire("Berhasil!", "Data guru berhasil diperbarui.", "success");
    } catch (err) {
      console.error("Error updating teacher:", err.response || err);
      let errorMessage = "Terjadi kesalahan saat memperbarui data guru.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      Swal.fire("Gagal", errorMessage, "error");
    }
  };

  const handleDelete = () => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data guru tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/users/teachers/${guru.user.id}`, axiosConfig);
          Swal.fire("Terhapus!", "Data guru telah dihapus.", "success");
          navigate("/superadmin/kelola-guru");
        } catch (err) {
          console.error("Delete error:", err.response || err);
          Swal.fire("Gagal", "Gagal menghapus data guru.", "error");
        }
      }
    });
  };

  const handleResetPassword = () => {
    Swal.fire({
      title: "Reset Password?",
      text: "Password guru akan diatur ulang ke default.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Reset",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.put(
            `/api/users/teachers/${guru.user.id}/reset-password`,
            {},
            axiosConfig
          );
          Swal.fire("Berhasil!", "Password telah di-reset.", "success");
        } catch (err) {
          console.error("Reset password error:", err.response || err);
          Swal.fire("Gagal", "Tidak dapat mereset password.", "error");
        }
      }
    });
  };

  const handleCancel = () => {
    setEditForm({
      name: guru.user.name,
      email: guru.user.email,
      nip: guru.nip || "",
      noHp: guru.noHp || "",
      alamat: guru.alamat || "",
    });
    setIsEditing(false);
  };

  const handleBack = () => {
    navigate("/superadmin/kelola-guru");
  };

  if (!guru) {
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
          <h1 className="text-2xl font-bold text-gray-800">Detail Guru</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="text-4xl text-blue-600" />
              </div>
              <h2 className="text-xl font-bold text-white">{guru.user.name}</h2>
              <p className="text-blue-100">{guru.user.role}</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiMail className="text-gray-500" />
                  <span className="text-gray-700">{guru.user.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiUserCheck className="text-gray-500" />
                  <span className="text-gray-700">NIP: {guru.nip || "-"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiPhone className="text-gray-500" />
                  <span className="text-gray-700">{guru.noHp || "-"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiMapPin className="text-gray-500" />
                  <span className="text-gray-700">{guru.alamat || "-"}</span>
                </div>
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
                      onClick={handleResetPassword}
                      className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all duration-200 shadow-md"
                    >
                      <FiKey />
                      Reset Password
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
                        <FiUser className="text-blue-500" />
                        Nama Lengkap
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      ) : (
                        <span className="text-gray-800">{guru.user.name}</span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <FiMail className="text-green-500" />
                        Email
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      {isEditing ? (
                        <input
                          type="email"
                          name="email"
                          value={editForm.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      ) : (
                        <span className="text-gray-800">{guru.user.email}</span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <FiUserCheck className="text-purple-500" />
                        NIP
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      {isEditing ? (
                        <input
                          type="text"
                          name="nip"
                          value={editForm.nip}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-gray-800">{guru.nip || "-"}</span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <FiPhone className="text-orange-500" />
                        No. HP
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      {isEditing ? (
                        <input
                          type="tel"
                          name="noHp"
                          value={editForm.noHp}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className="text-gray-800">{guru.noHp || "-"}</span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <FiMapPin className="text-red-500" />
                        Alamat
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      {isEditing ? (
                        <textarea
                          name="alamat"
                          value={editForm.alamat}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        />
                      ) : (
                        <span className="text-gray-800">{guru.alamat || "-"}</span>
                      )}
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

export default DetailGuru;
