import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import { FiArrowLeft, FiEdit2, FiTrash2, FiSave, FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiBook } from "react-icons/fi";

const DetailSiswa = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [siswa, setSiswa] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [angkatanList, setAngkatanList] = useState([]);
  const [form, setForm] = useState({
    nisn: "",
    name: "",
    gender: "L",
    tempatLahir: "",
    tglLahir: "",
    alamat: "",
    noHp: "",
    angkatanId: "",
    orangTuaId: "",
  });
  const [errorMsg, setErrorMsg] = useState("");

  // Get data from navigation state if available
  const { siswa: siswaFromState, kelasDipilih, namaKelasDipilih } = location.state || {};

  const token = localStorage.getItem("token");
  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Helper function untuk format tanggal
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split('T')[0];
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString('id-ID');
  };

  const fetchSiswa = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/users/students/${id}`, axiosConfig);
      setSiswa(res.data);
      setForm({
        nisn: res.data.nisn || "",
        name: res.data.name || res.data.user?.name || "",
        gender: res.data.gender || "L",
        tempatLahir: res.data.tempatLahir || "",
        tglLahir: formatDateForInput(res.data.tglLahir),
        alamat: res.data.alamat || "",
        noHp: res.data.noHp || "",
        angkatanId: res.data.angkatanId || (res.data.angkatan ? res.data.angkatan.id : "") || "",
        orangTuaId: res.data.orangTuaId || "",
      });
    } catch (err) {
      console.error("Gagal mengambil data siswa:", err);
      Swal.fire("Error!", "Gagal mengambil data siswa", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchAngkatan = async () => {
    try {
      const res = await axios.get(`/api/angkatan`, axiosConfig);
      setAngkatanList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data angkatan:", err);
      // Fallback data angkatan
      setAngkatanList([
        { id: 1, tahun: "2024" },
        { id: 2, tahun: "2023" },
        { id: 3, tahun: "2022" },
      ]);
    }
  };

  useEffect(() => {
    if (siswaFromState) {
      setSiswa(siswaFromState);
      setForm({
        nisn: siswaFromState.nisn || "",
        name: siswaFromState.name || siswaFromState.user?.name || "",
        gender: siswaFromState.gender || "L",
        tempatLahir: siswaFromState.tempatLahir || "",
        tglLahir: formatDateForInput(siswaFromState.tglLahir),
        alamat: siswaFromState.alamat || "",
        noHp: siswaFromState.noHp || "",
        angkatanId: siswaFromState.angkatanId || (siswaFromState.angkatan ? siswaFromState.angkatan.id : "") || "",
        orangTuaId: siswaFromState.orangTuaId || "",
      });
      setLoading(false);
    } else {
      fetchSiswa();
    }
    fetchAngkatan();
  }, [id, siswaFromState]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setErrorMsg("");
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setErrorMsg("");
    // Reset form to original values
    if (siswa) {
      setForm({
        nisn: siswa.nisn || "",
        name: siswa.name || siswa.user?.name || "",
        gender: siswa.gender || "L",
        tempatLahir: siswa.tempatLahir || "",
        tglLahir: formatDateForInput(siswa.tglLahir),
        alamat: siswa.alamat || "",
        noHp: siswa.noHp || "",
        angkatanId: siswa.angkatanId || (siswa.angkatan ? siswa.angkatan.id : "") || "",
        orangTuaId: siswa.orangTuaId || "",
      });
    }
  };

  const handleSave = async () => {
    setErrorMsg("");

    const payload = {
      nisn: form.nisn,
      name: form.name,
      gender: form.gender,
      tempatLahir: form.tempatLahir,
      tglLahir: form.tglLahir,
      alamat: form.alamat,
      noHp: form.noHp,
      classroomId: siswa.classroom?.id || kelasDipilih,
      angkatanId: form.angkatanId ? parseInt(form.angkatanId) : 1,
      orangTuaId: form.orangTuaId ? parseInt(form.orangTuaId) : null,
    };

    try {
      const res = await axios.put(`/api/users/students/${id}`, payload, axiosConfig);
      
      // Update local state with new data instead of fetching again
      setSiswa({
        ...siswa,
        ...res.data,
        name: form.name,
        nisn: form.nisn,
        gender: form.gender,
        tempatLahir: form.tempatLahir,
        tglLahir: form.tglLahir,
        alamat: form.alamat,
        noHp: form.noHp,
        angkatanId: form.angkatanId,
        orangTuaId: form.orangTuaId,
      });
      
      Swal.fire("Berhasil!", "Data siswa berhasil diupdate!", "success");
      setIsEditing(false);
    } catch (err) {
      if (err.response?.data?.error) {
        setErrorMsg(err.response.data.error);
      } else {
        setErrorMsg("Gagal menyimpan data siswa.");
      }
      Swal.fire("Gagal!", "Terjadi kesalahan saat menyimpan data.", "error");
      console.error("Gagal menyimpan:", err);
    }
  };

  const handleDelete = async () => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data siswa tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/users/students/${id}`, axiosConfig);
          Swal.fire("Terhapus!", "Siswa berhasil dihapus.", "success");
          // Navigate back to class list
          if (kelasDipilih) {
            navigate("/superadmin/kelola-siswa", {
              state: { selectedClass: kelasDipilih, selectedClassName: namaKelasDipilih }
            });
          } else {
            navigate("/superadmin/kelola-siswa");
          }
        } catch (err) {
          Swal.fire("Gagal!", "Gagal menghapus siswa!", "error");
          console.error("Gagal menghapus siswa:", err);
        }
      }
    });
  };

  const handleBack = () => {
    if (kelasDipilih) {
      navigate("/superadmin/kelola-siswa", {
        state: { selectedClass: kelasDipilih, selectedClassName: namaKelasDipilih }
      });
    } else {
      navigate("/superadmin/kelola-siswa");
    }
  };

  if (loading) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen flex justify-center items-center">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-[#003366] mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Memuat data siswa...</p>
        </div>
      </div>
    );
  }

  if (!siswa) {
    return (
      <div className="p-8 bg-gray-50 min-h-screen">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiX className="text-2xl text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Tidak Ditemukan</h3>
          <p className="text-gray-600 mb-6">Data siswa yang Anda cari tidak dapat ditemukan.</p>
          <button
            onClick={handleBack}
            className="bg-[#003366] hover:bg-[#002244] text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto transition-colors"
          >
            <FiArrowLeft /> Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <FiArrowLeft /> Kembali
            </button>
            <div>
              <h1 className="text-3xl font-bold text-[#003366] flex items-center gap-3">
                <FiUser className="text-blue-600" />
                Detail Siswa
              </h1>
              {namaKelasDipilih && (
                <p className="text-gray-600 mt-1 flex items-center gap-2">
                  <FiBook className="text-sm" />
                  Kelas {namaKelasDipilih}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex gap-3">
            {!isEditing ? (
              <>
                <button
                  onClick={handleEdit}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-md transition-all transform hover:scale-105"
                >
                  <FiEdit2 /> Edit Data
                </button>
                <button
                  onClick={handleDelete}
                  className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-md transition-all transform hover:scale-105"
                >
                  <FiTrash2 /> Hapus
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-md transition-all transform hover:scale-105"
                >
                  <FiSave /> Simpan
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-md transition-all transform hover:scale-105"
                >
                  <FiX /> Batal
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 text-red-600 bg-red-50 border-l-4 border-red-500 rounded-r-lg p-4 shadow-sm">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <FiX className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{errorMsg}</p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="text-center">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiUser className="text-3xl text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="w-full text-center border rounded-lg px-3 py-2 text-xl font-semibold"
                    required
                  />
                ) : (
                  siswa.name || siswa.user?.name || "-"
                )}
              </h3>
              <p className="text-gray-600 mb-4">
                {siswa.nisn || "-"}
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <FiBook />
                  <span>{siswa.classroom?.namaKelas || namaKelasDipilih || "-"}</span>
                </div>
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <FiCalendar />
                  <span>Angkatan {siswa.angkatan?.tahun || siswa.angkatan?.year || siswa.angkatan?.name || siswa.angkatanId || "-"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Card */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-r from-[#003366] to-blue-600 px-6 py-4">
              <h3 className="text-xl font-semibold text-white">Informasi Lengkap</h3>
            </div>
            <div className="p-0">
              <table className="w-full">
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 bg-gray-50 font-semibold text-[#003366] w-1/3 flex items-center gap-2">
                      <FiUser className="text-blue-600" />
                      NISN
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          name="nisn"
                          value={form.nisn}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      ) : (
                        <span className="text-gray-900 font-medium">{siswa.nisn || "-"}</span>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 bg-gray-50 font-semibold text-[#003366] flex items-center gap-2">
                      <FiUser className="text-green-600" />
                      Jenis Kelamin
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <select
                          name="gender"
                          value={form.gender}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="L">Laki-laki</option>
                          <option value="P">Perempuan</option>
                        </select>
                      ) : (
                        <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          siswa.gender === "L" 
                            ? "bg-blue-100 text-blue-800" 
                            : "bg-pink-100 text-pink-800"
                        }`}>
                          {siswa.gender === "L" ? "Laki-laki" : "Perempuan"}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 bg-gray-50 font-semibold text-[#003366] flex items-center gap-2">
                      <FiMapPin className="text-red-600" />
                      Tempat Lahir
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          name="tempatLahir"
                          value={form.tempatLahir}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      ) : (
                        <span className="text-gray-900">{siswa.tempatLahir || "-"}</span>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 bg-gray-50 font-semibold text-[#003366] flex items-center gap-2">
                      <FiCalendar className="text-purple-600" />
                      Tanggal Lahir
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="date"
                          name="tglLahir"
                          value={form.tglLahir}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      ) : (
                        <span className="text-gray-900">{formatDateForDisplay(siswa.tglLahir)}</span>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 bg-gray-50 font-semibold text-[#003366] flex items-center gap-2">
                      <FiMapPin className="text-orange-600" />
                      Alamat
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <textarea
                          name="alamat"
                          value={form.alamat}
                          onChange={handleChange}
                          rows="3"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                          required
                        />
                      ) : (
                        <span className="text-gray-900">{siswa.alamat || "-"}</span>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 bg-gray-50 font-semibold text-[#003366] flex items-center gap-2">
                      <FiPhone className="text-green-600" />
                      No. HP
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          name="noHp"
                          value={form.noHp}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        />
                      ) : (
                        <span className="text-gray-900 font-mono">{siswa.noHp || "-"}</span>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 bg-gray-50 font-semibold text-[#003366] flex items-center gap-2">
                      <FiCalendar className="text-indigo-600" />
                      Angkatan
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <select
                          name="angkatanId"
                          value={form.angkatanId}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          required
                        >
                          <option value="">Pilih Angkatan</option>
                          {angkatanList.map((angkatan) => (
                            <option key={angkatan.id} value={angkatan.id}>
                              {angkatan.tahun || angkatan.year || angkatan.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                          {siswa.angkatan?.tahun || siswa.angkatan?.year || siswa.angkatan?.name || siswa.angkatanId || "-"}
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 bg-gray-50 font-semibold text-[#003366] flex items-center gap-2">
                      <FiBook className="text-blue-600" />
                      Kelas
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        {siswa.classroom?.namaKelas || namaKelasDipilih || "-"}
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 bg-gray-50 font-semibold text-[#003366] flex items-center gap-2">
                      <FiUser className="text-gray-600" />
                      ID Orang Tua
                    </td>
                    <td className="px-6 py-4">
                      {isEditing ? (
                        <input
                          type="number"
                          name="orangTuaId"
                          value={form.orangTuaId}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Optional"
                        />
                      ) : (
                        <span className="text-gray-900">{siswa.orangTuaId || "-"}</span>
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

export default DetailSiswa;
