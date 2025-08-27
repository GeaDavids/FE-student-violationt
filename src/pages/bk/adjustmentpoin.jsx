import API from "../../api/api";
import React, { useEffect, useState } from "react";
import { FiSearch, FiUserCheck, FiUsers, FiTrendingDown } from "react-icons/fi";

import {
  getStudentsForMonitoring,
  getStudentMonitoringDetail,
  createPointAdjustment,
  getAllPointAdjustments,
  getAdjustmentStatistics,
  getPointAdjustmentDetail,
  updatePointAdjustment,
} from "../../api/pointAdjustment";

const AdjustmentPoin = () => {
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({
    alasan: "",
    keterangan: "",
    bukti: null,
  });
  const [editError, setEditError] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    pointPengurangan: "",
    alasan: "",
    keterangan: "",
    bukti: null,
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
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm({ ...form, [name]: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
    setFormError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.pointPengurangan || !form.alasan) {
      setFormError("Poin pengurangan dan alasan wajib diisi");
      return;
    }
    try {
      // Kirim sebagai FormData jika ada file
      let dataToSend;
      if (form.bukti) {
        dataToSend = new FormData();
        dataToSend.append("pointPengurangan", form.pointPengurangan);
        dataToSend.append("alasan", form.alasan);
        dataToSend.append("keterangan", form.keterangan);
        dataToSend.append("bukti", form.bukti);
      } else {
        dataToSend = {
          pointPengurangan: form.pointPengurangan,
          alasan: form.alasan,
          keterangan: form.keterangan,
        };
      }
      await createPointAdjustment(selectedStudent.id, dataToSend);
      setForm({
        pointPengurangan: "",
        alasan: "",
        keterangan: "",
        bukti: null,
      });
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
  const handleShowDetail = async (adj) => {
    // Ambil detail terbaru dari backend
    try {
      const detail = await getPointAdjustmentDetail(adj.id);
      setDetailData(detail);
    } catch {
      setDetailData(adj);
    }
    setShowDetail(true);
    setEditMode(false);
    setEditForm({ alasan: "", keterangan: "", bukti: null });
    setEditError("");
  };
  const handleEditClick = () => {
    setEditForm({
      alasan: detailData.alasan || "",
      keterangan: detailData.keterangan || "",
      bukti: null,
    });
    setEditMode(true);
    setEditError("");
  };

  const handleEditFormChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setEditForm({ ...editForm, [name]: files[0] });
    } else {
      setEditForm({ ...editForm, [name]: value });
    }
    setEditError("");
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editForm.alasan) {
      setEditError("Alasan wajib diisi");
      return;
    }
    try {
      let dataToSend;
      if (editForm.bukti) {
        dataToSend = new FormData();
        dataToSend.append("alasan", editForm.alasan);
        dataToSend.append("keterangan", editForm.keterangan);
        dataToSend.append("bukti", editForm.bukti);
      } else {
        dataToSend = {
          alasan: editForm.alasan,
          keterangan: editForm.keterangan,
        };
      }
      await updatePointAdjustment(detailData.id, dataToSend);
      setEditMode(false);
      setShowDetail(false);
      fetchAdjustments();
      alert("Adjustment berhasil diupdate!");
    } catch (err) {
      setEditError(err?.response?.data?.error || "Gagal update adjustment");
    }
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

      {/* Search Siswa Saja */}
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
        {/* Hasil pencarian satu siswa */}
        {!loading && students.length > 0 && (
          <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <div className="font-semibold text-lg text-blue-900">
                {students[0].nama}
              </div>
              <div className="text-gray-500 text-sm">
                NISN: {students[0].nisn} | Kelas:{" "}
                {students[0].kelas?.nama || "-"}
              </div>
              <div className="text-blue-700 font-bold mt-1">
                Total Score: {students[0].totalScore}
              </div>
            </div>
            <div>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm shadow"
                onClick={() => handleSelectStudent(students[0])}
              >
                Tangani
              </button>
            </div>
          </div>
        )}
        {!loading && students.length === 0 && search && (
          <div className="text-center text-gray-400 py-6">
            Tidak ada siswa ditemukan.
          </div>
        )}
        {loading && (
          <div className="text-center text-gray-400 py-6">Loading...</div>
        )}
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
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Bukti (opsional, PDF/JPG/PNG)
                </label>
                <input
                  type="file"
                  name="bukti"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                  onChange={handleFormChange}
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
            {!editMode ? (
              <>
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
                    <b>Bukti:</b>{" "}
                    {detailData.bukti ? (
                      <a
                        href={
                          detailData.bukti.startsWith("http")
                            ? detailData.bukti
                            : `${API.defaults.baseURL.replace(/\/api$/, "")}${
                                detailData.bukti
                              }`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline"
                      >
                        Lihat Bukti
                      </a>
                    ) : (
                      "-"
                    )}
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
                <div className="flex gap-2 mt-4">
                  <button
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-1 rounded"
                    onClick={handleEditClick}
                  >
                    Edit
                  </button>
                </div>
              </>
            ) : (
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Alasan
                  </label>
                  <input
                    type="text"
                    name="alasan"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={editForm.alasan}
                    onChange={handleEditFormChange}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Keterangan (opsional)
                  </label>
                  <textarea
                    name="keterangan"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                    value={editForm.keterangan}
                    onChange={handleEditFormChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1">
                    Bukti (opsional, PDF/JPG/PNG)
                  </label>
                  <input
                    type="file"
                    name="bukti"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="border border-gray-300 rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-200"
                    onChange={handleEditFormChange}
                  />
                </div>
                {editError && (
                  <div className="text-red-500 text-sm">{editError}</div>
                )}
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
                  >
                    Simpan
                  </button>
                  <button
                    type="button"
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-1 rounded"
                    onClick={() => setEditMode(false)}
                  >
                    Batal
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdjustmentPoin;
