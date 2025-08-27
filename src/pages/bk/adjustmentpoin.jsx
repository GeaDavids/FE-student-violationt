import React, { useEffect, useState } from "react";
import { FiSearch, FiUserCheck, FiUsers, FiTrendingDown } from "react-icons/fi";
import {
  getStudentsForMonitoring,
  getStudentMonitoringDetail,
  createPointAdjustment,
  getAllPointAdjustments,
  getAdjustmentStatistics,
} from "../../api/pointAdjustment";

const AdjustmentPoin = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    pointPengurangan: "",
    alasan: "",
    keterangan: "",
  });
  const [formError, setFormError] = useState("");
  const [adjustments, setAdjustments] = useState([]);
  const [stats, setStats] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchStudents();
    fetchStats();
    fetchAdjustments();
  }, [page, search]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await getStudentsForMonitoring({ page, search });
      setStudents(res.data);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      setStudents([]);
    }
    setLoading(false);
  };

  const fetchStats = async () => {
    try {
      const res = await getAdjustmentStatistics();
      setStats(res.data);
    } catch {}
  };

  const fetchAdjustments = async () => {
    try {
      const res = await getAllPointAdjustments({ page: 1, limit: 10 });
      setAdjustments(res.data);
    } catch {}
  };

  const handleSelectStudent = async (student) => {
    setSelectedStudent(null);
    setShowForm(false);
    setForm({ pointPengurangan: "", alasan: "", keterangan: "" });
    try {
      const detail = await getStudentMonitoringDetail(student.id);
      setSelectedStudent(detail.data);
      setShowForm(true);
    } catch {}
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pointPengurangan || !form.alasan) {
      setFormError("Poin pengurangan dan alasan wajib diisi");
      return;
    }
    try {
      await createPointAdjustment(selectedStudent.id, form);
      setForm({ pointPengurangan: "", alasan: "", keterangan: "" });
      setShowForm(false);
      fetchStudents();
      fetchAdjustments();
      fetchStats();
      alert("Adjustment berhasil!");
    } catch (err) {
      setFormError(err?.response?.data?.error || "Gagal adjustment");
    }
  };

  // Open detail popup for adjustment
  const handleShowDetail = (adj) => {
    setDetailData(adj);
    setShowDetail(true);
  };

  // Close detail popup
  const handleCloseDetail = () => {
    setShowDetail(false);
    setDetailData(null);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-blue-900 mb-1">
            Penanganan Siswa
          </h1>
          <p className="text-gray-500 text-sm">
            Fitur pengurangan poin pelanggaran untuk siswa yang telah melakukan
            perbaikan perilaku.
          </p>
        </div>
      </div>

      {/* Statistik */}
      {stats && (
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-xl shadow flex items-center gap-4 p-5">
            <div className="bg-blue-200/60 rounded-full p-3">
              <FiTrendingDown className="text-2xl text-blue-700" />
            </div>
            <div>
              <div className="text-gray-500 text-xs font-semibold">
                Total Penanganan
              </div>
              <div className="text-2xl font-bold text-blue-900">
                {stats.totalAdjustments}
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-xl shadow flex items-center gap-4 p-5">
            <div className="bg-green-200/60 rounded-full p-3">
              <FiUserCheck className="text-2xl text-green-700" />
            </div>
            <div>
              <div className="text-gray-500 text-xs font-semibold">
                Total Poin Dikurangi
              </div>
              <div className="text-2xl font-bold text-green-900">
                {stats.totalPointsReduced}
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-xl shadow flex items-center gap-4 p-5">
            <div className="bg-yellow-200/60 rounded-full p-3">
              <FiUsers className="text-2xl text-yellow-700" />
            </div>
            <div>
              <div className="text-gray-500 text-xs font-semibold">
                Siswa Terpengaruh
              </div>
              <div className="text-2xl font-bold text-yellow-900">
                {stats.studentsAffected}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search & Table Siswa */}
      <div className="mb-10 bg-white rounded-xl shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="relative w-full md:w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <FiSearch />
            </span>
            <input
              type="text"
              className="pl-10 pr-3 py-2 border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Cari nama/NISN siswa..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                <th className="py-2 px-3 text-left font-semibold">NISN</th>
                <th className="py-2 px-3 text-left font-semibold">Nama</th>
                <th className="py-2 px-3 text-left font-semibold">Kelas</th>
                <th className="py-2 px-3 text-center font-semibold">
                  Total Score
                </th>
                <th className="py-2 px-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">
                    Loading...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-6 text-gray-400">
                    Tidak ada data
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b hover:bg-blue-50 transition"
                  >
                    <td className="py-2 px-3">{s.nisn}</td>
                    <td className="py-2 px-3 font-medium">{s.nama}</td>
                    <td className="py-2 px-3">{s.kelas?.nama || "-"}</td>
                    <td className="py-2 px-3 text-center font-bold text-blue-700">
                      {s.totalScore}
                    </td>
                    <td className="py-2 px-3 text-center">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-semibold text-xs shadow"
                        onClick={() => handleSelectStudent(s)}
                      >
                        Tangani
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="flex gap-2 mt-4 justify-end">
          <button
            className="px-4 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-semibold"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            Prev
          </button>
          <span className="px-2 text-gray-500 font-medium">
            Halaman {page} / {totalPages}
          </span>
          <button
            className="px-4 py-1.5 rounded-lg bg-gray-100 text-gray-600 font-semibold"
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Form Adjustment */}
      {showForm && selectedStudent && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
              onClick={() => setShowForm(false)}
              aria-label="Tutup"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-blue-900">
              Adjustment Poin Siswa
            </h2>
            <div className="mb-4 text-sm text-gray-600 space-y-1">
              <div>
                <b>Nama:</b> {selectedStudent.nama}
              </div>
              <div>
                <b>NISN:</b> {selectedStudent.nisn}
              </div>
              <div>
                <b>Kelas:</b> {selectedStudent.kelas?.nama || "-"}
              </div>
              <div>
                <b>Total Poin:</b>{" "}
                <span className="font-bold text-blue-700">
                  {selectedStudent.totalScore}
                </span>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Poin Pengurangan
                </label>
                <input
                  type="number"
                  name="pointPengurangan"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={form.pointPengurangan}
                  onChange={handleFormChange}
                  min={1}
                  required
                  placeholder="Masukkan jumlah poin yang dikurangi"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Alasan
                </label>
                <input
                  type="text"
                  name="alasan"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={form.alasan}
                  onChange={handleFormChange}
                  required
                  placeholder="Alasan pengurangan poin"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Keterangan (opsional)
                </label>
                <textarea
                  name="keterangan"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                  value={form.keterangan}
                  onChange={handleFormChange}
                  placeholder="Keterangan tambahan (opsional)"
                />
              </div>
              {formError && (
                <div className="text-red-500 text-sm font-medium">
                  {formError}
                </div>
              )}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-bold shadow"
              >
                Kirim
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Riwayat Penanganan */}
      <div className="mt-12 bg-white rounded-xl shadow p-6">
        <h2 className="text-lg font-bold mb-4 text-blue-900">
          Riwayat Penanganan
        </h2>
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                <th className="py-2 px-3 text-left font-semibold">Tanggal</th>
                <th className="py-2 px-3 text-left font-semibold">
                  Nama Siswa
                </th>
                <th className="py-2 px-3 text-left font-semibold">
                  Poin Dikurangi
                </th>
                <th className="py-2 px-3 text-left font-semibold">Alasan</th>
                <th className="py-2 px-3 text-left font-semibold">Guru/BK</th>
                <th className="py-2 px-3 text-center font-semibold">Detail</th>
              </tr>
            </thead>
            <tbody>
              {adjustments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-6 text-gray-400">
                    Belum ada adjustment
                  </td>
                </tr>
              ) : (
                adjustments.map((adj) => (
                  <tr
                    key={adj.id}
                    className="border-b hover:bg-blue-50 transition"
                  >
                    <td className="py-2 px-3">{adj.tanggal?.slice(0, 10)}</td>
                    <td className="py-2 px-3">{adj.student?.name}</td>
                    <td className="py-2 px-3">{adj.pointPengurangan}</td>
                    <td className="py-2 px-3">{adj.alasan}</td>
                    <td className="py-2 px-3">{adj.teacher?.name}</td>
                    <td className="py-2 px-3 text-center">
                      <button
                        className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-xs font-semibold"
                        onClick={() => handleShowDetail(adj)}
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup Detail Adjustment */}
      {showDetail && detailData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
              onClick={handleCloseDetail}
              aria-label="Tutup"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4 text-blue-900">
              Detail Penanganan
            </h2>
            <div className="mb-4 text-sm text-gray-600 space-y-1">
              <div>
                <b>Nama Siswa:</b> {detailData.student?.name}
              </div>
              <div>
                <b>Kelas:</b> {detailData.student?.classroom || "-"}
              </div>
              <div>
                <b>Tanggal:</b> {detailData.tanggal?.slice(0, 10)}
              </div>
              <div>
                <b>Poin Dikurangi:</b>{" "}
                <span className="font-bold text-blue-700">
                  {detailData.pointPengurangan}
                </span>
              </div>
              <div>
                <b>Alasan:</b> {detailData.alasan}
              </div>
              <div>
                <b>Keterangan:</b> {detailData.keterangan || "-"}
              </div>
              <div>
                <b>Guru/BK Penangan:</b> {detailData.teacher?.name}
              </div>
              <div>
                <b>Poin Sebelum:</b> {detailData.pointSebelum ?? "-"}
              </div>
              <div>
                <b>Poin Sesudah:</b> {detailData.pointSesudah ?? "-"}
              </div>
              <div>
                <b>Dibuat pada:</b>{" "}
                {detailData.createdAt?.slice(0, 19).replace("T", " ")}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdjustmentPoin;
