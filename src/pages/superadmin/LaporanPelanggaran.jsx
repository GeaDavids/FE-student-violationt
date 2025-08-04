import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import {
  FiFileText,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiCalendar,
  FiFilter,
  FiDownload,
  FiEye,
  FiAlertCircle,
} from "react-icons/fi";

const LaporanPelanggaran = () => {
  const [dataLaporan, setDataLaporan] = useState([]);
  const [filteredLaporan, setFilteredLaporan] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    siswaId: "",
    violationId: "",
    tglKejadian: "",
    tempatKejadian: "",
    deskripsi: "",
    sanksi: "",
    status: "pending",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [loading, setLoading] = useState(false);

  const [siswaList, setSiswaList] = useState([]);
  const [violationList, setViolationList] = useState([]);
  const [kelasList, setKelasList] = useState([]);

  const token = localStorage.getItem("token");

  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const statusList = [
    { value: "pending", label: "Pending", color: "bg-yellow-100 text-yellow-800" },
    { value: "proses", label: "Diproses", color: "bg-blue-100 text-blue-800" },
    { value: "selesai", label: "Selesai", color: "bg-green-100 text-green-800" },
    { value: "dibatalkan", label: "Dibatalkan", color: "bg-red-100 text-red-800" },
  ];

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

  const fetchLaporan = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/violation-records", axiosConfig);
      console.log("Data laporan pelanggaran:", res.data);
      setDataLaporan(res.data);
      setFilteredLaporan(res.data);
    } catch (err) {
      console.error("Gagal mengambil data laporan:", err);
      Swal.fire("Error!", "Gagal mengambil data laporan pelanggaran", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchSiswa = async () => {
    try {
      const res = await axios.get("/api/users/students", axiosConfig);
      setSiswaList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data siswa:", err);
    }
  };

  const fetchViolations = async () => {
    try {
      const res = await axios.get("/api/violations", axiosConfig);
      setViolationList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data jenis pelanggaran:", err);
    }
  };

  const fetchKelas = async () => {
    try {
      const res = await axios.get("/api/classrooms", axiosConfig);
      setKelasList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data kelas:", err);
    }
  };

  useEffect(() => {
    fetchLaporan();
    fetchSiswa();
    fetchViolations();
    fetchKelas();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      siswaId: parseInt(form.siswaId),
      violationId: parseInt(form.violationId),
      tglKejadian: form.tglKejadian,
      tempatKejadian: form.tempatKejadian,
      deskripsi: form.deskripsi,
      sanksi: form.sanksi,
      status: form.status,
    };

    console.log("Payload:", payload);

    try {
      if (editingId) {
        await axios.put(`/api/violation-records/${editingId}`, payload, axiosConfig);
        Swal.fire("Berhasil!", "Laporan pelanggaran berhasil diperbarui.", "success");
      } else {
        await axios.post("/api/violation-records", payload, axiosConfig);
        Swal.fire("Berhasil!", "Laporan pelanggaran baru berhasil ditambahkan.", "success");
      }

      setForm({
        siswaId: "",
        violationId: "",
        tglKejadian: "",
        tempatKejadian: "",
        deskripsi: "",
        sanksi: "",
        status: "pending",
      });
      setEditingId(null);
      setFormVisible(false);
      fetchLaporan();
    } catch (err) {
      console.error("Error:", err.response || err);
      let errorMessage = "Terjadi kesalahan saat menyimpan laporan pelanggaran.";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      Swal.fire("Gagal", errorMessage, "error");
    }
  };

  const handleEdit = (laporan) => {
    console.log("Editing laporan:", laporan);
    setForm({
      siswaId: laporan.siswaId || laporan.siswa?.id || "",
      violationId: laporan.violationId || laporan.violation?.id || "",
      tglKejadian: formatDateForInput(laporan.tglKejadian),
      tempatKejadian: laporan.tempatKejadian || "",
      deskripsi: laporan.deskripsi || "",
      sanksi: laporan.sanksi || "",
      status: laporan.status || "pending",
    });
    setEditingId(laporan.id);
    setFormVisible(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Laporan pelanggaran tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/violation-records/${id}`, axiosConfig);
          Swal.fire("Terhapus!", "Laporan pelanggaran telah dihapus.", "success");
          fetchLaporan();
        } catch (err) {
          console.error("Error:", err.response || err);
          Swal.fire("Gagal", "Gagal menghapus laporan pelanggaran.", "error");
        }
      }
    });
  };

  const handleDetail = (laporan) => {
    const statusInfo = statusList.find(s => s.value === laporan.status);
    
    Swal.fire({
      title: `<strong>Detail Laporan Pelanggaran</strong>`,
      html: `
        <div class="text-left space-y-2">
          <p><b>Siswa:</b> ${laporan.siswa?.name || laporan.siswa?.user?.name || "Unknown"}</p>
          <p><b>NISN:</b> ${laporan.siswa?.nisn || "-"}</p>
          <p><b>Kelas:</b> ${laporan.siswa?.classroom?.namaKelas || "-"}</p>
          <p><b>Jenis Pelanggaran:</b> ${laporan.violation?.namaViolation || "Unknown"}</p>
          <p><b>Kategori:</b> ${laporan.violation?.kategori || "-"}</p>
          <p><b>Poin:</b> ${laporan.violation?.poin || 0}</p>
          <p><b>Tanggal Kejadian:</b> ${formatDateForDisplay(laporan.tglKejadian)}</p>
          <p><b>Tempat Kejadian:</b> ${laporan.tempatKejadian || "-"}</p>
          <p><b>Status:</b> <span class="px-2 py-1 rounded text-sm ${statusInfo?.color || 'bg-gray-100'}">${statusInfo?.label || laporan.status}</span></p>
          <div class="mt-3">
            <p><b>Deskripsi:</b></p>
            <p class="text-gray-600 italic bg-gray-50 p-2 rounded">${laporan.deskripsi || "Tidak ada deskripsi"}</p>
          </div>
          <div class="mt-3">
            <p><b>Sanksi:</b></p>
            <p class="text-gray-600 italic bg-gray-50 p-2 rounded">${laporan.sanksi || "Belum ada sanksi"}</p>
          </div>
        </div>
      `,
      icon: "info",
      width: "600px"
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    applyFilters(value, filterStatus, filterKelas, filterTanggal);
  };

  const handleFilterStatus = (e) => {
    const value = e.target.value;
    setFilterStatus(value);
    applyFilters(searchTerm, value, filterKelas, filterTanggal);
  };

  const handleFilterKelas = (e) => {
    const value = e.target.value;
    setFilterKelas(value);
    applyFilters(searchTerm, filterStatus, value, filterTanggal);
  };

  const handleFilterTanggal = (e) => {
    const value = e.target.value;
    setFilterTanggal(value);
    applyFilters(searchTerm, filterStatus, filterKelas, value);
  };

  const applyFilters = (search, status, kelas, tanggal) => {
    let filtered = dataLaporan.filter((laporan) => {
      const siswaName = laporan.siswa?.name || laporan.siswa?.user?.name || "";
      const nisn = laporan.siswa?.nisn || "";
      const violationName = laporan.violation?.namaViolation || "";
      
      const matchSearch = siswaName.toLowerCase().includes(search) ||
                         nisn.includes(search) ||
                         violationName.toLowerCase().includes(search) ||
                         (laporan.tempatKejadian || "").toLowerCase().includes(search);
      
      const matchStatus = !status || laporan.status === status;
      const matchKelas = !kelas || laporan.siswa?.classroom?.id === parseInt(kelas);
      
      let matchTanggal = true;
      if (tanggal) {
        const filterDate = new Date(tanggal).toDateString();
        const laporanDate = new Date(laporan.tglKejadian).toDateString();
        matchTanggal = filterDate === laporanDate;
      }
      
      return matchSearch && matchStatus && matchKelas && matchTanggal;
    });
    setFilteredLaporan(filtered);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterStatus("");
    setFilterKelas("");
    setFilterTanggal("");
    setFilteredLaporan(dataLaporan);
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

  const exportLaporan = () => {
    Swal.fire({
      title: "Export Laporan",
      text: "Fitur export laporan dalam format Excel/PDF akan segera tersedia",
      icon: "info",
    });
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
          <FiFileText /> Laporan Pelanggaran
        </h2>
        <div className="flex gap-2">
          <button
            onClick={exportLaporan}
            className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FiDownload /> Export
          </button>
          <button
            onClick={() => {
              setForm({
                siswaId: "",
                violationId: "",
                tglKejadian: "",
                tempatKejadian: "",
                deskripsi: "",
                sanksi: "",
                status: "pending",
              });
              setEditingId(null);
              setFormVisible(true);
            }}
            className="bg-[#003366] text-white px-4 py-2 rounded flex items-center gap-2"
          >
            <FiPlus /> Tambah Laporan
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="flex items-center border rounded px-3 py-2">
          <FiSearch className="mr-2" />
          <input
            type="text"
            placeholder="Cari siswa/pelanggaran..."
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
        <select
          value={filterKelas}
          onChange={handleFilterKelas}
          className="border rounded px-3 py-2"
        >
          <option value="">Semua Kelas</option>
          {kelasList.map((kelas) => (
            <option key={kelas.id} value={kelas.id}>
              {kelas.namaKelas}
            </option>
          ))}
        </select>
        <input
          type="date"
          value={filterTanggal}
          onChange={handleFilterTanggal}
          className="border rounded px-3 py-2"
        />
        <button
          onClick={() => {
            fetchLaporan();
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
              name="siswaId"
              value={form.siswaId}
              onChange={handleChange}
              required
              className="border p-3 rounded"
            >
              <option value="">Pilih Siswa</option>
              {siswaList.map((siswa) => (
                <option key={siswa.id} value={siswa.id}>
                  {siswa.nisn} - {siswa.name || siswa.user?.name} ({siswa.classroom?.namaKelas || "No Class"})
                </option>
              ))}
            </select>
            <select
              name="violationId"
              value={form.violationId}
              onChange={handleChange}
              required
              className="border p-3 rounded"
            >
              <option value="">Pilih Jenis Pelanggaran</option>
              {violationList.map((violation) => (
                <option key={violation.id} value={violation.id}>
                  {violation.namaViolation} ({violation.poin} poin)
                </option>
              ))}
            </select>
            <input
              type="date"
              name="tglKejadian"
              value={form.tglKejadian}
              onChange={handleChange}
              required
              className="border p-3 rounded"
            />
            <input
              type="text"
              name="tempatKejadian"
              placeholder="Tempat Kejadian"
              value={form.tempatKejadian}
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
            <input
              type="text"
              name="sanksi"
              placeholder="Sanksi yang diberikan"
              value={form.sanksi}
              onChange={handleChange}
              className="border p-3 rounded"
            />
            <textarea
              name="deskripsi"
              placeholder="Deskripsi kejadian"
              value={form.deskripsi}
              onChange={handleChange}
              className="border p-3 rounded md:col-span-2"
              rows="3"
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
                <th className="border px-4 py-2 text-left">Tanggal</th>
                <th className="border px-4 py-2 text-left">Siswa</th>
                <th className="border px-4 py-2 text-left">Kelas</th>
                <th className="border px-4 py-2 text-left">Pelanggaran</th>
                <th className="border px-4 py-2 text-center">Poin</th>
                <th className="border px-4 py-2 text-center">Status</th>
                <th className="border px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLaporan.length > 0 ? (
                filteredLaporan.map((laporan) => (
                  <tr key={laporan.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">
                      {formatDateForDisplay(laporan.tglKejadian)}
                    </td>
                    <td 
                      className="border px-4 py-2 cursor-pointer hover:text-[#003366]"
                      onClick={() => handleDetail(laporan)}
                    >
                      <div>
                        <div className="font-semibold">{laporan.siswa?.name || laporan.siswa?.user?.name}</div>
                        <div className="text-sm text-gray-500">{laporan.siswa?.nisn}</div>
                      </div>
                    </td>
                    <td className="border px-4 py-2">
                      {laporan.siswa?.classroom?.namaKelas || "-"}
                    </td>
                    <td className="border px-4 py-2">
                      <div>
                        <div className="font-medium">{laporan.violation?.namaViolation}</div>
                        <div className="text-sm text-gray-500">{laporan.violation?.kategori}</div>
                      </div>
                    </td>
                    <td className="border px-4 py-2 text-center font-bold">
                      <span className="text-red-600">{laporan.violation?.poin || 0}</span>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {getStatusBadge(laporan.status)}
                    </td>
                    <td className="border px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleDetail(laporan)}
                        title="Detail"
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                      >
                        <FiEye />
                      </button>
                      <button
                        onClick={() => handleEdit(laporan)}
                        title="Edit"
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(laporan.id)}
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
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    Tidak ada data laporan pelanggaran.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
            <FiAlertCircle /> Pending
          </h3>
          <p className="text-2xl font-bold text-yellow-600">
            {dataLaporan.filter(l => l.status === 'pending').length}
          </p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800">Diproses</h3>
          <p className="text-2xl font-bold text-blue-600">
            {dataLaporan.filter(l => l.status === 'proses').length}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800">Selesai</h3>
          <p className="text-2xl font-bold text-green-600">
            {dataLaporan.filter(l => l.status === 'selesai').length}
          </p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800">Total Laporan</h3>
          <p className="text-2xl font-bold text-purple-600">
            {dataLaporan.length}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LaporanPelanggaran;
