import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import * as XLSX from "xlsx";

const KelolaSiswa = () => {
  const [kelasDipilih, setKelasDipilih] = useState("");
  const [dataSiswa, setDataSiswa] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({ nama: "", nis: "", kelas: "" });
  const [editingId, setEditingId] = useState(null);
  const [classList, setclassList] = useState ([]);


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
        const res = await axios.get(/api/classrooms, axiosConfig);
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

  const fetchSiswaByKelas = async (kelas) => {
    try {
      const res = await axios.get(
        `https://smk14-production.up.railway.app/api/users/students?classroomId=${kelas}`
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
    try {
      const payload = { ...form, kelas: kelasDipilih };
      if (editingId) {
        await axios.put(
          `https://smk14-production.up.railway.app/api/siswa/${editingId}`,
          payload
        );
        alert("Data berhasil diperbarui!");
      } else {
        await axios.post(
          "https://smk14-production.up.railway.app/api/siswa",
          payload
        );
        alert("Data berhasil ditambahkan!");
      }
      setForm({ nama: "", nis: "", kelas: "" });
      setEditingId(null);
      setFormVisible(false);
      fetchSiswaByKelas(kelasDipilih);
    } catch (err) {
      console.error("Gagal menyimpan:", err);
    }
  };

  const handleEdit = (siswa) => {
    setForm({ nama: siswa.nama, nis: siswa.nis, kelas: siswa.kelas });
    setEditingId(siswa.id);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    const konfirmasi = confirm("Apakah kamu yakin ingin menghapus siswa ini?");
    if (!konfirmasi) return;

    try {
      await axios.delete(
        `https://smk14-production.up.railway.app/api/siswa/${id}`
      );
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
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(sheet);

      const importPromises = json.map((row) =>
        axios.post("/api/students", {
          nama: row.nama,
          nis: row.nis,
          kelas: row.kelas,
        })
      );

      await Promise.all(importPromises);
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
                key={kelas}
                onClick={() => setKelasDipilih(kelas)}
                className="bg-white text-[#003366] shadow-md rounded-xl p-6 font-semibold flex flex-col items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                <div className="text-4xl mb-2">
                  {kelas === "X" && "🎓"}
                  {kelas === "XI" && "📚"}
                  {kelas === "XII" && "🧑‍🎓"}
                </div>
                <div className="text-lg">Kelas {kelas}</div>
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
                  setForm({ nama: "", nis: "", kelas: kelasDipilih });
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
                  name="nama"
                  placeholder="Nama Siswa"
                  value={form.nama}
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
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-300 shadow rounded">
              <thead className="bg-[#f1f5f9] text-[#003366]">
                <tr>
                  <th className="border px-4 py-2 text-left">Nama</th>
                  <th className="border px-4 py-2 text-left">NIS</th>
                  <th className="border px-4 py-2 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dataSiswa.length > 0 ? (
                  dataSiswa.map((siswa) => (
                    <tr key={siswa.id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{siswa.nama}</td>
                      <td className="border px-4 py-2">{siswa.nis}</td>
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
