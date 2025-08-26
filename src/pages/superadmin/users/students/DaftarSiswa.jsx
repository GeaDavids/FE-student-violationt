import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import axios from "axios";
import {
  FiUsers,
  FiPlus,
  FiArrowLeft,
  FiSearch,
  FiUser,
  FiMail,
  FiPhone,
  FiCalendar,
  FiX,
} from "react-icons/fi";

const DaftarSiswa = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { kelasId } = useParams();
  const [dataSiswa, setDataSiswa] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
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
  const [editingId, setEditingId] = useState(null);
  const [angkatanList, setAngkatanList] = useState([]);
  const [angkatanLoading, setAngkatanLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [kelasInfo, setKelasInfo] = useState({});

  // Get data from navigation state or fetch by kelasId
  const { selectedClass, selectedClassName, kelasData } = location.state || {};

  // Helper function untuk format tanggal
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID");
  };

  const token = localStorage.getItem("token");

  // fetch siswa by class
  const fetchSiswaByKelas = useCallback(
    async (classroomId) => {
      try {
        const axiosConfig = {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const res = await axios.get(
          `/api/superadmin/students/classrooms/${classroomId}`,
          axiosConfig
        );
        console.log("Data siswa response:", res.data);
        setDataSiswa(res.data.data || []);

        // Update kelas info if available from response
        if (res.data.classroom) {
          setKelasInfo((prev) => ({
            ...prev,
            nama: res.data.classroom.namaKelas,
            waliKelas: res.data.classroom.waliKelas?.user?.name,
          }));
        }
      } catch (err) {
        console.error("Gagal mengambil data siswa:", err);
        console.error("Error details:", err.response?.data);
        setDataSiswa([]);
      }
    },
    [token]
  );

  // fetch angkatan list
  const fetchAngkatan = useCallback(async () => {
    try {
      setAngkatanLoading(true);
      const axiosConfig = {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      const res = await axios.get(
        `/api/superadmin/masterdata/angkatan`,
        axiosConfig
      );
      console.log("Data angkatan response:", res.data);
      setAngkatanList(res.data.data || res.data || []);
    } catch (err) {
      console.error("Gagal mengambil data angkatan:", err);
      setAngkatanList([]);
    } finally {
      setAngkatanLoading(false);
    }
  }, [token]);

  // Set kelas info and fetch siswa
  useEffect(() => {
    const currentKelasId = kelasId || selectedClass;
    const currentKelasName = selectedClassName;

    if (currentKelasId) {
      setKelasInfo({
        id: currentKelasId,
        nama: currentKelasName || `Kelas ${currentKelasId}`,
        data: kelasData,
      });
      fetchSiswaByKelas(currentKelasId);
    } else {
      // Redirect to class selection if no class info
      navigate("/superadmin/pilih-kelas");
    }
  }, [kelasId, selectedClass, selectedClassName, kelasData, fetchSiswaByKelas]);

  // fetch angkatan on component mount
  useEffect(() => {
    fetchAngkatan();
  }, [fetchAngkatan]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCloseModal = () => {
    setFormVisible(false);
    setErrorMsg("");
    setEditingId(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      handleCloseModal();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const payload = {
      nisn: form.nisn,
      name: form.name,
      gender: form.gender,
      tempatLahir: form.tempatLahir,
      tglLahir: form.tglLahir,
      alamat: form.alamat,
      noHp: form.noHp,
      // classroomId tidak perlu dikirim karena sudah ada di URL params
      angkatanId: form.angkatanId ? parseInt(form.angkatanId) : 1,
      orangTuaId: form.orangTuaId ? parseInt(form.orangTuaId) : null,
    };

    console.log("Payload being sent:", payload);

    try {
      const axiosConfig = {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      if (editingId) {
        await axios.put(
          `/api/users/students/${editingId}`,
          payload,
          axiosConfig
        );
        Swal.fire("Berhasil!", "Data siswa berhasil diupdate!", "success");
      } else {
        // Update endpoint untuk create student dengan classroomId di URL
        await axios.post(
          `/api/superadmin/students/classrooms/${kelasInfo.id}/students`,
          payload,
          axiosConfig
        );
        Swal.fire("Berhasil!", "Data siswa berhasil ditambahkan!", "success");
      }
      setForm({
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
      setEditingId(null);
      handleCloseModal();
      fetchSiswaByKelas(kelasInfo.id);
    } catch (err) {
      if (err.response?.data?.error) {
        setErrorMsg(err.response.data.error);
      } else {
        setErrorMsg("Gagal menyimpan data siswa.");
      }
      Swal.fire("Gagal!", "Terjadi kesalahan saat menyimpan data.", "error");
      console.error("Gagal menyimpan:", err);
      console.error("Error response:", err.response?.data);
    }
  };

  // filtered siswa
  const filteredSiswa = dataSiswa.filter((siswa) => {
    const q = search.toLowerCase();
    const name = siswa.nama || siswa.name || "";
    return (
      siswa.nisn?.toString().toLowerCase().includes(q) ||
      name.toLowerCase().includes(q) ||
      siswa.email?.toLowerCase().includes(q)
    );
  });

  const handleKembali = () => {
    navigate("/superadmin/pilih-kelas");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-3 sm:p-4">
      <div className="max-w-6xl mx-auto space-y-3">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-3 sm:p-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 mb-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white shadow">
                  <FiUsers className="text-lg" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Data Siswa Kelas {kelasInfo.nama}
                  </h1>
                  <p className="text-gray-600 text-xs mt-0.5">
                    Kelola dan pantau data siswa dalam kelas
                  </p>
                </div>
              </div>
              {kelasInfo.waliKelas && (
                <div className="flex items-center gap-2 text-xs text-gray-600 bg-gray-50 px-2 py-1 rounded-lg">
                  <FiUser className="text-blue-600 text-xs" />
                  <span>
                    Wali Kelas:{" "}
                    <span className="font-semibold">{kelasInfo.waliKelas}</span>
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => {
                  setForm({
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
                  setEditingId(null);
                  setFormVisible(true);
                }}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm"
              >
                <FiPlus className="text-sm" />
                <span>Tambah Siswa</span>
              </button>
              <button
                onClick={handleKembali}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-4 py-2 rounded-lg font-semibold shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm"
              >
                <FiArrowLeft className="text-sm" />
                <span>Kembali</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="h-4 w-4 text-blue-500" />
            </div>
            <input
              type="text"
              placeholder="Cari NISN, nama, atau email siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent shadow-sm transition-all duration-200 text-sm"
            />
          </div>
        </div>

        {/* Modern Modal */}
        {formVisible && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={handleBackdropClick}
          >
            <div className="bg-white rounded-xl w-full max-w-4xl mx-auto shadow-xl border border-gray-200 overflow-hidden max-h-[90vh] overflow-y-auto">
              {/* Header dengan tema biru */}
              <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200 sticky top-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600">
                      <FiUser className="text-white text-lg" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-blue-800">
                        {editingId ? "Edit Data Siswa" : "Tambah Siswa Baru"}
                      </h3>
                      <p className="text-sm text-blue-600">
                        {editingId
                          ? "Perbarui informasi siswa"
                          : "Lengkapi data siswa untuk ditambahkan ke kelas"}
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
              <div className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        NISN <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nisn"
                        placeholder="Masukkan NISN"
                        value={form.nisn}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Siswa <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Masukkan nama siswa"
                        value={form.name}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Jenis Kelamin <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                      >
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tempat Lahir <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="tempatLahir"
                        placeholder="Masukkan tempat lahir"
                        value={form.tempatLahir}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Tanggal Lahir <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="tglLahir"
                        value={form.tglLahir}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Alamat <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="alamat"
                        placeholder="Masukkan alamat"
                        value={form.alamat}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        No. HP <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="noHp"
                        placeholder="Masukkan nomor HP"
                        value={form.noHp}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Angkatan <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="angkatanId"
                        value={form.angkatanId}
                        onChange={handleChange}
                        required
                        disabled={angkatanLoading}
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                      >
                        <option value="">
                          {angkatanLoading
                            ? "Memuat data angkatan..."
                            : "Pilih Angkatan"}
                        </option>
                        {!angkatanLoading && angkatanList.length > 0 ? (
                          angkatanList.map((angkatan) => (
                            <option key={angkatan.id} value={angkatan.id}>
                              {angkatan.tahun ||
                                angkatan.year ||
                                angkatan.nama ||
                                angkatan.name}
                            </option>
                          ))
                        ) : !angkatanLoading && angkatanList.length === 0 ? (
                          <option value="" disabled>
                            Tidak ada data angkatan
                          </option>
                        ) : null}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        ID Orang Tua (Opsional)
                      </label>
                      <input
                        type="number"
                        name="orangTuaId"
                        placeholder="Masukkan ID orang tua"
                        value={form.orangTuaId}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all duration-200 text-sm"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex gap-3 pt-4">
                    <button
                      type="submit"
                      className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    >
                      {editingId ? "Update Data" : "Tambah Siswa"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 bg-gradient-to-r from-slate-500 to-slate-600 hover:from-slate-600 hover:to-slate-700 text-white px-6 py-3 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                    >
                      Batal
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Statistik Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="bg-blue-800 text-white p-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FiUsers className="text-xl" />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Total Siswa</p>
                <p className="text-2xl font-bold">{filteredSiswa.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-xl shadow-lg">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FiUser className="text-xl" />
              </div>
              <div>
                <p className="text-blue-100 text-sm">Kelas</p>
                <p className="text-xl font-bold">{kelasInfo.nama || "N/A"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Siswa */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-0">
            {filteredSiswa.length > 0 ? (
              <div className="overflow-hidden">
                <table className="w-full table-fixed">
                  <thead>
                    <tr
                      className="text-gray-700"
                      style={{ backgroundColor: "oklch(96.7% 0.003 264.542)" }}
                    >
                      <th className="w-20 px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide">
                        NISN
                      </th>
                      <th className="w-28 px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide">
                        NAMA
                      </th>
                      <th className="w-48 px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide hidden md:table-cell">
                        EMAIL
                      </th>
                      <th className="w-32 px-3 py-2.5 text-left font-semibold text-xs uppercase tracking-wide">
                        NO. HP
                      </th>
                      <th className="w-20 px-3 py-2.5 text-center font-semibold text-xs uppercase tracking-wide">
                        ANGKATAN
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredSiswa.map((siswa) => (
                      <tr
                        key={siswa.id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            {siswa.nisn || "-"}
                          </div>
                        </td>
                        <td
                          className="px-3 py-2.5 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                          onClick={() => {
                            navigate(`/superadmin/detail-siswa/${siswa.id}`, {
                              state: {
                                siswa,
                                kelasDipilih: kelasInfo.id,
                                namaKelasDipilih: kelasInfo.nama,
                              },
                            });
                          }}
                        >
                          <div className="text-sm font-medium text-gray-900 hover:text-blue-600 truncate">
                            {siswa.nama || siswa.name || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap hidden md:table-cell">
                          <div
                            className="text-sm text-gray-600 truncate"
                            title={siswa.email}
                          >
                            {siswa.email || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">
                            {siswa.noHp || "-"}
                          </div>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-center">
                          <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                            {siswa.angkatan?.tahun || "-"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="flex flex-col items-center">
                  <FiUsers className="text-3xl text-gray-300 mb-3" />
                  <h3 className="text-base font-semibold text-gray-600 mb-1">
                    Belum Ada Data Siswa
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Belum ada siswa terdaftar di kelas ini
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DaftarSiswa;
