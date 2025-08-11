import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiHome,
  FiUser,
  FiUsers,
  FiEdit,
  FiSave,
  FiX,
  FiTrash2,
  FiArrowLeft,
  FiTag,
  FiUserCheck,
  FiBook,
} from "react-icons/fi";

const DetailKelas = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [kelas, setKelas] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [guruList, setGuruList] = useState([]);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  useEffect(() => {
    if (location.state?.kelas) {
      fetchClassroomDetail(location.state.kelas.id);
      fetchGuru();
    } else {
      navigate("/superadmin/kelola-kelas");
    }
  }, [location.state, navigate]);

  const fetchClassroomDetail = async (classroomId) => {
    try {
      const res = await axios.get(
        `/api/superadmin/masterdata/classrooms/${classroomId}`,
        axiosConfig
      );
      const classroomData = res.data.data;
      setKelas(classroomData);
      setEditForm({
        namaKelas: classroomData.namaKelas || "",
        waliKelasId: classroomData.waliKelasId || "",
      });
    } catch (err) {
      console.error("Gagal mengambil detail kelas:", err);
      // Fallback to location state data
      setKelas(location.state.kelas);
      setEditForm({
        namaKelas:
          location.state.kelas.namaKelas || location.state.kelas.nama || "",
        waliKelasId: location.state.kelas.waliKelasId || "",
      });
    }
  };

  const fetchGuru = async () => {
    try {
      // Menggunakan endpoint masterData untuk mendapatkan semua guru
      const res = await axios.get(
        "/api/superadmin/masterdata/teachers",
        axiosConfig
      );
      setGuruList(res.data.data);
    } catch (err) {
      console.error("Gagal mengambil data guru:", err);
    }
  };

  const handleInputChange = (e) => {
    setEditForm({
      ...editForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        namaKelas: editForm.namaKelas,
        waliKelasId: editForm.waliKelasId
          ? parseInt(editForm.waliKelasId)
          : null,
      };

      // Menggunakan endpoint masterData controller
      await axios.put(
        `/api/superadmin/masterdata/classrooms/${kelas.id}`,
        payload,
        axiosConfig
      );

      // Update local state
      const updatedWaliKelas = editForm.waliKelasId
        ? guruList.find((guru) => guru.id === parseInt(editForm.waliKelasId))
            ?.name
        : null;

      setKelas({
        ...kelas,
        namaKelas: editForm.namaKelas,
        waliKelas: updatedWaliKelas,
      });

      setIsEditing(false);
      Swal.fire("Berhasil!", "Data kelas berhasil diperbarui.", "success");
    } catch (err) {
      console.error("Error updating class:", err.response || err);
      let errorMessage = "Terjadi kesalahan saat memperbarui data kelas.";
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
      text: "Data kelas tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Menggunakan endpoint masterData controller
          await axios.delete(
            `/api/superadmin/masterdata/classrooms/${kelas.id}`,
            axiosConfig
          );
          Swal.fire("Terhapus!", "Data kelas telah dihapus.", "success");
          navigate("/superadmin/kelola-kelas");
        } catch (err) {
          console.error("Delete error:", err.response || err);
          let errorMessage = "Gagal menghapus data kelas.";
          if (err.response?.data?.error) {
            errorMessage = err.response.data.error;
          }
          Swal.fire("Gagal", errorMessage, "error");
        }
      }
    });
  };

  const viewStudents = () => {
    Swal.fire({
      title: `Siswa di Kelas ${kelas.namaKelas}`,
      text: "Fitur ini akan menampilkan daftar siswa di kelas tersebut",
      icon: "info",
    });
  };

  const handleCancel = () => {
    setEditForm({
      namaKelas: kelas.namaKelas || kelas.nama || "",
      waliKelasId: kelas.waliKelasId || "",
    });
    setIsEditing(false);
  };

  const handleBack = () => {
    navigate("/superadmin/kelola-kelas");
  };

  if (!kelas) {
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
          <h1 className="text-2xl font-bold text-gray-800">Detail Kelas</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                <FiHome className="text-4xl text-indigo-600" />
              </div>
              <h2 className="text-xl font-bold text-white">
                {kelas.namaKelas || kelas.nama}
              </h2>
              <p className="text-indigo-100">{kelas.kodeKelas || kelas.id}</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FiTag className="text-gray-500" />
                  <span className="text-gray-700">
                    Kode: {kelas.kodeKelas || kelas.id}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FiUserCheck className="text-gray-500" />
                  <span className="text-gray-700">
                    Wali:{" "}
                    {kelas.waliKelas?.user?.name ||
                      kelas.waliKelas?.nama ||
                      kelas.waliKelas ||
                      "Belum ditentukan"}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <FiUsers className="text-gray-500" />
                  <span className="text-gray-700">
                    {kelas.jmlSiswa || kelas.jumlahSiswa || 0} Siswa
                  </span>
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
                        <FiHome className="text-green-500" />
                        Nama Kelas
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      {isEditing ? (
                        <input
                          type="text"
                          name="namaKelas"
                          value={editForm.namaKelas}
                          onChange={handleInputChange}
                          placeholder="XII RPL 1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          required
                        />
                      ) : (
                        <span className="text-gray-800">
                          {kelas.namaKelas || kelas.nama}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <FiUserCheck className="text-purple-500" />
                        Wali Kelas
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      {isEditing ? (
                        <select
                          name="waliKelasId"
                          value={editForm.waliKelasId}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Pilih Wali Kelas</option>
                          {guruList.map((guru) => (
                            <option key={guru.id} value={guru.id}>
                              {guru.name} - {guru.nip}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-800">
                          {kelas.waliKelas?.user?.name ||
                            kelas.waliKelas?.nama ||
                            kelas.waliKelas ||
                            "Belum ditentukan"}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <FiUser className="text-orange-500" />
                        NIP Wali Kelas
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <span className="text-gray-800">
                        {kelas.waliKelas?.nip || "-"}
                      </span>
                    </td>
                  </tr>
                  <tr className="border-b border-gray-100">
                    <td className="py-4 px-2 font-medium text-gray-700">
                      <div className="flex items-center gap-2">
                        <FiUsers className="text-red-500" />
                        Jumlah Siswa
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-800">
                          {kelas.jmlSiswa || kelas.jumlahSiswa || 0} siswa
                        </span>
                        <button
                          onClick={viewStudents}
                          className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded-full hover:bg-blue-200 transition-colors duration-200"
                        >
                          Lihat Detail
                        </button>
                      </div>
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

export default DetailKelas;
