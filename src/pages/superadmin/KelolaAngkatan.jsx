import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  FiCalendar,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiAward,
  FiEdit2,
  FiTrash2,
  FiUsers,
} from "react-icons/fi";

const KelolaAngkatan = () => {
  const navigate = useNavigate();
  const [dataAngkatan, setDataAngkatan] = useState([]);
  const [filteredAngkatan, setFilteredAngkatan] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    tahun: "",
    nama: "",
    keterangan: "",
    lulusDate: "",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const statusList = [
    { value: "", label: "Aktif", color: "bg-green-100 text-green-800" },
    { value: "graduated", label: "Lulus", color: "bg-blue-100 text-blue-800" },
    { value: "inactive", label: "Non-Aktif", color: "bg-gray-100 text-gray-800" },
  ];

  const fetchAngkatan = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/angkatan", axiosConfig);
      console.log("Data angkatan:", res.data);
      setDataAngkatan(res.data);
      setFilteredAngkatan(res.data);
    } catch (err) {
      console.error("Gagal mengambil data angkatan:", err);
      Swal.fire("Error!", "Gagal mengambil data angkatan", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAngkatan();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      tahun: form.tahun,
      nama: form.nama || `Angkatan ${form.tahun}`,
      keterangan: form.keterangan,
      lulusDate: form.lulusDate || null,
    };

    console.log("Payload:", payload);

    try {
      if (editingId) {
        await axios.put(`/api/angkatan/${editingId}`, payload, axiosConfig);
        Swal.fire("Berhasil!", "Data angkatan berhasil diperbarui.", "success");
      } else {
        await axios.post("/api/angkatan", payload, axiosConfig);
        Swal.fire("Berhasil!", "Data angkatan baru berhasil ditambahkan.", "success");
      }

      setForm({
        tahun: "",
        nama: "",
        keterangan: "",
        lulusDate: "",
      });
      setFormVisible(false);
      setEditingId(null);
      fetchAngkatan();
    } catch (err) {
      console.error("Error:", err.response || err);
      let errorMessage = "Terjadi kesalahan saat menyimpan data angkatan.";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      Swal.fire("Gagal", errorMessage, "error");
    }
  };

  const handleEdit = (angkatan) => {
    setEditingId(angkatan.id);
    setForm({
      tahun: angkatan.tahun || angkatan.year || "",
      nama: angkatan.nama || angkatan.name || "",
      keterangan: angkatan.keterangan || "",
      lulusDate: angkatan.lulusDate || "",
    });
    setFormVisible(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data angkatan tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
      confirmButtonColor: "#dc2626",
      cancelButtonText: "Batal",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/angkatan/${id}`, axiosConfig);
          Swal.fire("Terhapus!", "Data angkatan telah dihapus.", "success");
          fetchAngkatan();
        } catch (err) {
          console.error("Delete error:", err.response || err);
          Swal.fire("Gagal", "Gagal menghapus data angkatan.", "error");
        }
      }
    });
  };

  const handleDetail = (angkatan) => {
    navigate('/superadmin/detail-angkatan', { 
      state: { 
        angkatan: angkatan,
        fromPage: 'kelola-angkatan'
      } 
    });
  };

  const viewStudents = (angkatan) => {
    // Navigate to student list for this angkatan
    navigate('/superadmin/kelola-siswa', { 
      state: { 
        filterAngkatan: angkatan.id,
        angkatanName: angkatan.nama || `Angkatan ${angkatan.tahun}`
      } 
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    applyFilters(value, filterStatus);
  };

  const handleFilterStatus = (e) => {
    const value = e.target.value;
    setFilterStatus(value);
    applyFilters(searchTerm, value);
  };

  const applyFilters = (search, status) => {
    let filtered = dataAngkatan.filter((angkatan) => {
      const tahun = (angkatan.tahun || angkatan.year || "").toString();
      const nama = angkatan.nama || angkatan.name || "";
      
      const matchSearch = tahun.includes(search) ||
                         nama.toLowerCase().includes(search) ||
                         (angkatan.keterangan || "").toLowerCase().includes(search);
      
      // Filter berdasarkan status lulusDate
      let matchStatus = true;
      if (status === "graduated") {
        matchStatus = angkatan.lulusDate && angkatan.lulusDate !== null;
      } else if (status === "inactive") {
        matchStatus = angkatan.status === "inactive";
      } else if (status === "") {
        matchStatus = (!angkatan.lulusDate || angkatan.lulusDate === null) && angkatan.status !== "inactive";
      }
      
      return matchSearch && matchStatus;
    });
    setFilteredAngkatan(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilteredAngkatan(dataAngkatan);
  };

  const getStatusBadge = (angkatan) => {
    let status = "";
    let color = "";
    let label = "";

    if (angkatan.lulusDate && angkatan.lulusDate !== null) {
      const lulusYear = new Date(angkatan.lulusDate).getFullYear();
      status = "graduated";
      color = "bg-blue-100 text-blue-800";
      label = `Lulus ${lulusYear}`;
    } else if (angkatan.status === "inactive") {
      status = "inactive";
      color = "bg-gray-100 text-gray-800";
      label = "Non-Aktif";
    } else {
      status = "active";
      color = "bg-green-100 text-green-800";
      label = "Aktif";
    }
    
    return (
      <span className={`${color} px-2 py-1 rounded-full text-xs font-medium`}>
        {label}
      </span>
    );
  };

  // Generate tahun options
  const currentYear = new Date().getFullYear();
  const yearOptions = [];
  for (let i = currentYear + 2; i >= currentYear - 10; i--) {
    yearOptions.push(i);
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
          <FiCalendar /> Kelola Angkatan
        </h2>
        <button
          onClick={() => {
            setForm({
              tahun: "",
              nama: "",
              keterangan: "",
              lulusDate: "",
            });
            setEditingId(null);
            setFormVisible(true);
          }}
          className="bg-[#003366] text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FiPlus /> Tambah Angkatan
        </button>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center border rounded px-3 py-2">
          <FiSearch className="mr-2" />
          <input
            type="text"
            placeholder="Cari angkatan..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full outline-none"
          />
        </div>
        <select
          value={filterStatus}
          onChange={handleFilterStatus}
          className="border rounded px-3 py-2"
        >
          <option value="">Semua Status</option>
          {statusList.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            fetchAngkatan();
            resetFilters();
          }}
          className="bg-gray-200 px-3 py-2 rounded text-sm flex items-center gap-1"
        >
          <FiRefreshCw /> Reset
        </button>
      </div>

      {formVisible && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Angkatan" : "Tambah Angkatan Baru"}
          </h3>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <select
              name="tahun"
              value={form.tahun}
              onChange={handleChange}
              required
              className="border p-3 rounded"
            >
              <option value="">Pilih Tahun</option>
              {yearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <input
              type="text"
              name="nama"
              placeholder="Nama Angkatan (opsional)"
              value={form.nama}
              onChange={handleChange}
              className="border p-3 rounded"
            />
            <input
              type="date"
              name="lulusDate"
              placeholder="Tanggal Lulus (opsional)"
              value={form.lulusDate}
              onChange={handleChange}
              className="border p-3 rounded"
            />
            <textarea
              name="keterangan"
              placeholder="Keterangan (opsional)"
              value={form.keterangan}
              onChange={handleChange}
              className="border p-3 rounded"
              rows="1"
            />
            <div className="md:col-span-2 flex gap-2">
              <button
                type="submit"
                className="bg-[#003366] text-white px-4 py-3 rounded flex-1"
              >
                {editingId ? "Update" : "Tambah"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormVisible(false);
                  setEditingId(null);
                  setForm({
                    tahun: "",
                    nama: "",
                    keterangan: "",
                    lulusDate: "",
                  });
                }}
                className="bg-gray-500 text-white px-4 py-3 rounded"
              >
                Batal
              </button>
            </div>
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
                <th className="border px-4 py-2 text-left">Tahun Angkatan</th>
                <th className="border px-4 py-2 text-left">Nama Angkatan</th>
                <th className="border px-4 py-2 text-left">Status Kelulusan</th>
                <th className="border px-4 py-2 text-left">Jumlah Siswa</th>
                <th className="border px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAngkatan.length > 0 ? (
                filteredAngkatan.map((angkatan) => (
                  <tr key={angkatan.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 font-semibold text-gray-700">
                      {angkatan.tahun || angkatan.year}
                    </td>
                    <td className="border px-4 py-2 text-gray-800">
                      {angkatan.nama || angkatan.name || `Angkatan ${angkatan.tahun || angkatan.year}`}
                    </td>
                    <td className="border px-4 py-2">
                      {getStatusBadge(angkatan)}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => viewStudents(angkatan)}
                        className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm hover:bg-blue-200 flex items-center gap-1 mx-auto"
                      >
                        <FiUsers size={14} />
                        {angkatan.jumlah_siswa || 0} siswa
                      </button>
                    </td>
                    <td className="border px-4 py-2">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleDetail(angkatan)}
                          className="text-blue-500 hover:bg-blue-100 p-1 rounded"
                          title="Detail"
                        >
                          <FiUsers size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(angkatan)}
                          className="text-green-500 hover:bg-green-100 p-1 rounded"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(angkatan.id)}
                          className="text-red-500 hover:bg-red-100 p-1 rounded"
                          title="Hapus"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    Tidak ada data angkatan.
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
          <h3 className="font-semibold text-green-800 flex items-center gap-2">
            <FiAward /> Angkatan Aktif
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {dataAngkatan.filter(a => (!a.lulusDate || a.lulusDate === null) && a.status !== "inactive").length}
          </p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Angkatan Lulus</h3>
          <p className="text-2xl font-bold text-blue-600">
            {dataAngkatan.filter(a => a.lulusDate && a.lulusDate !== null).length}
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800">Non-Aktif</h3>
          <p className="text-2xl font-bold text-gray-600">
            {dataAngkatan.filter(a => a.status === 'inactive').length}
          </p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Total Angkatan</h3>
          <p className="text-2xl font-bold text-purple-600">
            {dataAngkatan.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default KelolaAngkatan;
