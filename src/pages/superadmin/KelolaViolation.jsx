
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import {
  FiAlertTriangle,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiStar,
  FiInfo,
} from "react-icons/fi";

const kategoriList = [
  { value: "ringan", label: "Ringan", color: "text-green-600" },
  { value: "sedang", label: "Sedang", color: "text-yellow-600" },
  { value: "berat", label: "Berat", color: "text-red-600" },
];
const jenisList = [
  { value: "kedisiplinan", label: "Kedisiplinan" },
  { value: "akademik", label: "Akademik" },
  { value: "lainnya", label: "Lainnya" },
];

const KelolaViolation = () => {
  const [dataViolation, setDataViolation] = useState([]);
  const [filteredViolation, setFilteredViolation] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    kategori: "ringan",
    jenis: "kedisiplinan",
    point: 0,
    isActive: true,
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [filterJenis, setFilterJenis] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };


  const fetchViolation = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/violations", axiosConfig);
      setDataViolation(res.data);
      setFilteredViolation(res.data);
    } catch (err) {
      Swal.fire("Error!", "Gagal mengambil data jenis pelanggaran", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViolation();
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
      jenis: form.jenis,
      point: parseInt(form.point),
      isActive: form.isActive,
    };
    try {
      if (editingId) {
        await axios.put(`/api/violations/${editingId}`, payload, axiosConfig);
        Swal.fire("Berhasil!", "Data jenis pelanggaran berhasil diperbarui.", "success");
      } else {
        await axios.post("/api/violations", payload, axiosConfig);
        Swal.fire("Berhasil!", "Jenis pelanggaran baru berhasil ditambahkan.", "success");
      }
      setForm({ nama: "", kategori: "ringan", jenis: "kedisiplinan", point: 0, isActive: true });
      setEditingId(null);
      setFormVisible(false);
      fetchViolation();
    } catch (err) {
      let errorMessage = "Terjadi kesalahan saat menyimpan data jenis pelanggaran.";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      Swal.fire("Gagal", errorMessage, "error");
    }
  };

  const handleEdit = (violation) => {
    setForm({
      nama: violation.nama || "",
      kategori: violation.kategori || "ringan",
      jenis: violation.jenis || "kedisiplinan",
      point: violation.point || 0,
      isActive: violation.isActive !== undefined ? violation.isActive : true,
    });
    setEditingId(violation.id);
    setFormVisible(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data jenis pelanggaran tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/violations/${id}`, axiosConfig);
          Swal.fire("Terhapus!", "Data jenis pelanggaran telah dihapus.", "success");
          fetchViolation();
        } catch (err) {
          console.error("Error:", err.response || err);
          Swal.fire("Gagal", "Gagal menghapus data jenis pelanggaran.", "error");
        }
      }
    });
  };

  const handleDetail = (violation) => {
    const kategoriLabel = kategoriList.find(k => k.value === violation.kategori)?.label || violation.kategori;
    const jenisLabel = jenisList.find(j => j.value === violation.jenis)?.label || violation.jenis;
    Swal.fire({
      title: `<strong>Detail Jenis Pelanggaran</strong>`,
      html: `
        <div class="text-left">
          <p><b>Nama Pelanggaran:</b> ${violation.nama}</p>
          <p><b>Kategori:</b> ${kategoriLabel}</p>
          <p><b>Jenis:</b> ${jenisLabel}</p>
          <p><b>Poin:</b> ${violation.point}</p>
          <p><b>Status:</b> ${violation.isActive ? "Aktif" : "Non-Aktif"}</p>
        </div>
      `,
      icon: "info",
      width: "500px"
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    applyFilters(value, filterKategori, filterJenis);
  };

  const handleFilterKategori = (e) => {
    const value = e.target.value;
    setFilterKategori(value);
    applyFilters(searchTerm, value, filterJenis);
  };

  const handleFilterJenis = (e) => {
    const value = e.target.value;
    setFilterJenis(value);
    applyFilters(searchTerm, filterKategori, value);
  };

  const applyFilters = (search, kategori, jenis) => {
    let filtered = dataViolation.filter((violation) => {
      const matchSearch = violation.nama.toLowerCase().includes(search) ||
                         violation.kategori.toLowerCase().includes(search) ||
                         violation.jenis.toLowerCase().includes(search);
      const matchKategori = !kategori || violation.kategori === kategori;
      const matchJenis = !jenis || violation.jenis === jenis;
      return matchSearch && matchKategori && matchJenis;
    });
    setFilteredViolation(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterKategori("");
    setFilterJenis("");
    setFilteredViolation(dataViolation);
  };

  const getKategoriBadge = (kategori) => {
    const kategoriInfo = kategoriList.find(k => k.value === kategori);
    if (!kategoriInfo) return <span className="text-gray-500">{kategori}</span>;
    return (
      <span className={`${kategoriInfo.color} font-semibold flex items-center gap-1`}>
        <FiStar size={14} />
        {kategoriInfo.label}
      </span>
    );
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
          <FiAlertTriangle /> Kelola Jenis Pelanggaran
        </h2>
        <button
          onClick={() => {
            setForm({
              namaViolation: "",
              kategori: "",
              tingkatViolation: 1,
              poin: 0,
              deskripsi: "",
            });
            setEditingId(null);
            setFormVisible(true);
          }}
          className="bg-[#003366] text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FiPlus /> Tambah Jenis Pelanggaran
        </button>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center border rounded px-3 py-2">
          <FiSearch className="mr-2" />
          <input
            type="text"
            placeholder="Cari pelanggaran..."
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
        <select
          value={filterJenis}
          onChange={handleFilterJenis}
          className="border rounded px-3 py-2"
        >
          <option value="">Semua Jenis</option>
          {jenisList.map((jenis) => (
            <option key={jenis.value} value={jenis.value}>
              {jenis.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            fetchViolation();
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
              placeholder="Nama Pelanggaran"
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
            <select
              name="jenis"
              value={form.jenis}
              onChange={handleChange}
              required
              className="border p-3 rounded"
            >
              {jenisList.map((jenis) => (
                <option key={jenis.value} value={jenis.value}>
                  {jenis.label}
                </option>
              ))}
            </select>
            <input
              type="number"
              name="point"
              placeholder="Poin Pelanggaran"
              value={form.point}
              onChange={handleChange}
              required
              min="0"
              max="100"
              className="border p-3 rounded"
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
                <th className="border px-4 py-2 text-left">Nama Pelanggaran</th>
                <th className="border px-4 py-2 text-left">Kategori</th>
                <th className="border px-4 py-2 text-left">Jenis</th>
                <th className="border px-4 py-2 text-center">Poin</th>
                <th className="border px-4 py-2 text-center">Status</th>
                <th className="border px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredViolation.length > 0 ? (
                filteredViolation.map((violation) => (
                  <tr key={violation.id} className="hover:bg-gray-50">
                    <td 
                      className="border px-4 py-2 cursor-pointer hover:text-[#003366]"
                      onClick={() => handleDetail(violation)}
                    >
                      {violation.nama}
                    </td>
                    <td className="border px-4 py-2">
                      {getKategoriBadge(violation.kategori)}
                    </td>
                    <td className="border px-4 py-2">
                      {jenisList.find(j => j.value === violation.jenis)?.label || violation.jenis}
                    </td>
                    <td className="border px-4 py-2 text-center font-semibold">
                      {violation.point} poin
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <span className={violation.isActive ? "bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs" : "bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs"}>
                        {violation.isActive ? "Aktif" : "Non-Aktif"}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleDetail(violation)}
                        title="Detail"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                      >
                        <FiInfo />
                      </button>
                      <button
                        onClick={() => handleEdit(violation)}
                        title="Edit"
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(violation.id)}
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
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    Tidak ada data jenis pelanggaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Pelanggaran Ringan</h3>
          <p className="text-2xl font-bold text-green-600">
            {dataViolation.filter(v => v.kategori === "ringan").length}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Pelanggaran Sedang</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {dataViolation.filter(v => v.kategori === "sedang").length}
          </p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800">Pelanggaran Berat</h3>
          <p className="text-2xl font-bold text-red-600">
            {dataViolation.filter(v => v.kategori === "berat").length}
          </p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Total Jenis</h3>
          <p className="text-2xl font-bold text-blue-600">
            {dataViolation.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KelolaViolation;
