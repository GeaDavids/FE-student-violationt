import { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../../api/api";
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
  FiAward,
} from "react-icons/fi";

const LaporanSiswa = () => {
  const [dataLaporan, setDataLaporan] = useState([]);
  const [filteredLaporan, setFilteredLaporan] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [form, setForm] = useState({
    siswaId: "",
    violationId: "",
    achievementId: "",
    tglKejadian: "",
    deskripsi: "",
    reportType: "pelanggaran",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKelas, setFilterKelas] = useState("");
  const [filterTanggal, setFilterTanggal] = useState("");
  const [loading, setLoading] = useState(false);

  const [siswaList, setSiswaList] = useState([]);
  const [violationList, setViolationList] = useState([]);
  const [achievementList, setAchievementList] = useState([]);
  const [kelasList, setKelasList] = useState([]);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Helper functions
  const formatDateForInput = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  };

  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("id-ID");
  };

  const fetchLaporan = useCallback(async () => {
    try {
      setLoading(true);
      const [violationsRes, achievementsRes] = await Promise.all([
        API.get("/api/student-violations"),
        API.get("/api/student-achievements"),
      ]);

      const violations = violationsRes.data.map((item) => ({
        ...item,
        type: "pelanggaran",
        itemData: item.violation,
        points: item.violation?.point || item.pointSaat || 0,
      }));

      const achievements = achievementsRes.data.map((item) => ({
        ...item,
        type: "prestasi",
        itemData: item.achievement,
        points: item.achievement?.point || item.pointSaat || 0,
      }));

      const combinedData = [...violations, ...achievements].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );

      setDataLaporan(combinedData);
      setFilteredLaporan(combinedData);
    } catch (err) {
      console.error("Gagal mengambil data laporan:", err);
      Swal.fire("Error!", "Gagal mengambil data laporan", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSiswa = async () => {
    try {
      const res = await API.get("/api/users/students");
      setSiswaList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data siswa:", err);
    }
  };

  const fetchViolations = async () => {
    try {
      const res = await API.get("/api/violations");
      setViolationList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data jenis pelanggaran:", err);
    }
  };

  const fetchAchievements = async () => {
    try {
      const res = await API.get("/api/achievements");
      setAchievementList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data jenis prestasi:", err);
    }
  };

  const fetchKelas = async () => {
    try {
      const res = await API.get("/api/classrooms");
      setKelasList(res.data);
    } catch (err) {
      console.error("Gagal mengambil data kelas:", err);
    }
  };

  useEffect(() => {
    fetchLaporan();
    fetchSiswa();
    fetchViolations();
    fetchAchievements();
    fetchKelas();

    // Check if should show add form
    if (searchParams.get("action") === "add") {
      setFormVisible(true);
    }
  }, [fetchLaporan, searchParams]);

  useEffect(() => {
    applyFilters(searchTerm, filterKelas, filterTanggal);
  }, [activeTab, dataLaporan]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isViolation = form.reportType === "pelanggaran";
    const payload = {
      studentId: parseInt(form.siswaId),
      [isViolation ? "violationId" : "achievementId"]: parseInt(
        isViolation ? form.violationId : form.achievementId
      ),
      tanggal: form.tglKejadian,
      deskripsi: form.deskripsi,
      reporterId: JSON.parse(localStorage.getItem("user"))?.id || 1,
    };

    const apiEndpoint = isViolation
      ? "/api/student-violations"
      : "/api/student-achievements";
    const successMessage = isViolation ? "pelanggaran" : "prestasi";

    try {
      if (editingId) {
        await API.put(`${apiEndpoint}/${editingId}`, payload);
        Swal.fire(
          "Berhasil!",
          `Laporan ${successMessage} berhasil diperbarui.`,
          "success"
        );
      } else {
        await API.post(apiEndpoint, payload);
        Swal.fire(
          "Berhasil!",
          `Laporan ${successMessage} baru berhasil ditambahkan.`,
          "success"
        );
      }

      setForm({
        siswaId: "",
        violationId: "",
        achievementId: "",
        tglKejadian: "",
        deskripsi: "",
        reportType: "pelanggaran",
      });
      setEditingId(null);
      setFormVisible(false);
      fetchLaporan();

      // Remove action param from URL
      navigate("/bk/laporan-siswa", { replace: true });
    } catch (err) {
      console.error("Error:", err.response || err);
      let errorMessage = `Terjadi kesalahan saat menyimpan laporan ${successMessage}.`;
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      Swal.fire("Gagal", errorMessage, "error");
    }
  };

  const handleEdit = (laporan) => {
    setForm({
      siswaId: laporan.studentId || laporan.student?.id || "",
      violationId:
        laporan.type === "pelanggaran"
          ? laporan.violationId || laporan.violation?.id || ""
          : "",
      achievementId:
        laporan.type === "prestasi"
          ? laporan.achievementId || laporan.achievement?.id || ""
          : "",
      tglKejadian: formatDateForInput(laporan.tanggal),
      deskripsi: laporan.deskripsi || "",
      reportType: laporan.type,
    });
    setEditingId(laporan.id);
    setFormVisible(true);
  };

  const handleDelete = (laporan) => {
    const isViolation = laporan.type === "pelanggaran";
    const itemType = isViolation ? "pelanggaran" : "prestasi";
    const apiEndpoint = isViolation
      ? "/api/student-violations"
      : "/api/student-achievements";

    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: `Laporan ${itemType} tidak bisa dikembalikan!`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await API.delete(`${apiEndpoint}/${laporan.id}`);
          Swal.fire(
            "Terhapus!",
            `Laporan ${itemType} telah dihapus.`,
            "success"
          );
          fetchLaporan();
        } catch (err) {
          console.error("Error:", err.response || err);
          Swal.fire("Gagal", `Gagal menghapus laporan ${itemType}.`, "error");
        }
      }
    });
  };

  const handleDetail = (laporan) => {
    const isViolation = laporan.type === "pelanggaran";
    const itemName = isViolation
      ? laporan.violation?.nama
      : laporan.achievement?.nama;
    const itemKategori = isViolation
      ? laporan.violation?.kategori
      : laporan.achievement?.kategori;
    const points = laporan.points;

    Swal.fire({
      title: `<strong>Detail Laporan ${
        isViolation ? "Pelanggaran" : "Prestasi"
      }</strong>`,
      html: `
        <div class="text-left space-y-2">
          <p><b>Siswa:</b> ${
            laporan.student?.name || laporan.student?.user?.name || "Unknown"
          }</p>
          <p><b>NISN:</b> ${laporan.student?.nisn || "-"}</p>
          <p><b>Kelas:</b> ${laporan.student?.classroom?.namaKelas || "-"}</p>
          <p><b>Jenis ${isViolation ? "Pelanggaran" : "Prestasi"}:</b> ${
        itemName || "Unknown"
      }</p>
          <p><b>Kategori:</b> ${itemKategori || "-"}</p>
          <p><b>Poin:</b> <span class="${
            isViolation ? "text-red-600" : "text-green-600"
          }">${isViolation ? "-" : "+"}${points}</span></p>
          <p><b>Tanggal Kejadian:</b> ${formatDateForDisplay(
            laporan.tanggal
          )}</p>
          <p><b>Tanggal Dilaporkan:</b> ${formatDateForDisplay(
            laporan.createdAt
          )}</p>
          <p><b>Poin Saat Kejadian:</b> ${laporan.pointSaat || 0}</p>
          <div class="mt-3">
            <p><b>Deskripsi:</b></p>
            <p class="text-gray-600 italic bg-gray-50 p-2 rounded">${
              laporan.deskripsi || "Tidak ada deskripsi"
            }</p>
          </div>
        </div>
      `,
      icon: "info",
      width: "600px",
    });
  };

  const applyFilters = (search, kelas, tanggal) => {
    let allData = dataLaporan;

    let filtered = allData.filter((laporan) => {
      const siswaName =
        laporan.student?.name || laporan.student?.user?.name || "";
      const nisn = laporan.student?.nisn || "";
      const itemName =
        laporan.type === "pelanggaran"
          ? laporan.violation?.nama || ""
          : laporan.achievement?.nama || "";

      const matchSearch =
        siswaName.toLowerCase().includes(search) ||
        nisn.includes(search) ||
        itemName.toLowerCase().includes(search) ||
        (laporan.deskripsi || "").toLowerCase().includes(search);

      const matchKelas =
        !kelas || laporan.student?.classroom?.id === parseInt(kelas);

      let matchTanggal = true;
      if (tanggal) {
        const filterDate = new Date(tanggal).toDateString();
        const laporanDate = new Date(laporan.tanggal).toDateString();
        matchTanggal = filterDate === laporanDate;
      }

      const matchTab = activeTab === "all" || laporan.type === activeTab;

      return matchSearch && matchKelas && matchTanggal && matchTab;
    });

    setFilteredLaporan(filtered);
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    applyFilters(value, filterKelas, filterTanggal);
  };

  const handleFilterKelas = (e) => {
    const value = e.target.value;
    setFilterKelas(value);
    applyFilters(searchTerm, value, filterTanggal);
  };

  const handleFilterTanggal = (e) => {
    const value = e.target.value;
    setFilterTanggal(value);
    applyFilters(searchTerm, filterKelas, value);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterKelas("");
    setFilterTanggal("");
    setFilteredLaporan(dataLaporan);
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
          <FiFileText /> Laporan Pelanggaran & Prestasi
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
                achievementId: "",
                tglKejadian: "",
                deskripsi: "",
                reportType: "pelanggaran",
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

      {/* Tab Section */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab("all")}
          className={`pb-2 px-4 font-medium ${
            activeTab === "all"
              ? "border-b-2 border-[#003366] text-[#003366]"
              : "text-gray-500 hover:text-[#003366]"
          }`}
        >
          Semua Laporan
        </button>
        <button
          onClick={() => setActiveTab("pelanggaran")}
          className={`pb-2 px-4 font-medium ${
            activeTab === "pelanggaran"
              ? "border-b-2 border-red-500 text-red-500"
              : "text-gray-500 hover:text-red-500"
          }`}
        >
          Pelanggaran
        </button>
        <button
          onClick={() => setActiveTab("prestasi")}
          className={`pb-2 px-4 font-medium ${
            activeTab === "prestasi"
              ? "border-b-2 border-green-500 text-green-500"
              : "text-gray-500 hover:text-green-500"
          }`}
        >
          Prestasi
        </button>
      </div>

      {/* Filter Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="flex items-center border rounded px-3 py-2">
          <FiSearch className="mr-2" />
          <input
            type="text"
            placeholder="Cari siswa/pelanggaran/prestasi..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full outline-none"
          />
        </div>
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
          placeholder="Filter Tanggal"
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
          <h3 className="text-lg font-semibold mb-4">
            {editingId ? "Edit Laporan" : "Tambah Laporan"}
          </h3>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* Type Selector */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-2">
                Jenis Laporan
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value="pelanggaran"
                    checked={form.reportType === "pelanggaran"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-red-600">Pelanggaran</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="reportType"
                    value="prestasi"
                    checked={form.reportType === "prestasi"}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-green-600">Prestasi</span>
                </label>
              </div>
            </div>

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
                  {siswa.nisn} - {siswa.name || siswa.user?.name} (
                  {siswa.classroom?.namaKelas || "No Class"})
                </option>
              ))}
            </select>

            {form.reportType === "pelanggaran" ? (
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
                    {violation.nama} ({violation.point} poin)
                  </option>
                ))}
              </select>
            ) : (
              <select
                name="achievementId"
                value={form.achievementId}
                onChange={handleChange}
                required
                className="border p-3 rounded"
              >
                <option value="">Pilih Jenis Prestasi</option>
                {achievementList.map((achievement) => (
                  <option key={achievement.id} value={achievement.id}>
                    {achievement.nama} ({achievement.point} poin)
                  </option>
                ))}
              </select>
            )}

            <input
              type="date"
              name="tglKejadian"
              value={form.tglKejadian}
              onChange={handleChange}
              required
              className="border p-3 rounded"
              placeholder="Tanggal Kejadian"
            />
            <div></div>

            <textarea
              name="deskripsi"
              placeholder="Deskripsi kejadian"
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
                    siswaId: "",
                    violationId: "",
                    achievementId: "",
                    tglKejadian: "",
                    deskripsi: "",
                    reportType: "pelanggaran",
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
                <th className="border px-4 py-2 text-left">Tanggal Kejadian</th>
                <th className="border px-4 py-2 text-left">Siswa</th>
                <th className="border px-4 py-2 text-left">Kelas</th>
                <th className="border px-4 py-2 text-left">Jenis</th>
                <th className="border px-4 py-2 text-left">Item</th>
                <th className="border px-4 py-2 text-center">Poin</th>
                <th className="border px-4 py-2 text-center">Tgl Dibuat</th>
                <th className="border px-4 py-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredLaporan.length > 0 ? (
                filteredLaporan.map((laporan) => (
                  <tr key={laporan.id} className="hover:bg-gray-50">
                    <td className="border px-4 py-2">
                      {formatDateForDisplay(laporan.tanggal)}
                    </td>
                    <td
                      className="border px-4 py-2 cursor-pointer hover:text-[#003366]"
                      onClick={() => handleDetail(laporan)}
                    >
                      <div>
                        <div className="font-semibold">
                          {laporan.student?.name || laporan.student?.user?.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {laporan.student?.nisn}
                        </div>
                      </div>
                    </td>
                    <td className="border px-4 py-2">
                      {laporan.student?.classroom?.namaKelas || "-"}
                    </td>
                    <td className="border px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          laporan.type === "pelanggaran"
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }`}
                      >
                        {laporan.type === "pelanggaran"
                          ? "Pelanggaran"
                          : "Prestasi"}
                      </span>
                    </td>
                    <td className="border px-4 py-2">
                      <div>
                        <div className="font-medium">
                          {laporan.type === "pelanggaran"
                            ? laporan.violation?.nama
                            : laporan.achievement?.nama}
                        </div>
                        <div className="text-sm text-gray-500">
                          {laporan.type === "pelanggaran"
                            ? laporan.violation?.kategori
                            : laporan.achievement?.kategori}
                        </div>
                      </div>
                    </td>
                    <td className="border px-4 py-2 text-center font-bold">
                      <span
                        className={
                          laporan.type === "pelanggaran"
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {laporan.type === "pelanggaran" ? "-" : "+"}
                        {laporan.points || laporan.pointSaat || 0}
                      </span>
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {formatDateForDisplay(laporan.createdAt)}
                      </span>
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
                        onClick={() => handleDelete(laporan)}
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
                  <td colSpan="8" className="text-center py-4 text-gray-500">
                    Tidak ada data laporan ditemukan.
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
            <FiFileText /> Total Laporan
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {dataLaporan.length}
          </p>
        </div>
        <div className="bg-red-100 p-4 rounded-lg">
          <h3 className="font-semibold text-red-800 flex items-center gap-2">
            <FiAlertCircle /> Pelanggaran
          </h3>
          <p className="text-2xl font-bold text-red-600">
            {dataLaporan.filter((l) => l.type === "pelanggaran").length}
          </p>
        </div>
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="font-semibold text-green-800 flex items-center gap-2">
            <FiAward /> Prestasi
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {dataLaporan.filter((l) => l.type === "prestasi").length}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-800">Bulan Ini</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {
              dataLaporan.filter((l) => {
                const laporanDate = new Date(l.tanggal);
                const currentDate = new Date();
                return (
                  laporanDate.getMonth() === currentDate.getMonth() &&
                  laporanDate.getFullYear() === currentDate.getFullYear()
                );
              }).length
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default LaporanSiswa;
