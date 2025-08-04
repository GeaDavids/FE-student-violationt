import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import {
  FiCalendar,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiUsers,
  FiAward,
} from "react-icons/fi";

const KelolaAngkatan = () => {
  const [dataAngkatan, setDataAngkatan] = useState([]);
  const [filteredAngkatan, setFilteredAngkatan] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    tahun: "",
    nama: "",
    keterangan: "",
    status: "aktif",
  });
  const [editingId, setEditingId] = useState(null);
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
    { value: "aktif", label: "Aktif", color: "bg-green-100 text-green-800" },
    { value: "lulus", label: "Lulus", color: "bg-blue-100 text-blue-800" },
    { value: "nonaktif", label: "Non-Aktif", color: "bg-gray-100 text-gray-800" },
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
      status: form.status,
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
        status: "aktif",
      });
      setEditingId(null);
      setFormVisible(false);
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
    console.log("Editing angkatan:", angkatan);
    setForm({
      tahun: angkatan.tahun || angkatan.year || "",
      nama: angkatan.nama || angkatan.name || "",
      keterangan: angkatan.keterangan || "",
      status: angkatan.status || "aktif",
    });
    setEditingId(angkatan.id);
    setFormVisible(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data angkatan tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/angkatan/${id}`, axiosConfig);
          Swal.fire("Terhapus!", "Data angkatan telah dihapus.", "success");
          fetchAngkatan();
        } catch (err) {
          console.error("Error:", err.response || err);
          Swal.fire("Gagal", "Gagal menghapus data angkatan.", "error");
        }
      }
    });
  };

  const handleDetail = (angkatan) => {
    const statusInfo = statusList.find(s => s.value === angkatan.status);
    
    Swal.fire({
      title: `<strong>Detail Angkatan</strong>`,
      html: `
        <div class="text-left">
          <p><b>Tahun:</b> ${angkatan.tahun || angkatan.year}</p>
          <p><b>Nama:</b> ${angkatan.nama || angkatan.name}</p>
          <p><b>Status:</b> <span class="px-2 py-1 rounded text-sm ${statusInfo?.color || 'bg-gray-100'}">${statusInfo?.label || angkatan.status}</span></p>
          <p><b>Jumlah Siswa:</b> ${angkatan.jmlSiswa || 0} siswa</p>
          <p><b>Keterangan:</b></p>
          <p class="text-gray-600 italic">${angkatan.keterangan || "Tidak ada keterangan"}</p>
        </div>
      `,
      icon: "info",
      width: "500px"
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
      
      const matchStatus = !status || angkatan.status === status;
      
      return matchSearch && matchStatus;
    });
    setFilteredAngkatan(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilteredAngkatan(dataAngkatan);
  };

  const getStatusBadge = (status) => {
    const statusInfo = statusList.find(s => s.value === status);
    if (!statusInfo) return <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs">Unknown</span>;
    
    return (
      <span className={`${statusInfo.color} px-2 py-1 rounded-full text-xs font-medium`}>
        {statusInfo.label}
      </span>
    );
  };

  const viewStudents = (angkatanId, namaAngkatan) => {
    Swal.fire({
      title: `Siswa ${namaAngkatan}`,
      text: "Fitur ini akan menampilkan daftar siswa di angkatan tersebut",
      icon: "info",
    });
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
              status: "aktif",
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
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              required
              className="border p-3 rounded"
            >
              {statusList.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
            <textarea
              name="keterangan"
              placeholder="Keterangan (opsional)"
              value={form.keterangan}
              onChange={handleChange}
              className="border p-3 rounded"
              rows="1"
            />
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
                <th className="border px-4 py-2 text-left">Tahun</th>
                <th className="border px-4 py-2 text-left">Nama Angkatan</th>
                <th className="border px-4 py-2 text-center">Status</th>
                <th className="border px-4 py-2 text-center">Jumlah Siswa</th>
                <th className="border px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAngkatan.length > 0 ? (
                filteredAngkatan.map((angkatan) => (
                  <tr key={angkatan.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2 font-semibold">
                      {angkatan.tahun || angkatan.year}
                    </td>
                    <td 
                      className="border px-4 py-2 cursor-pointer hover:text-[#003366]"
                      onClick={() => handleDetail(angkatan)}
                    >
                      {angkatan.nama || angkatan.name || `Angkatan ${angkatan.tahun || angkatan.year}`}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {getStatusBadge(angkatan.status)}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <button
                        onClick={() => viewStudents(angkatan.id, angkatan.nama || angkatan.name)}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto"
                      >
                        <FiUsers /> {angkatan.jmlSiswa || 0}
                      </button>
                    </td>
                    <td className="border px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(angkatan)}
                        title="Edit"
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(angkatan.id)}
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
            {dataAngkatan.filter(a => a.status === 'aktif').length}
          </p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Angkatan Lulus</h3>
          <p className="text-2xl font-bold text-blue-600">
            {dataAngkatan.filter(a => a.status === 'lulus').length}
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800">Non-Aktif</h3>
          <p className="text-2xl font-bold text-gray-600">
            {dataAngkatan.filter(a => a.status === 'nonaktif').length}
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
