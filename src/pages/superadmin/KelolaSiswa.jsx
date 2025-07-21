import { useEffect, useState } from "react";
import axios from "axios";

const KelolaSiswa = () => {
  const [kelasDipilih, setKelasDipilih] = useState("");
  const [dataSiswa, setDataSiswa] = useState([]);
  const [form, setForm] = useState({ nama: "", nis: "", kelas: "" });
  const [editingId, setEditingId] = useState(null);
  const kelasList = ["X", "XI", "XII"];

  useEffect(() => {
    if (kelasDipilih) fetchSiswaByKelas(kelasDipilih);
  }, [kelasDipilih]);

  const fetchSiswaByKelas = async (kelas) => {
    try {
      const res = await axios.get(
        `https://smk14-production.up.railway.app/api/siswa?kelas=${kelas}`
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
      } else {
        await axios.post(
          "https://smk14-production.up.railway.app/api/siswa",
          payload
        );
      }
      setForm({ nama: "", nis: "" });
      setEditingId(null);
      fetchSiswaByKelas(kelasDipilih);
    } catch (err) {
      console.error("Gagal menyimpan:", err);
    }
  };

  const handleEdit = (siswa) => {
    setForm({ nama: siswa.nama, nis: siswa.nis });
    setEditingId(siswa.id);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(
        `https://smk14-production.up.railway.app/api/siswa/${id}`
      );
      fetchSiswaByKelas(kelasDipilih);
    } catch (err) {
      console.error("Gagal menghapus siswa:", err);
    }
  };

  return (
    <div className="p-8 w-full">
      {!kelasDipilih ? (
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-[#003366]">Pilih Kelas</h2>
          <div className="flex justify-center gap-6">
            {kelasList.map((kelas) => (
              <button
                key={kelas}
                onClick={() => setKelasDipilih(kelas)}
                className="bg-[#003366] hover:bg-[#002244] text-white px-6 py-3 rounded-lg font-semibold"
              >
                Kelas {kelas}
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
            <button
              onClick={() => {
                setKelasDipilih("");
                setForm({ nama: "", nis: "" });
                setEditingId(null);
              }}
              className="text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
            >
              🔙 Kembali ke Pilih Kelas
            </button>
          </div>

          {/* Form */}
          <div className="bg-white rounded-xl shadow p-6 w-full md:max-w-xl">
            <form
              onSubmit={handleSubmit}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-6"
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
                type="text"
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

          {/* Tabel */}
          <div className="overflow-x-auto">
            <table className="w-full table-auto border border-gray-300 shadow rounded">
              <thead className="bg-[#f1f5f9] text-[#003366]">
                <tr>
                  <th className="border px-4 py-2">Nama</th>
                  <th className="border px-4 py-2">NIS</th>
                  <th className="border px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dataSiswa.length > 0 ? (
                  dataSiswa.map((siswa) => (
                    <tr key={siswa.id} className="hover:bg-gray-100">
                      <td className="border px-4 py-2">{siswa.nama}</td>
                      <td className="border px-4 py-2">{siswa.nis}</td>
                      <td className="border px-4 py-2 space-x-2 text-center">
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
