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
      setFormVisible(false);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl text-white">
                  <FiUsers className="text-xl" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">
                    Data Siswa Kelas {kelasInfo.nama}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Kelola dan pantau data siswa dalam kelas
                  </p>
                </div>
              </div>
              {kelasInfo.waliKelas && (
                <div className="flex items-center space-x-2 text-sm text-gray-600 bg-gray-50 px-4 py-2 rounded-lg">
                  <FiUser className="text-blue-500" />
                  <span>
                    Wali Kelas:{" "}
                    <span className="font-semibold">{kelasInfo.waliKelas}</span>
                  </span>
                </div>
              )}
            </div>

            <div className="flex space-x-3">
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
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <FiPlus className="text-lg" />
                <span>Tambah Siswa</span>
              </button>
              <button
                onClick={handleKembali}
                className="flex items-center space-x-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <FiArrowLeft className="text-lg" />
                <span>Kembali</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FiSearch className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Cari NISN, nama, atau email siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
            />
          </div>
        </div>

        {/* Form Tambah/Edit */}
        {formVisible && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
            <div className="mb-6">
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {editingId ? "Edit Data Siswa" : "Tambah Siswa Baru"}
              </h3>
              <p className="text-gray-600">
                {editingId
                  ? "Perbarui informasi siswa"
                  : "Masukkan data siswa baru"}
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  NISN
                </label>
                <input
                  type="text"
                  name="nisn"
                  placeholder="Masukkan NISN"
                  value={form.nisn}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Nama Siswa
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Masukkan nama siswa"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Jenis Kelamin
                </label>
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  name="tempatLahir"
                  placeholder="Masukkan tempat lahir"
                  value={form.tempatLahir}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  name="tglLahir"
                  value={form.tglLahir}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Alamat
                </label>
                <input
                  type="text"
                  name="alamat"
                  placeholder="Masukkan alamat"
                  value={form.alamat}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  No. HP
                </label>
                <input
                  type="text"
                  name="noHp"
                  placeholder="Masukkan nomor HP"
                  value={form.noHp}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Angkatan
                </label>
                <select
                  name="angkatanId"
                  value={form.angkatanId}
                  onChange={handleChange}
                  required
                  disabled={angkatanLoading}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
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

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  ID Orang Tua (Opsional)
                </label>
                <input
                  type="number"
                  name="orangTuaId"
                  placeholder="Masukkan ID orang tua"
                  value={form.orangTuaId}
                  onChange={handleChange}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="col-span-1 md:col-span-2 lg:col-span-3 flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  {editingId ? "Update Data" : "Tambah Siswa"}
                </button>
                <button
                  type="button"
                  onClick={() => setFormVisible(false)}
                  className="px-6 py-3 border border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200"
                >
                  Batal
                </button>
              </div>
            </form>

            {errorMsg && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 font-semibold text-sm">{errorMsg}</p>
              </div>
            )}
          </div>
        )}

        {/* Data Siswa */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-800">
                  Daftar Siswa
                </h3>
                <p className="text-gray-600 mt-1">
                  Total:{" "}
                  <span className="font-semibold text-blue-600">
                    {filteredSiswa.length}
                  </span>{" "}
                  siswa
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            {filteredSiswa.length > 0 ? (
              <table className="w-full">
                <thead className="bg-gradient-to-r from-[#003366] to-blue-600 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">NISN</th>
                    <th className="px-6 py-4 text-left font-semibold">Nama</th>
                    <th className="px-6 py-4 text-left font-semibold">Email</th>
                    <th className="px-6 py-4 text-left font-semibold">
                      No. HP
                    </th>
                    <th className="px-6 py-4 text-left font-semibold">
                      Angkatan
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredSiswa.map((siswa) => (
                    <tr
                      key={siswa.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {siswa.nisn || "-"}
                      </td>
                      <td
                        className="px-6 py-4 text-gray-800 cursor-pointer hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
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
                        {siswa.nama || siswa.name || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {siswa.email || "-"}
                      </td>
                      <td className="px-6 py-4 text-gray-600 font-mono">
                        {siswa.noHp || "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                          {siswa.angkatan?.tahun || "-"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <div className="flex flex-col items-center">
                  <FiUsers className="text-4xl text-gray-300 mb-2" />
                  <h3 className="text-lg font-semibold text-gray-600">
                    Belum Ada Data Siswa
                  </h3>
                  <p className="text-gray-500 mt-1">
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
