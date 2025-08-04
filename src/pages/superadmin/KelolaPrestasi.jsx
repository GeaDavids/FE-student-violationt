import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import {
  FiAward,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiInfo,
} from "react-icons/fi";

// Kategori dan Tingkat Prestasi sesuai API
const kategoriList = [
  { value: "akademik", label: "Akademik" },
  { value: "non-akademik", label: "Non-Akademik" },
  { value: "lainnya", label: "Lainnya" },
];
const tingkatList = [
  { value: "sekolah", label: "Sekolah" },
  { value: "kecamatan", label: "Kecamatan" },
  { value: "kabupaten", label: "Kabupaten" },
  { value: "provinsi", label: "Provinsi" },
  { value: "nasional", label: "Nasional" },
  { value: "internasional", label: "Internasional" },
];

const KelolaPrestasi = () => {
  const [dataPrestasi, setDataPrestasi] = useState([]);
  const [filteredPrestasi, setFilteredPrestasi] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    kategori: "akademik",
    tingkat: "sekolah",
    tahun: new Date().getFullYear(),
    keterangan: "",
    isActive: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterTingkat, setFilterTingkat] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchPrestasi = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/achievements", axiosConfig);
      setDataPrestasi(res.data);
      setFilteredPrestasi(res.data);
    } catch (err) {
      Swal.fire("Error!", "Gagal mengambil data prestasi", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPrestasi(); }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      nama: form.nama,
      kategori: form.kategori,
      tingkat: form.tingkat,
      tahun: parseInt(form.tahun),
      keterangan: form.keterangan,
      isActive: form.isActive,
    };
    try {
      if (editingId) {
        await axios.put(`/api/achievements/${editingId}`, payload, axiosConfig);
        Swal.fire("Berhasil!", "Data prestasi berhasil diperbarui.", "success");
      } else {
        await axios.post("/api/achievements", payload, axiosConfig);
        Swal.fire("Berhasil!", "Prestasi baru berhasil ditambahkan.", "success");
      }
      setForm({ nama: "", kategori: "akademik", tingkat: "sekolah", tahun: new Date().getFullYear(), keterangan: "", isActive: true });
      setEditingId(null);
      setFormVisible(false);
      fetchPrestasi();
    } catch (err) {
      let errorMessage = "Terjadi kesalahan saat menyimpan data prestasi.";
      if (err.response?.data?.error) errorMessage = err.response.data.error;
      Swal.fire("Gagal", errorMessage, "error");
    }
  };

  const handleEdit = (prestasi) => {
    setForm({
      nama: prestasi.nama || "",
      kategori: prestasi.kategori || "akademik",
      tingkat: prestasi.tingkat || "sekolah",
      tahun: prestasi.tahun || new Date().getFullYear(),
      keterangan: prestasi.keterangan || "",
      isActive: prestasi.isActive !== undefined ? prestasi.isActive : true,
    });
    setEditingId(prestasi.id);
    setFormVisible(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data prestasi tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/achievements/${id}`, axiosConfig);
          Swal.fire("Terhapus!", "Data prestasi telah dihapus.", "success");
          fetchPrestasi();
        } catch (err) {
          Swal.fire("Gagal", "Gagal menghapus data prestasi.", "error");
        }
      }
    });
  };

  const handleDetail = (prestasi) => {
    const kategoriLabel = kategoriList.find(k => k.value === prestasi.kategori)?.label || prestasi.kategori;
    const tingkatLabel = tingkatList.find(t => t.value === prestasi.tingkat)?.label || prestasi.tingkat;
    Swal.fire({
      title: `<strong>Detail Prestasi</strong>`,
      html: `
        <div class="text-left">
          <p><b>Nama Prestasi:</b> ${prestasi.nama}</p>
          <p><b>Kategori:</b> ${kategoriLabel}</p>
          <p><b>Tingkat:</b> ${tingkatLabel}</p>
          <p><b>Tahun:</b> ${prestasi.tahun}</p>
          <p><b>Keterangan:</b></p>
          <p class="text-gray-600 italic">${prestasi.keterangan || "-"}</p>
          <p><b>Status:</b> ${prestasi.isActive ? "Aktif" : "Non-Aktif"}</p>
        </div>
      `,
      icon: "info",
      width: "500px"
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    applyFilters(value, filterKategori, filterTingkat);
  };
  const handleFilterKategori = (e) => {
    const value = e.target.value;
    setFilterKategori(value);
    applyFilters(searchTerm, value, filterTingkat);
  };
  const handleFilterTingkat = (e) => {
    const value = e.target.value;
    setFilterTingkat(value);
    applyFilters(searchTerm, filterKategori, value);
  };
  const applyFilters = (search, kategori, tingkat) => {
    let filtered = dataPrestasi.filter((prestasi) => {
      const matchSearch = prestasi.nama.toLowerCase().includes(search) ||
                         prestasi.kategori.toLowerCase().includes(search) ||
                         prestasi.tingkat.toLowerCase().includes(search) ||
                         (prestasi.keterangan || "").toLowerCase().includes(search);
      const matchKategori = !kategori || prestasi.kategori === kategori;
      const matchTingkat = !tingkat || prestasi.tingkat === tingkat;
      return matchSearch && matchKategori && matchTingkat;
    });
    setFilteredPrestasi(filtered);
  };
  const resetFilters = () => {
    setSearchTerm("");
    setFilterKategori("");
    setFilterTingkat("");
    setFilteredPrestasi(dataPrestasi);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
          <FiAward /> Kelola Prestasi
        </h2>
        <button
          onClick={() => {
            setForm({ nama: "", kategori: "akademik", tingkat: "sekolah", tahun: new Date().getFullYear(), keterangan: "", isActive: true });
            setEditingId(null);
            setFormVisible(true);
          }}
          className="bg-[#003366] text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FiPlus /> Tambah Prestasi
        </button>
      </div>
      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center border rounded px-3 py-2">
          <FiSearch className="mr-2" />
          <input
            type="text"
            placeholder="Cari prestasi..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full outline-none"
          />
        </div>
        <select
          value={filterKategori}
          onChange={handleFilterKategori}
          className="border rounded px-3 py-2"
        >
          <option value="">Semua Kategori</option>
          {kategoriList.map((kategori) => (
            <option key={kategori.value} value={kategori.value}>{kategori.label}</option>
          ))}
        </select>
        <select
          value={filterTingkat}
          onChange={handleFilterTingkat}
          className="border rounded px-3 py-2"
        >
          <option value="">Semua Tingkat</option>
          {tingkatList.map((tingkat) => (
            <option key={tingkat.value} value={tingkat.value}>{tingkat.label}</option>
          ))}
        </select>
        <button
          onClick={() => { fetchPrestasi(); resetFilters(); }}
          className="bg-gray-200 px-3 py-2 rounded text-sm flex items-center gap-1"
        >
          <FiRefreshCw /> Reset
        </button>
      </div>
      {formVisible && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <input
              type="text"
              name="nama"
              placeholder="Nama Prestasi"
              value={form.nama}
              onChange={handleChange}
              required
              className="border p-3 rounded"
            />
            <select
              name="kategori"
              value={form.kategori}
              onChange={handleChange}
              required
              className="border p-3 rounded"
            >
              {kategoriList.map((kategori) => (
                <option key={kategori.value} value={kategori.value}>{kategori.label}</option>
              ))}
            </select>
            <select
              name="tingkat"
              value={form.tingkat}
              onChange={handleChange}
              required
              className="border p-3 rounded"
            >
              {tingkatList.map((tingkat) => (
                <option key={tingkat.value} value={tingkat.value}>{tingkat.label}</option>
              ))}
            </select>
            <input
              type="number"
              name="tahun"
              placeholder="Tahun"
              value={form.tahun}
              onChange={handleChange}
              required
              min="2000"
              max={new Date().getFullYear()}
              className="border p-3 rounded"
            />
            <textarea
              name="keterangan"
              placeholder="Keterangan (opsional)"
              value={form.keterangan}
              onChange={handleChange}
              className="border p-3 rounded md:col-span-2"
              rows="3"
            />
            <div className="flex items-center gap-2 md:col-span-2">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4"
                id="isActiveCheckbox"
              />
              <label htmlFor="isActiveCheckbox" className="text-sm">Aktif</label>
            </div>
            <button
              type="submit"
              className="bg-[#003366] text-white px-4 py-3 rounded h-fit md:col-span-2"
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
                <th className="border px-4 py-2 text-left">Nama Prestasi</th>
                <th className="border px-4 py-2 text-left">Kategori</th>
                <th className="border px-4 py-2 text-center">Score</th>
                <th className="border px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrestasi.length > 0 ? (
                filteredPrestasi.map((prestasi) => (
                  <tr key={prestasi.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 cursor-pointer hover:text-[#003366]" onClick={() => handleDetail(prestasi)}>
                      {prestasi.nama}
                    </td>
                    <td className="border px-4 py-2">
                      {kategoriList.find(k => k.value === prestasi.kategori)?.label || prestasi.kategori}
                    </td>
                    <td className="border px-4 py-2 text-center font-semibold">
                      {prestasi.point ?? prestasi.score ?? 0}
                    </td>
                    <td className="border px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleDetail(prestasi)}
                        title="Detail"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                      >
                        <FiInfo />
                      </button>
                      <button
                        onClick={() => handleEdit(prestasi)}
                        title="Edit"
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(prestasi.id)}
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
                  <td colSpan="4" className="text-center py-4 text-gray-500">
                    Tidak ada data prestasi.
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

export default KelolaPrestasi;
