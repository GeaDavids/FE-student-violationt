import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import API from "../../api/api";
import {
  FiAlertTriangle,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiTag,
  FiActivity,
} from "react-icons/fi";

const KelolaViolations = () => {
  const [violations, setViolations] = useState([]);
  const [filteredViolations, setFilteredViolations] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    nama: "",
    kategori: "",
    point: "",
    deskripsi: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKategori, setFilterKategori] = useState("");
  const [loading, setLoading] = useState(false);

  const kategoris = ["RINGAN", "SEDANG", "BERAT", "SANGAT BERAT"];

  const fetchViolations = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("/api/violations");
      setViolations(res.data);
      setFilteredViolations(res.data);
    } catch (err) {
      console.error("Gagal mengambil data pelanggaran:", err);
      Swal.fire("Error!", "Gagal mengambil data pelanggaran", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchViolations();
  }, [fetchViolations]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (parseInt(form.point) <= 0) {
      Swal.fire("Error!", "Poin harus lebih dari 0", "error");
      return;
    }

    const payload = {
      nama: form.nama,
      kategori: form.kategori,
      point: parseInt(form.point),
      deskripsi: form.deskripsi,
    };

    try {
      if (editingId) {
        await API.put(`/api/violations/${editingId}`, payload);
        Swal.fire(
          "Berhasil!",
          "Jenis pelanggaran berhasil diperbarui.",
          "success"
        );
      } else {
        await API.post("/api/violations", payload);
        Swal.fire(
          "Berhasil!",
          "Jenis pelanggaran baru berhasil ditambahkan.",
          "success"
        );
      }

      setForm({
        nama: "",
        kategori: "",
        point: "",
        deskripsi: "",
      });
      setEditingId(null);
      setFormVisible(false);
      fetchViolations();
    } catch (err) {
      console.error("Error:", err.response || err);
      let errorMessage = "Terjadi kesalahan saat menyimpan data.";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      Swal.fire("Gagal", errorMessage, "error");
    }
  };

  const handleEdit = (violation) => {
    setForm({
      nama: violation.nama,
      kategori: violation.kategori,
      point: violation.point.toString(),
      deskripsi: violation.deskripsi || "",
    });
    setEditingId(violation.id);
    setFormVisible(true);
  };

  const handleDelete = (violation) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: `Jenis pelanggaran "${violation.nama}" tidak bisa dikembalikan!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`/api/violations/${violation.id}`);
          Swal.fire("Terhapus!", "Jenis pelanggaran telah dihapus.", "success");
          fetchViolations();
        } catch (err) {
          console.error("Error:", err.response || err);
          let errorMessage = "Gagal menghapus jenis pelanggaran.";
          if (err.response?.data?.error) {
            errorMessage = err.response.data.error;
          }
          Swal.fire("Gagal", errorMessage, "error");
        }
      }
    });
  };

  const applyFilters = (search, kategori) => {
    let filtered = violations.filter((violation) => {
      const matchSearch =
        violation.nama.toLowerCase().includes(search.toLowerCase()) ||
        (violation.deskripsi || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchKategori = !kategori || violation.kategori === kategori;

      return matchSearch && matchKategori;
    });

    setFilteredViolations(filtered);
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(value, filterKategori);
  };

  const handleFilterKategori = (e) => {
    const value = e.target.value;
    setFilterKategori(value);
    applyFilters(searchTerm, value);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterKategori("");
    setFilteredViolations(violations);
  };

  const getKategoriBadgeColor = (kategori) => {
    switch (kategori) {
      case "RINGAN":
        return "bg-green-100 text-green-800";
      case "SEDANG":
        return "bg-yellow-100 text-yellow-800";
      case "BERAT":
        return "bg-orange-100 text-orange-800";
      case "SANGAT BERAT":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPointColor = (point) => {
    if (point <= 10) return "text-green-600";
    if (point <= 30) return "text-yellow-600";
    if (point <= 50) return "text-orange-600";
    return "text-red-600";
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
              nama: "",
              kategori: "",
              point: "",
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center border rounded px-3 py-2">
          <FiSearch className="mr-2" />
          <input
            type="text"
            placeholder="Cari nama pelanggaran..."
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
          {kategoris.map((kategori) => (
            <option key={kategori} value={kategori}>
              {kategori}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            fetchViolations();
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
            {editingId ? "Edit Jenis Pelanggaran" : "Tambah Jenis Pelanggaran"}
          </h3>

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
              <option value="">Pilih Kategori</option>
              {kategoris.map((kategori) => (
                <option key={kategori} value={kategori}>
                  {kategori}
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
              min="1"
              className="border p-3 rounded"
            />

            <div></div>

            <textarea
              name="deskripsi"
              placeholder="Deskripsi pelanggaran (opsional)"
              value={form.deskripsi}
              onChange={handleChange}
              className="border p-3 rounded md:col-span-2"
              rows="3"
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
                    nama: "",
                    kategori: "",
                    point: "",
                    deskripsi: "",
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
                <th className="border px-4 py-2 text-left">Nama Pelanggaran</th>
                <th className="border px-4 py-2 text-center">Kategori</th>
                <th className="border px-4 py-2 text-center">Poin</th>
                <th className="border px-4 py-2 text-left">Deskripsi</th>
                <th className="border px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredViolations.length > 0 ? (
                filteredViolations.map((violation) => (
                  <tr key={violation.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">
                      <div className="font-semibold text-[#003366]">
                        {violation.nama}
                      </div>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getKategoriBadgeColor(
                          violation.kategori
                        )}`}
                      >
                        {violation.kategori}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <span
                        className={`font-bold text-lg ${getPointColor(
                          violation.point
                        )}`}
                      >
                        -{violation.point}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      <div className="text-sm text-gray-600 max-w-xs">
                        {violation.deskripsi || "-"}
                      </div>
                    </td>
                    <td className="border px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(violation)}
                        title="Edit"
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(violation)}
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
                    Tidak ada data jenis pelanggaran ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-800 flex items-center gap-2">
            <FiActivity /> Total Jenis
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {violations.length}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 flex items-center gap-2">
            <FiTag /> Ringan
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {violations.filter((v) => v.kategori === "RINGAN").length}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800 flex items-center gap-2">
            <FiTag /> Sedang
          </h3>
          <p className="text-2xl font-bold text-yellow-600">
            {violations.filter((v) => v.kategori === "SEDANG").length}
          </p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800 flex items-center gap-2">
            <FiTag /> Berat
          </h3>
          <p className="text-2xl font-bold text-red-600">
            {
              violations.filter(
                (v) => v.kategori === "BERAT" || v.kategori === "SANGAT BERAT"
              ).length
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default KelolaViolations;
