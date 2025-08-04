import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import {
  FiHome,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiUsers,
} from "react-icons/fi";

const KelolaKelas = () => {
  const [dataKelas, setDataKelas] = useState([]);
  const [filteredKelas, setFilteredKelas] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({ 
    kodeKelas: "", 
    namaKelas: "", 
    waliKelasId: "" 
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [guruList, setGuruList] = useState([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchKelas = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/classrooms", axiosConfig);
      console.log("Data kelas:", res.data);
      setDataKelas(res.data);
      setFilteredKelas(res.data);
    } catch (err) {
      console.error("Gagal mengambil data kelas:", err);
      Swal.fire("Error!", "Gagal mengambil data kelas", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchGuru = async () => {
    try {
      const res = await axios.get("/api/users/teachers", axiosConfig);
      setGuruList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data guru:", err);
    }
  };

  useEffect(() => {
    fetchKelas();
    fetchGuru();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      kodeKelas: form.kodeKelas,
      namaKelas: form.namaKelas,
      waliKelasId: form.waliKelasId ? parseInt(form.waliKelasId) : null,
    };

    console.log("Payload:", payload);

    try {
      if (editingId) {
        await axios.put(`/api/classrooms/${editingId}`, payload, axiosConfig);
        Swal.fire("Berhasil!", "Data kelas berhasil diperbarui.", "success");
      } else {
        await axios.post("/api/classrooms", payload, axiosConfig);
        Swal.fire("Berhasil!", "Kelas baru berhasil ditambahkan.", "success");
      }
      
      setForm({ kodeKelas: "", namaKelas: "", waliKelasId: "" });
      setEditingId(null);
      setFormVisible(false);
      fetchKelas();
    } catch (err) {
      console.error("Error:", err.response || err);
      let errorMessage = "Terjadi kesalahan saat menyimpan data kelas.";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      Swal.fire("Gagal", errorMessage, "error");
    }
  };

  const handleEdit = (kelas) => {
    console.log("Editing kelas:", kelas);
    setForm({ 
      kodeKelas: kelas.kodeKelas || "", 
      namaKelas: kelas.namaKelas || "", 
      waliKelasId: kelas.waliKelas?.id || "" 
    });
    setEditingId(kelas.id);
    setFormVisible(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data kelas tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/classrooms/${id}`, axiosConfig);
          Swal.fire("Terhapus!", "Data kelas telah dihapus.", "success");
          fetchKelas();
        } catch (err) {
          console.error("Error:", err.response || err);
          Swal.fire("Gagal", "Gagal menghapus data kelas.", "error");
        }
      }
    });
  };

  const handleDetail = (kelas) => {
    Swal.fire({
      title: `<strong>Detail Kelas</strong>`,
      html: `
        <p><b>Kode Kelas:</b> ${kelas.kodeKelas}</p>
        <p><b>Nama Kelas:</b> ${kelas.namaKelas}</p>
        <p><b>Wali Kelas:</b> ${kelas.waliKelas?.user?.name || "Belum ditentukan"}</p>
        <p><b>Jumlah Siswa:</b> ${kelas.jmlSiswa || 0} siswa</p>
        <p><b>NIP Wali Kelas:</b> ${kelas.waliKelas?.nip || "-"}</p>
      `,
      icon: "info",
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = dataKelas.filter((kelas) =>
      kelas.namaKelas.toLowerCase().includes(value) ||
      kelas.kodeKelas.toLowerCase().includes(value) ||
      (kelas.waliKelas?.user?.name || "").toLowerCase().includes(value)
    );
    setFilteredKelas(filtered);
  };

  const viewStudents = (kelasId, namaKelas) => {
    Swal.fire({
      title: `Siswa di Kelas ${namaKelas}`,
      text: "Fitur ini akan menampilkan daftar siswa di kelas tersebut",
      icon: "info",
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
          <FiHome /> Kelola Kelas
        </h2>
        <button
          onClick={() => {
            setForm({ kodeKelas: "", namaKelas: "", waliKelasId: "" });
            setEditingId(null);
            setFormVisible(true);
          }}
          className="bg-[#003366] text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FiPlus /> Tambah Kelas
        </button>
      </div>

      <div className="flex mb-4 gap-4">
        <div className="flex items-center border rounded px-3 py-2 w-full md:w-1/2">
          <FiSearch className="mr-2" />
          <input
            type="text"
            placeholder="Cari kelas berdasarkan nama, kode, atau wali kelas..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full outline-none"
          />
        </div>
        <button
          onClick={async () => {
            await fetchKelas();
            setSearchTerm("");
          }}
          className="bg-gray-200 px-3 py-2 rounded text-sm flex items-center gap-1"
        >
          <FiRefreshCw /> Reset
        </button>
      </div>

      {formVisible && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end"
          >
            <input
              type="text"
              name="kodeKelas"
              placeholder="Kode Kelas (XII-RPL-1)"
              value={form.kodeKelas}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
            <input
              type="text"
              name="namaKelas"
              placeholder="Nama Kelas (XII RPL 1)"
              value={form.namaKelas}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
            <select
              name="waliKelasId"
              value={form.waliKelasId}
              onChange={handleChange}
              className="border p-2 rounded"
            >
              <option value="">Pilih Wali Kelas</option>
              {guruList.map((guru) => (
                <option key={guru.id} value={guru.id}>
                  {guru.user.name} - {guru.nip}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="bg-[#003366] text-white px-4 py-2 rounded h-fit"
            >
              {editingId ? "Update" : "Tambah"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-2 text-gray-500">Memuat data...</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border border-gray-300 shadow rounded">
            <thead className="bg-[#f1f5f9] text-[#003366]">
              <tr>
                <th className="border px-4 py-2 text-left">Kode Kelas</th>
                <th className="border px-4 py-2 text-left">Nama Kelas</th>
                <th className="border px-4 py-2 text-left">Wali Kelas</th>
                <th className="border px-4 py-2 text-center">Jumlah Siswa</th>
                <th className="border px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredKelas.length > 0 ? (
                filteredKelas.map((kelas) => (
                  <tr key={kelas.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">{kelas.kodeKelas}</td>
                    <td 
                      className="border px-4 py-2 cursor-pointer hover:text-[#003366]"
                      onClick={() => handleDetail(kelas)}
                    >
                      {kelas.namaKelas}
                    </td>
                    <td className="border px-4 py-2">
                      {kelas.waliKelas?.user?.name || "Belum ditentukan"}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => viewStudents(kelas.id, kelas.namaKelas)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto"
                      >
                        <FiUsers /> {kelas.jmlSiswa || 0}
                      </button>
                    </td>
                    <td className="border px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(kelas)}
                        title="Edit"
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(kelas.id)}
                        title="Delete"
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    Tidak ada data kelas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default KelolaKelas;
