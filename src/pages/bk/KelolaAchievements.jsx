import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import achievementAPI from "../../api/achievement";
import {
  FiAward,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiRefreshCw,
  FiTag,
  FiActivity,
  FiStar,
} from "react-icons/fi";

const KelolaAchievements = () => {
  const [achievements, setAchievements] = useState([]);
  const [filteredAchievements, setFilteredAchievements] = useState([]);
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

  const kategoris = [
    "akademik",
    "non_akademik",
    "olahraga",
    "kesenian",
    "lainnya",
  ];

  const fetchAchievements = useCallback(async () => {
    try {
      setLoading(true);
      const res = await achievementAPI.getAllAchievements();
      setAchievements(res.data);
      setFilteredAchievements(res.data);
    } catch (err) {
      console.error("Gagal mengambil data prestasi:", err);
      Swal.fire("Error!", "Gagal mengambil data prestasi", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAchievements();
  }, [fetchAchievements]);

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
        await achievementAPI.updateAchievement(editingId, payload);
        Swal.fire(
          "Berhasil!",
          "Jenis prestasi berhasil diperbarui.",
          "success"
        );
      } else {
        await achievementAPI.createAchievement(payload);
        Swal.fire(
          "Berhasil!",
          "Jenis prestasi baru berhasil ditambahkan.",
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
      fetchAchievements();
    } catch (err) {
      console.error("Error:", err.response || err);
      let errorMessage = "Terjadi kesalahan saat menyimpan data.";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      Swal.fire("Gagal", errorMessage, "error");
    }
  };

  const handleEdit = (achievement) => {
    setForm({
      nama: achievement.nama,
      kategori: achievement.kategori,
      point: achievement.point.toString(),
      deskripsi: achievement.deskripsi || "",
    });
    setEditingId(achievement.id);
    setFormVisible(true);
  };

  const handleDelete = (achievement) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: `Jenis prestasi "${achievement.nama}" tidak bisa dikembalikan!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await achievementAPI.deleteAchievement(achievement.id);
          Swal.fire("Terhapus!", "Jenis prestasi telah dihapus.", "success");
          fetchAchievements();
        } catch (err) {
          console.error("Error:", err.response || err);
          let errorMessage = "Gagal menghapus jenis prestasi.";
          if (err.response?.data?.error) {
            errorMessage = err.response.data.error;
          }
          Swal.fire("Gagal", errorMessage, "error");
        }
      }
    });
  };

  const applyFilters = (search, kategori) => {
    let filtered = achievements.filter((achievement) => {
      const matchSearch =
        achievement.nama.toLowerCase().includes(search.toLowerCase()) ||
        (achievement.deskripsi || "")
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchKategori = !kategori || achievement.kategori === kategori;

      return matchSearch && matchKategori;
    });

    setFilteredAchievements(filtered);
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
    setFilteredAchievements(achievements);
  };

  const getKategoriBadgeColor = (kategori) => {
    switch (kategori) {
      case "AKADEMIK":
        return "bg-blue-100 text-blue-800";
      case "NON-AKADEMIK":
        return "bg-purple-100 text-purple-800";
      case "OLAHRAGA":
        return "bg-orange-100 text-orange-800";
      case "SENI":
        return "bg-pink-100 text-pink-800";
      case "KEPEMIMPINAN":
        return "bg-indigo-100 text-indigo-800";
      case "TEKNOLOGI":
        return "bg-cyan-100 text-cyan-800";
      case "LAINNYA":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPointColor = (point) => {
    if (point <= 10) return "text-green-600";
    if (point <= 30) return "text-blue-600";
    if (point <= 50) return "text-purple-600";
    return "text-gold-600";
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
          <FiAward /> Kelola Jenis Prestasi
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
          <FiPlus /> Tambah Jenis Prestasi
        </button>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center border rounded px-3 py-2">
          <FiSearch className="mr-2" />
          <input
            type="text"
            placeholder="Cari nama prestasi..."
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
            fetchAchievements();
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
            {editingId ? "Edit Jenis Prestasi" : "Tambah Jenis Prestasi"}
          </h3>

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
              placeholder="Poin Prestasi"
              value={form.point}
              onChange={handleChange}
              required
              min="1"
              className="border p-3 rounded"
            />

            <div></div>

            <textarea
              name="deskripsi"
              placeholder="Deskripsi prestasi (opsional)"
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
                <th className="border px-4 py-2 text-left">Nama Prestasi</th>
                <th className="border px-4 py-2 text-center">Kategori</th>
                <th className="border px-4 py-2 text-center">Poin</th>
                <th className="border px-4 py-2 text-left">Deskripsi</th>
                <th className="border px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredAchievements.length > 0 ? (
                filteredAchievements.map((achievement) => (
                  <tr key={achievement.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">
                      <div className="font-semibold text-[#003366] flex items-center gap-2">
                        <FiStar className="text-yellow-500" />
                        {achievement.nama}
                      </div>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getKategoriBadgeColor(
                          achievement.kategori
                        )}`}
                      >
                        {achievement.kategori}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <span
                        className={`font-bold text-lg ${getPointColor(
                          achievement.point
                        )}`}
                      >
                        +{achievement.point}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      <div className="text-sm text-gray-600 max-w-xs">
                        {achievement.deskripsi || "-"}
                      </div>
                    </td>
                    <td className="border px-4 py-2 text-center space-x-2">
                      <button
                        onClick={() => handleEdit(achievement)}
                        title="Edit"
                        className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded"
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        onClick={() => handleDelete(achievement)}
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
                    Tidak ada data jenis prestasi ditemukan.
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
            {achievements.length}
          </p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg">
          <h3 className="font-semibold text-purple-800 flex items-center gap-2">
            <FiTag /> Akademik
          </h3>
          <p className="text-2xl font-bold text-purple-600">
            {achievements.filter((a) => a.kategori === "AKADEMIK").length}
          </p>
        </div>
        <div className="bg-orange-100 p-4 rounded-lg">
          <h3 className="font-semibold text-orange-800 flex items-center gap-2">
            <FiTag /> Olahraga
          </h3>
          <p className="text-2xl font-bold text-orange-600">
            {achievements.filter((a) => a.kategori === "OLAHRAGA").length}
          </p>
        </div>
        <div className="bg-pink-100 p-4 rounded-lg">
          <h3 className="font-semibold text-pink-800 flex items-center gap-2">
            <FiTag /> Lainnya
          </h3>
          <p className="text-2xl font-bold text-pink-600">
            {
              achievements.filter(
                (a) => a.kategori !== "AKADEMIK" && a.kategori !== "OLAHRAGA"
              ).length
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default KelolaAchievements;
