import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiRefreshCw, FiInfo } from "react-icons/fi";

// Asumsi struktur data pelaporan pelanggaran siswa sesuai API:
// id, siswaId, namaSiswa, violationId, namaViolation, tanggal, keterangan, point

const StudentViolation = () => {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    siswaId: "",
    violationId: "",
    tanggal: new Date().toISOString().slice(0, 10),
    keterangan: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [siswaList, setSiswaList] = useState([]);
  const [violationList, setViolationList] = useState([]);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  };

  // Fetch siswa dan violation untuk dropdown
  const fetchSiswa = async () => {
    try {
      const res = await axios.get("/api/students", axiosConfig);
      setSiswaList(res.data);
    } catch {}
  };
  const fetchViolation = async () => {
    try {
      const res = await axios.get("/api/violations", axiosConfig);
      setViolationList(res.data);
    } catch {}
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/student-violations", axiosConfig);
      setData(res.data);
      setFiltered(res.data);
    } catch (err) {
      Swal.fire("Error!", "Gagal mengambil data pelanggaran siswa", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchSiswa();
    fetchViolation();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      siswaId: form.siswaId,
      violationId: form.violationId,
      tanggal: form.tanggal,
      keterangan: form.keterangan,
    };
    try {
      if (editingId) {
        await axios.put(`/api/student-violations/${editingId}`, payload, axiosConfig);
        Swal.fire("Berhasil!", "Laporan pelanggaran berhasil diperbarui.", "success");
      } else {
        await axios.post("/api/student-violations", payload, axiosConfig);
        Swal.fire("Berhasil!", "Laporan pelanggaran berhasil ditambahkan.", "success");
      }
      setForm({ siswaId: "", violationId: "", tanggal: new Date().toISOString().slice(0, 10), keterangan: "" });
      setEditingId(null);
      setFormVisible(false);
      fetchData();
    } catch (err) {
      let errorMessage = "Terjadi kesalahan saat menyimpan data.";
      if (err.response?.data?.error) errorMessage = err.response.data.error;
      Swal.fire("Gagal", errorMessage, "error");
    }
  };

  const handleEdit = (item) => {
    setForm({
      siswaId: item.siswaId,
      violationId: item.violationId,
      tanggal: item.tanggal?.slice(0, 10) || new Date().toISOString().slice(0, 10),
      keterangan: item.keterangan || "",
    });
    setEditingId(item.id);
    setFormVisible(true);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data laporan tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`/api/student-violations/${id}`, axiosConfig);
          Swal.fire("Terhapus!", "Laporan telah dihapus.", "success");
          fetchData();
        } catch (err) {
          Swal.fire("Gagal", "Gagal menghapus data.", "error");
        }
      }
    });
  };

  const handleDetail = (item) => {
    const siswa = siswaList.find(s => s.id === item.siswaId)?.nama || "-";
    const violation = violationList.find(v => v.id === item.violationId)?.nama || "-";
    Swal.fire({
      title: `<strong>Detail Laporan Pelanggaran</strong>`,
      html: `
        <div class="text-left">
          <p><b>Nama Siswa:</b> ${siswa}</p>
          <p><b>Pelanggaran:</b> ${violation}</p>
          <p><b>Tanggal:</b> ${item.tanggal?.slice(0, 10) || "-"}</p>
          <p><b>Keterangan:</b></p>
          <p class="text-gray-600 italic">${item.keterangan || "-"}</p>
        </div>
      `,
      icon: "info",
      width: "500px"
    });
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    let filtered = data.filter((item) => {
      const siswa = siswaList.find(s => s.id === item.siswaId)?.nama?.toLowerCase() || "";
      const violation = violationList.find(v => v.id === item.violationId)?.nama?.toLowerCase() || "";
      return siswa.includes(value) || violation.includes(value) || (item.keterangan || "").toLowerCase().includes(value);
    });
    setFiltered(filtered);
  };
  const resetFilters = () => {
    setSearchTerm("");
    setFiltered(data);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
          <FiInfo /> Laporan Pelanggaran Siswa
        </h2>
        <button
          onClick={() => {
            setForm({ siswaId: "", violationId: "", tanggal: new Date().toISOString().slice(0, 10), keterangan: "" });
            setEditingId(null);
            setFormVisible(true);
          }}
          className="bg-[#003366] text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FiPlus /> Tambah Laporan
        </button>
      </div>
      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        <button
          onClick={resetFilters}
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
                <option key={siswa.id} value={siswa.id}>{siswa.nama}</option>
              ))}
            </select>
            <select
              name="violationId"
              value={form.violationId}
              onChange={handleChange}
              required
              className="border p-3 rounded"
            >
              <option value="">Pilih Pelanggaran</option>
              {violationList.map((v) => (
                <option key={v.id} value={v.id}>{v.nama}</option>
              ))}
            </select>
            <input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
              required
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
                <th className="border px-4 py-2 text-left">Nama Siswa</th>
                <th className="border px-4 py-2 text-left">Pelanggaran</th>
                <th className="border px-4 py-2 text-center">Tanggal</th>
                <th className="border px-4 py-2 text-left">Keterangan</th>
                <th className="border px-4 py-2 text-center">Point</th>
                <th className="border px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? (
                filtered.map((item) => {
                  const siswa = siswaList.find(s => s.id === item.siswaId)?.nama || "-";
                  const violation = violationList.find(v => v.id === item.violationId);
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="border px-4 py-2">{siswa}</td>
                      <td className="border px-4 py-2">{violation?.nama || "-"}</td>
                      <td className="border px-4 py-2 text-center">{item.tanggal?.slice(0, 10) || "-"}</td>
                      <td className="border px-4 py-2">{item.keterangan}</td>
                      <td className="border px-4 py-2 text-center font-semibold">{violation?.point ?? violation?.poin ?? 0}</td>
                      <td className="border px-4 py-2 text-center space-x-2">
                        <button
                          onClick={() => handleDetail(item)}
                          title="Detail"
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded"
                        >
                          <FiInfo />
                        </button>
                        <button
                          onClick={() => handleEdit(item)}
                          title="Edit"
                          className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-gray-500">
                    Tidak ada data laporan.
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

export default StudentViolation;
