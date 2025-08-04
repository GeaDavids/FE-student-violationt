import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import { Link } from "react-router-dom";
import axios from "axios";
import { FiBookOpen } from "react-icons/fi";

const KelolaSiswa = () => {
  const [kelasDipilih, setKelasDipilih] = useState("");
  const [namaKelasDipilih, setNamaKelasDipilih] = useState("");
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
  const [kelasList, setKelasList] = useState([]);
  const [angkatanList, setAngkatanList] = useState([]);
  const [search, setSearch] = useState("");

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

  const token = localStorage.getItem("token");

  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // fetch kelas & angkatan
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await axios.get(`/api/classrooms`, axiosConfig);
        setKelasList(res.data);
      } catch (err) {
        console.error("Gagal mengambil data kelas:", err);
      }
    };
    const fetchAngkatan = async () => {
      try {
        const res = await axios.get(`/api/angkatan`, axiosConfig);
        console.log("Data angkatan:", res.data);
        setAngkatanList(res.data);
      } catch (err) {
        console.error("Gagal mengambil data angkatan:", err);
        console.error("Status:", err.response?.status);
        // Fallback data angkatan jika API gagal atau tidak ada akses
        setAngkatanList([
          { id: 1, tahun: "2024" },
          { id: 2, tahun: "2023" },
          { id: 3, tahun: "2022" },
        ]);
      }
    };
    fetchKelas();
    fetchAngkatan();
  }, []);

  // fetch siswa by class
  const fetchSiswaByKelas = useCallback(
    async (classroomId) => {
      try {
        const res = await axios.get(
          `/api/users/students?classroomId=${classroomId}`,
          axiosConfig
        );
        console.log("Data siswa response:", res.data);
        setDataSiswa(res.data);
      } catch (err) {
        console.error("Gagal mengambil data siswa:", err);
        console.error("Error details:", err.response?.data);
      }
    },
    [axiosConfig]
  );

  // when class changes
  useEffect(() => {
    setSearch("");
    if (kelasDipilih) fetchSiswaByKelas(kelasDipilih);
  }, [kelasDipilih, fetchSiswaByKelas]);

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
      classroomId: parseInt(kelasDipilih),
      angkatanId: form.angkatanId ? parseInt(form.angkatanId) : 1,
      orangTuaId: form.orangTuaId ? parseInt(form.orangTuaId) : null,
    };

    console.log("Payload being sent:", payload);

    try {
      if (editingId) {
        await axios.put(
          `/api/users/students/${editingId}`,
          payload,
          axiosConfig
        );
        Swal.fire("Berhasil!", "Data siswa berhasil diupdate!", "success");
      } else {
        await axios.post(
          `/api/users/students`,
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
      fetchSiswaByKelas(kelasDipilih);
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

  const handleEdit = (siswa) => {
    setErrorMsg("");
    console.log("Editing siswa:", siswa);
    console.log("Original tglLahir:", siswa.tglLahir);
    
    const formattedDate = formatDateForInput(siswa.tglLahir);
    console.log("Formatted tglLahir:", formattedDate);
    
    setForm({
      nisn: siswa.nisn || "",
      name: siswa.name || siswa.user?.name || "",
      gender: siswa.gender || "L",
      tempatLahir: siswa.tempatLahir || "",
      tglLahir: formattedDate,
      alamat: siswa.alamat || "",
      noHp: siswa.noHp || "",
      angkatanId:
        siswa.angkatanId ||
        (siswa.angkatan ? siswa.angkatan.id : "") ||
        "",
      orangTuaId: siswa.orangTuaId || "",
    });
    setEditingId(siswa.id);
    setFormVisible(true);
    Swal.fire(
      "Info",
      "Silakan edit data siswa, lalu klik Update untuk menyimpan perubahan.",
      "info"
    );
  };

  const handleDelete = async (id) => {
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
          fetchSiswaByKelas(kelasDipilih);
        } catch (err) {
          Swal.fire("Gagal!", "Gagal menghapus siswa!", "error");
          console.error("Gagal menghapus siswa:", err);
        }
      }
    });
  };

  // filtered once
  const filteredSiswa = dataSiswa.filter((siswa) => {
    const q = search.toLowerCase();
    const name = siswa.name || siswa.user?.name || "";
    return (
      siswa.nisn?.toString().toLowerCase().includes(q) ||
      name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 w-full">
      {!kelasDipilih ? (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-3xl font-bold text-[#003366]">Pilih Kelas</h2>
            <Link
              to="/import-siswa"
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg shadow transition duration-200"
            >
              📥 Import Semua Data
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {kelasList.map((kelas) => (
              <button
                key={kelas.id}
                onClick={() => {
                  setKelasDipilih(kelas.id);
                  setNamaKelasDipilih(kelas.name);
                }}
                className="bg-white text-[#003366] shadow-md rounded-xl p-6 font-semibold flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <div className="text-4xl mb-2 flex items-center gap-2 text-[#003366]">
                  <FiBookOpen />
                </div>
                <div className="text-lg">{kelas.name}</div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#003366]">
              Data Siswa Kelas {namaKelasDipilih}
            </h2>
            <div className="space-x-3 flex flex-wrap gap-2">
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
                className="bg-[#003366] hover:bg-[#002244] text-white px-4 py-2 rounded"
              >
                ➕ Tambah Siswa
              </button>
              <button
                onClick={() => {
                  Swal.fire({
                    title: "Kembali ke Pilih Kelas?",
                    text: "Form yang sedang diisi akan hilang",
                    icon: "question",
                    showCancelButton: true,
                    confirmButtonText: "Ya, kembali",
                  }).then((result) => {
                    if (result.isConfirmed) {
                      setKelasDipilih("");
                      setNamaKelasDipilih("");
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
                    }
                  });
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded shadow-sm"
              >
                🔙 Kembali
              </button>
            </div>
          </div>

          {formVisible && (
            <div className="bg-white rounded-xl shadow p-6 w-full">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                <input
                  type="text"
                  name="nisn"
                  placeholder="NISN"
                  value={form.nisn}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  name="name"
                  placeholder="Nama Siswa"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <select
                  name="gender"
                  value={form.gender}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                >
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
                <input
                  type="text"
                  name="tempatLahir"
                  placeholder="Tempat Lahir"
                  value={form.tempatLahir}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <input
                  type="date"
                  name="tglLahir"
                  placeholder="Tanggal Lahir"
                  value={form.tglLahir}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  name="alamat"
                  placeholder="Alamat"
                  value={form.alamat}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <input
                  type="text"
                  name="noHp"
                  placeholder="No. HP"
                  value={form.noHp}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <select
                  name="angkatanId"
                  value={form.angkatanId}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                >
                  <option value="">Pilih Angkatan</option>
                  {angkatanList.length > 0 ? (
                    angkatanList.map((angkatan) => (
                      <option key={angkatan.id} value={angkatan.id}>
                        {angkatan.tahun || angkatan.year || angkatan.name}
                      </option>
                    ))
                  ) : (
                    <option value="">Loading angkatan...</option>
                  )}
                </select>
                <input
                  type="number"
                  name="orangTuaId"
                  placeholder="ID Orang Tua (Optional)"
                  value={form.orangTuaId}
                  onChange={handleChange}
                  className="border p-2 rounded"
                />
                <button
                  type="submit"
                  className="bg-[#003366] text-white px-4 py-2 rounded h-fit col-span-1 md:col-span-2 lg:col-span-3"
                >
                  {editingId ? "Update" : "Tambah"}
                </button>
              </form>
              {errorMsg && (
                <div className="mt-4 text-red-600 font-semibold text-sm text-center">
                  {errorMsg}
                </div>
              )}
            </div>
          )}

          {/* Search input */}
          <div className="mb-4 flex justify-start">
            <input
              type="text"
              placeholder="Cari nama atau NISN siswa..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded px-3 py-2 w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-300 shadow rounded">
              <thead className="bg-[#f1f5f9] text-[#003366]">
                <tr>
                  <th className="border px-4 py-2 text-left">NISN</th>
                  <th className="border px-4 py-2 text-left">Nama</th>
                  <th className="border px-4 py-2 text-left">Gender</th>
                  <th className="border px-4 py-2 text-left">Angkatan</th>
                  <th className="border px-4 py-2 text-left">No. HP</th>
                  <th className="border px-4 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredSiswa.length > 0 ? (
                  filteredSiswa.map((siswa) => (
                    <tr key={siswa.id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{siswa.nisn}</td>
                      <td
                        className="border px-4 py-2 cursor-pointer hover:text-[#003366]"
                        onClick={() => {
                          Swal.fire({
                            title: `<strong>Detail Siswa</strong>`,
                            html: `
                              <p><b>NISN:</b> ${siswa.nisn}</p>
                              <p><b>Nama:</b> ${siswa.name || siswa.user?.name}</p>
                              <p><b>Gender:</b> ${
                                siswa.gender === "L"
                                  ? "Laki-laki"
                                  : "Perempuan"
                              }</p>
                              <p><b>Tempat Lahir:</b> ${
                                siswa.tempatLahir || "-"
                              }</p>
                              <p><b>Tanggal Lahir:</b> ${formatDateForDisplay(siswa.tglLahir)}</p>
                              <p><b>Alamat:</b> ${siswa.alamat || "-"}</p>
                              <p><b>No. HP:</b> ${siswa.noHp || "-"}</p>
                              <p><b>Angkatan:</b> ${
                                (siswa.angkatan?.tahun ||
                                  siswa.angkatan?.year ||
                                  siswa.angkatan?.name ||
                                  siswa.angkatanId) || "-"
                              }</p>
                              <p><b>Kelas:</b> ${siswa.classroom?.namaKelas || "-"}</p>
                            `,
                            icon: "info",
                          });
                        }}
                      >
                        {siswa.name || siswa.user?.name || "-"}
                      </td>
                      <td className="border px-4 py-2">
                        {siswa.gender === "L" ? "Laki-laki" : "Perempuan"}
                      </td>
                      <td className="border px-4 py-2">
                        {siswa.angkatan?.tahun ||
                          siswa.angkatan?.year ||
                          siswa.angkatan?.name ||
                          (siswa.angkatanId ? siswa.angkatanId : "-")}
                      </td>
                      <td className="border px-4 py-2">{siswa.noHp || "-"}</td>
                      <td className="border px-4 py-2 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(siswa)}
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(siswa.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-4 text-gray-500"
                    >
                      Tidak ada data siswa di kelas ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default KelolaSiswa;
