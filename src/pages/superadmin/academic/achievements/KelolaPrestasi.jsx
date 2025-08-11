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

// Kategori Prestasi sesuai schema enum KategoriPrestasi
const kategoriList = [
  { value: "akademik", label: "Akademik", color: "text-blue-600" },
  { value: "non_akademik", label: "Non-Akademik", color: "text-green-600" },
  { value: "olahraga", label: "Olahraga", color: "text-orange-600" },
  { value: "kesenian", label: "Kesenian", color: "text-purple-600" },
  { value: "lainnya", label: "Lainnya", color: "text-gray-600" },
];

const KelolaPrestasi = () => {
  const [dataPrestasi, setDataPrestasi] = useState([]);
  const [filteredPrestasi, setFilteredPrestasi] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    kategori: "akademik",
    point: 0,
    isActive: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  };

  const fetchPrestasi = async () => {
    try {
      setLoading(true);
      console.log("Fetching achievements...");
      const res = await axios.get("/api/achievements", axiosConfig);
      console.log("Achievements data received:", res.data);
      setDataPrestasi(res.data);
      setFilteredPrestasi(res.data);
    } catch (err) {
      console.error("Error fetching achievements:", err);
      Swal.fire("Error!", "Gagal mengambil data prestasi", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrestasi();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      nama: form.nama,
      kategori: form.kategori,
      point: parseInt(form.point),
      isActive: form.isActive,
    };

    console.log("Submitting achievement data:", payload);

    try {
      if (editingId) {
        await axios.put(`/api/achievements/${editingId}`, payload, axiosConfig);
        Swal.fire("Berhasil!", "Data prestasi berhasil diperbarui.", "success");
      } else {
        await axios.post("/api/achievements", payload, axiosConfig);
        Swal.fire(
          "Berhasil!",
          "Prestasi baru berhasil ditambahkan.",
          "success"
        );
      }
      setForm({ nama: "", kategori: "akademik", point: 0, isActive: true });
      setEditingId(null);
      setFormVisible(false);
      fetchPrestasi();
    } catch (err) {
      console.error("Error submitting achievement:", err);
      let errorMessage = "Terjadi kesalahan saat menyimpan data prestasi.";
      if (err.response?.data?.error) errorMessage = err.response.data.error;
      Swal.fire("Gagal", errorMessage, "error");
    }
  };

  const handleEdit = (prestasi) => {
    setForm({
      nama: prestasi.nama || "",
      kategori: prestasi.kategori || "akademik",
      point: prestasi.point || 0,
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
    const kategoriLabel =
      kategoriList.find((k) => k.value === prestasi.kategori)?.label ||
      prestasi.kategori;
    const statusLabel =
      prestasi.isActive !== undefined
        ? prestasi.isActive
          ? "Aktif"
          : "Non-Aktif"
        : "Tidak diketahui";

    Swal.fire({
      title: `<strong>Detail Prestasi</strong>`,
      html: `
        <div class="text-left">
          <p><b>Nama Prestasi:</b> ${prestasi.nama}</p>
          <p><b>Kategori:</b> ${kategoriLabel}</p>
          <p><b>Poin:</b> ${prestasi.point}</p>
          <p><b>Status:</b> ${statusLabel}</p>
          <p><b>Dibuat:</b> ${
            prestasi.createdAt
              ? new Date(prestasi.createdAt).toLocaleDateString("id-ID")
              : "-"
          }</p>
        </div>
      `,
      icon: "info",
      width: "500px",
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    applyFilters(value, filterKategori);
  };

  const handleFilterKategori = (e) => {
    const value = e.target.value;
    setFilterKategori(value);
    applyFilters(searchTerm, value);
  };

  const applyFilters = (search, kategori) => {
    let filtered = dataPrestasi.filter((prestasi) => {
      const matchSearch =
        prestasi.nama.toLowerCase().includes(search) ||
        prestasi.kategori.toLowerCase().includes(search);
      const matchKategori = !kategori || prestasi.kategori === kategori;
      return matchSearch && matchKategori;
    });
    setFilteredPrestasi(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterKategori("");
    setFilteredPrestasi(dataPrestasi);
  };

  const getKategoriBadge = (kategori) => {
    const kategoriInfo = kategoriList.find((k) => k.value === kategori);
    if (!kategoriInfo) return <span className="text-gray-500">{kategori}</span>;
    return (
      <span
        className={`${kategoriInfo.color} font-semibold flex items-center gap-1`}
      >
        <FiAward size={14} />
        {kategoriInfo.label}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
          <FiAward /> Kelola Prestasi
        </h2>
        <button
          onClick={() => {
            setForm({
              nama: "",
              kategori: "akademik",
              point: 0,
              isActive: true,
            });
            setEditingId(null);
            setFormVisible(true);
          }}
          className="bg-[#003366] text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FiPlus /> Tambah Prestasi
        </button>
      </div>
      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
            <option key={kategori.value} value={kategori.value}>
              {kategori.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            fetchPrestasi();
            resetFilters();
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
                <option key={kategori.value} value={kategori.value}>
                  {kategori.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="point"
              placeholder="Poin Prestasi"
              value={form.point}
              onChange={handleChange}
              required
              min="0"
              max="100"
              className="border p-3 rounded"
            />
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isActive"
                checked={form.isActive}
                onChange={handleChange}
                className="h-4 w-4"
                id="isActiveCheckbox"
              />
              <label htmlFor="isActiveCheckbox" className="text-sm">
                Aktif
              </label>
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
            <thead className="bg-gradient-to-r from-[#003366] to-[#004080] text-white">
              <tr>
                <th className="border px-4 py-3 text-left">Nama Prestasi</th>
                <th className="border px-4 py-3 text-left">Kategori</th>
                <th className="border px-4 py-3 text-center">Poin</th>
                <th className="border px-4 py-3 text-center">Status</th>
                <th className="border px-4 py-3 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredPrestasi.length > 0 ? (
                filteredPrestasi.map((prestasi, index) => (
                  <tr
                    key={prestasi.id}
                    className={`hover:bg-blue-50 ${
                      index % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td
                      className="border px-4 py-3 cursor-pointer hover:text-[#003366] font-medium"
                      onClick={() => handleDetail(prestasi)}
                    >
                      {prestasi.nama}
                    </td>
                    <td className="border px-4 py-3">
                      {getKategoriBadge(prestasi.kategori)}
                    </td>
                    <td className="border px-4 py-3 text-center">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                        +{prestasi.point} poin
                      </span>
                    </td>
                    <td className="border px-4 py-3 text-center">
                      <span
                        className={
                          prestasi.isActive !== undefined
                            ? prestasi.isActive
                              ? "bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs"
                              : "bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs"
                            : "bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs"
                        }
                      >
                        {prestasi.isActive !== undefined
                          ? prestasi.isActive
                            ? "Aktif"
                            : "Non-Aktif"
                          : "Tidak diketahui"}
                      </span>
                    </td>
                    <td className="border px-4 py-3 text-center space-x-2">
                      <button
                        onClick={() => handleDetail(prestasi)}
                        title="Detail"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded transition-colors duration-200"
                      >
                        <FiInfo />
                      </button>
                      <button
                        onClick={() => handleEdit(prestasi)}
                        title="Edit"
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded transition-colors duration-200"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(prestasi.id)}
                        title="Delete"
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded transition-colors duration-200"
                      >
                        <FiTrash2 />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    Tidak ada data prestasi.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Prestasi Akademik</h3>
          <p className="text-2xl font-bold text-blue-600">
            {dataPrestasi.filter((p) => p.kategori === "akademik").length}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Non-Akademik</h3>
          <p className="text-2xl font-bold text-green-600">
            {dataPrestasi.filter((p) => p.kategori === "non_akademik").length}
          </p>
        </div>
        <div className="bg-orange-100 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-800">Olahraga</h3>
          <p className="text-2xl font-bold text-orange-600">
            {dataPrestasi.filter((p) => p.kategori === "olahraga").length}
          </p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Kesenian</h3>
          <p className="text-2xl font-bold text-purple-600">
            {dataPrestasi.filter((p) => p.kategori === "kesenian").length}
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800">Total Jenis</h3>
          <p className="text-2xl font-bold text-gray-600">
            {dataPrestasi.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KelolaPrestasi;
