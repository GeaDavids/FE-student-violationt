import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../../../../api/api";
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
} from "react-icons/fi";

const DetailBK = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bk, setBk] = useState(null);
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
    if (location.state?.bk) {
      setBk(location.state.bk);
      setEditForm({
        name: location.state.bk.name,
        email: location.state.bk.email,
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
      };

      await API.put(`/users/bk/${bk.id}`, payload, axiosConfig);

      // Update local state
      setBk({
        ...bk,
        name: editForm.name,
        email: editForm.email,
      });

      setIsEditing(false);
      Swal.fire("Berhasil!", "Data BK berhasil diperbarui.", "success");
    } catch (err) {
      console.error("Error updating BK:", err.response || err);
      let errorMessage = "Terjadi kesalahan saat memperbarui data BK.";
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
      text: "Data BK tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/users/bk/${bk.id}`, axiosConfig);
          Swal.fire("Terhapus!", "Data BK telah dihapus.", "success");
          navigate("/superadmin/kelola-guru");
        } catch (err) {
          console.error("Delete error:", err.response || err);
          Swal.fire("Gagal", "Gagal menghapus data BK.", "error");
        }
      }
    });
  };

  const handleCancel = () => {
    setEditForm({
      name: bk.name,
      email: bk.email,
    });
    setIsEditing(false);
  };

  const handleBack = () => {
    navigate("/superadmin/kelola-guru");
  };

  if (!bk) {
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
          <h1 className="text-2xl font-bold text-gray-800">Detail BK</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUserCheck className="text-4xl text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-white">{bk.name}</h2>
              <p className="text-green-100">BK (Bimbingan Konseling)</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiMail className="text-gray-500" />
                  <span className="text-gray-700">{bk.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <FiUser className="text-gray-500" />
                  <span className="text-gray-700">ID: {bk.id}</span>
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
                          name="name"
                          value={editForm.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      ) : (
                        <span className="text-gray-800">{bk.name}</span>
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
                        <span className="text-gray-800">{bk.email}</span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <FiUserCheck className="text-purple-500" />
                        ID
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-gray-800">{bk.id}</span>
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

export default DetailBK;
