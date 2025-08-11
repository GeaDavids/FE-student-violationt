import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiUser,
  FiMail,
  FiEdit,
  FiSave,
  FiX,
  FiTrash2,
  FiArrowLeft,
  FiUserCheck,
  FiPhone,
  FiHash,
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
        nama: location.state.guru.nama,
        email: location.state.guru.email,
        nip: location.state.guru.nip || "",
        noHp: location.state.guru.noHp || "",
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
        nama: editForm.nama,
        email: editForm.email,
        nip: editForm.nip,
        noHp: editForm.noHp,
      };

      // Menggunakan endpoint teacher management yang sudah dibuat
      await axios.put(
        `/api/superadmin/teachers/${guru.id}`,
        payload,
        axiosConfig
      );

      // Update local state
      setGuru({
        ...guru,
        nama: editForm.nama,
        email: editForm.email,
        nip: editForm.nip,
        noHp: editForm.noHp,
      });

      setIsEditing(false);
      const roleLabel = guru.role === "bk" ? "BK" : "Guru";
      Swal.fire(
        "Berhasil!",
        `Data ${roleLabel} berhasil diperbarui.`,
        "success"
      );
    } catch (err) {
      console.error("Error updating teacher/BK:", err.response || err);
      let errorMessage = "Terjadi kesalahan saat memperbarui data.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      Swal.fire("Gagal", errorMessage, "error");
    }
  };

  const handleDelete = () => {
    const roleLabel = guru.role === "bk" ? "BK" : "Guru";
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: `Data ${roleLabel} tidak bisa dikembalikan!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Menggunakan endpoint teacher management yang sudah dibuat
          await axios.delete(
            `/api/superadmin/teachers/${guru.id}`,
            axiosConfig
          );
          Swal.fire("Terhapus!", `Data ${roleLabel} telah dihapus.`, "success");
          navigate("/superadmin/kelola-guru");
        } catch (err) {
          console.error("Delete error:", err.response || err);
          let errorMessage = "Gagal menghapus data guru/BK.";
          if (err.response?.data?.error) {
            errorMessage = err.response.data.error;
          }
          Swal.fire("Gagal", errorMessage, "error");
        }
      }
    });
  };

  const handleCancel = () => {
    setEditForm({
      nama: guru.nama,
      email: guru.email,
      nip: guru.nip || "",
      noHp: guru.noHp || "",
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

  const isGuru = guru.role === "guru";
  const roleLabel = isGuru ? "Guru" : "BK";
  const roleColor = isGuru ? "blue" : "purple";

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
          <h1 className="text-2xl font-bold text-gray-800">
            Detail {roleLabel}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div
              className={`bg-gradient-to-r ${
                isGuru
                  ? "from-blue-600 to-indigo-600"
                  : "from-purple-600 to-pink-600"
              } p-6 text-center`}
            >
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUserCheck
                  className={`text-4xl ${
                    isGuru ? "text-blue-600" : "text-purple-600"
                  }`}
                />
              </div>
              <h2 className="text-xl font-bold text-white">{guru.nama}</h2>
              <p className={`${isGuru ? "text-blue-100" : "text-purple-100"}`}>
                {roleLabel}
              </p>
              {guru.nip && (
                <p
                  className={`${
                    isGuru ? "text-blue-200" : "text-purple-200"
                  } text-sm mt-1`}
                >
                  NIP: {guru.nip}
                </p>
              )}
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiMail className="text-gray-500" />
                  <span className="text-gray-700">{guru.email}</span>
                </div>
                {guru.noHp && (
                  <div className="flex items-center gap-3">
                    <FiPhone className="text-gray-500" />
                    <span className="text-gray-700">{guru.noHp}</span>
                  </div>
                )}
                {guru.waliKelas && (
                  <div className="flex items-center gap-3">
                    <FiUserCheck className="text-gray-500" />
                    <span className="text-gray-700">
                      Wali Kelas: {guru.waliKelas}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3">
                  <FiUserCheck className="text-gray-500" />
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                      isGuru
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}
                  >
                    {roleLabel}
                  </span>
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
                          name="nama"
                          value={editForm.nama}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      ) : (
                        <span className="text-gray-800">{guru.nama}</span>
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
                        <span className="text-gray-800">{guru.email}</span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <FiHash className="text-purple-500" />
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
                          placeholder="Masukkan NIP"
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
                          type="text"
                          name="noHp"
                          value={editForm.noHp}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Masukkan No. HP"
                        />
                      ) : (
                        <span className="text-gray-800">
                          {guru.noHp || "-"}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <FiUserCheck
                          className={`${
                            roleColor === "blue"
                              ? "text-blue-500"
                              : "text-purple-500"
                          }`}
                        />
                        Role
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          isGuru
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {roleLabel}
                      </span>
                    </td>
                  </tr>
                  {guru.waliKelas && (
                    <tr className="border-b border-gray-100">
                      <td className="py-4 px-2 font-medium text-gray-700">
                        <div className="flex items-center gap-2">
                          <FiUserCheck className="text-green-500" />
                          Wali Kelas
                        </div>
                      </td>
                      <td className="py-4 px-2">
                        <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                          {guru.waliKelas}
                        </span>
                      </td>
                    </tr>
                  )}
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
