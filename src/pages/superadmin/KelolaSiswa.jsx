import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";
import { FiBookOpen } from "react-icons/fi";

const KelolaSiswa = () => {
  const [kelasDipilih, setKelasDipilih] = useState("");
  const [dataSiswa, setDataSiswa] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({ name: "", nis: "" });
  const [errorMsg, setErrorMsg] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [kelasList, setKelasList] = useState([]);

  const token = localStorage.getItem("token");

  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // Fetch kelas dari API
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await axios.get(`/api/classrooms`, axiosConfig);
        setKelasList(res.data);
      } catch (err) {
        console.error("Gagal mengambil data kelas:", err);
      }
    };
    fetchKelas();
  }, []);

  useEffect(() => {
    if (kelasDipilih) fetchSiswaByKelas(kelasDipilih);
  }, [kelasDipilih]);

  const fetchSiswaByKelas = async (classroomId) => {
    try {
      const res = await axios.get(
        `/api/users/students?classroomId=${classroomId}`,
        axiosConfig
      );
      setDataSiswa(res.data);
    } catch (err) {
      console.error("Gagal mengambil data siswa:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    const kelasObj = kelasList.find((k) => k.id === kelasDipilih);
    const kelasName = kelasObj ? kelasObj.name : "";
    try {
      if (editingId) {
        await axios.put(
          `/api/users/students/${editingId}`,
          { ...form, classroomId: kelasDipilih, class: kelasName },
          axiosConfig
        );
        setForm({ name: "", nis: "" });
        setEditingId(null);
        fetchSiswaByKelas(kelasDipilih);
      } else {
        await axios.post(
          `/api/users/students`,
          { ...form, classroomId: kelasDipilih, class: kelasName },
          axiosConfig
        );
        setForm({ name: "", nis: "" });
        setEditingId(null);
        fetchSiswaByKelas(kelasDipilih);
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        setErrorMsg(err.response.data.error);
      } else {
        setErrorMsg("Gagal menyimpan data siswa.");
      }
      console.error("Gagal menyimpan:", err);
    }
  };

  const handleEdit = (siswa) => {
    setErrorMsg("");
    setForm({
      name: siswa.user?.name || "",
      nis: siswa.nis,
    });
    setEditingId(siswa.id);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    const konfirmasi = confirm("Apakah kamu yakin ingin menghapus siswa ini?");
    if (!konfirmasi) return;
    try {
      await axios.delete(`/api/users/students/${id}`, axiosConfig);
      alert("Siswa berhasil dihapus.");
      fetchSiswaByKelas(kelasDipilih);
    } catch (err) {
      console.error("Gagal menghapus siswa:", err);
    }
  };

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append("file", file);
      await axios.post("/api/users/students/import", formData, {
        ...axiosConfig,
        headers: {
          ...axiosConfig.headers,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Data berhasil diimpor!");
      if (kelasDipilih) fetchSiswaByKelas(kelasDipilih);
    } catch (err) {
      console.error("Gagal impor Excel:", err);
      alert("Format file tidak valid atau terjadi kesalahan saat impor.");
    }
  };

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
                onClick={() => setKelasDipilih(kelas.id)}
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
              Data Siswa Kelas {kelasDipilih}
            </h2>
            <div className="space-x-3">
              <button
                onClick={() => {
                  setForm({ name: "", nis: "" }); // gunakan key 'name' bukan 'nama'
                  setEditingId(null);
                  setFormVisible(true);
                }}
                className="bg-[#003366] hover:bg-[#002244] text-white px-4 py-2 rounded"
              >
                ➕ Tambah Siswa
              </button>
              <button
                onClick={() => {
                  setKelasDipilih("");
                  setForm({ nama: "", nis: "", kelas: "" });
                  setEditingId(null);
                  setFormVisible(false);
                }}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded shadow-sm"
              >
                🔙 Kembali
              </button>
            </div>
          </div>

          {formVisible && (
            <div className="bg-white rounded-xl shadow p-6 w-full md:max-w-xl">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
              >
                <input
                  type="text"
                  name="name"
                  placeholder="Nama Siswa"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <input
                  type="number"
                  name="nis"
                  placeholder="NIS"
                  value={form.nis}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded"
                />
                <button className="bg-[#003366] text-white px-4 py-2 rounded h-fit">
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

          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-300 shadow rounded">
              <thead className="bg-[#f1f5f9] text-[#003366]">
                <tr>
                  <th className="border px-4 py-2 text-left">NIS</th>
                  <th className="border px-4 py-2 text-left">Nama</th>
                  <th className="border px-4 py-2 text-left">Email</th>
                  <th className="border px-4 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dataSiswa.length > 0 ? (
                  dataSiswa.map((siswa) => (
                    <tr key={siswa.id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{siswa.nis}</td>
                      <td className="border px-4 py-2">{siswa.user?.name}</td>
                      <td className="border px-4 py-2">{siswa.user?.email}</td>
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
                    <td colSpan={3} className="text-center py-4 text-gray-500">
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
