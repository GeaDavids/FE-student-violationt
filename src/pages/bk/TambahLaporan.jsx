import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const TambahLaporan = () => {
  const [form, setForm] = useState({
    studentId: "",
    violationId: "",
    tanggal: new Date().toISOString().slice(0, 10),
    waktu: "",
    deskripsi: "",
    evidenceUrl: "",
  });
  const [studentList, setStudentList] = useState([]);
  const [violationList, setViolationList] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const axiosConfig = {
    withCredentials: true,
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await axios.get("/api/users/students", axiosConfig);
        setStudentList(res.data);
      } catch {}
    };
    const fetchViolation = async () => {
      try {
        const res = await axios.get("/api/violations", axiosConfig);
        setViolationList(res.data);
      } catch {}
    };
    fetchStudents();
    fetchViolation();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      studentId: form.studentId,
      violationId: form.violationId,
      tanggal: form.tanggal,
      waktu: form.waktu || undefined,
      deskripsi: form.deskripsi || undefined,
      evidenceUrl: form.evidenceUrl || undefined,
    };
    try {
      await axios.post("/api/student-violations", payload, axiosConfig);
      Swal.fire("Berhasil!", "Laporan pelanggaran berhasil ditambahkan.", "success");
      navigate("/bk/pelanggaran");
    } catch (err) {
      let errorMessage = "Terjadi kesalahan saat menyimpan data.";
      if (err.response?.data?.error) errorMessage = err.response.data.error;
      Swal.fire("Gagal", errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      <h2 className="text-2xl md:text-3xl font-bold text-[#003366] mb-2">Tambah Laporan Pelanggaran</h2>
      <p className="text-gray-500 mb-6">Isi form berikut untuk melaporkan pelanggaran siswa.</p>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm mb-1">Siswa <span className="text-red-500">*</span></label>
          <select
            name="studentId"
            value={form.studentId}
            onChange={handleChange}
            required
            className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#003366]"
          >
            <option value="">Pilih Siswa</option>
            {studentList.map((student) => (
              <option key={student.id} value={student.id}>{student.user?.name} ({student.nisn})</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm mb-1">Pelanggaran <span className="text-red-500">*</span></label>
          <select
            name="violationId"
            value={form.violationId}
            onChange={handleChange}
            required
            className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#003366]"
          >
            <option value="">Pilih Pelanggaran</option>
            {violationList.map((v) => (
              <option key={v.id} value={v.id}>{v.nama}</option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm mb-1">Tanggal <span className="text-red-500">*</span></label>
          <input
            type="date"
            name="tanggal"
            value={form.tanggal}
            onChange={handleChange}
            required
            className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#003366]"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm mb-1">Waktu</label>
          <input
            type="time"
            name="waktu"
            value={form.waktu}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#003366]"
            placeholder="Waktu (opsional)"
          />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="font-medium text-sm mb-1">Link Bukti</label>
          <input
            type="text"
            name="evidenceUrl"
            value={form.evidenceUrl}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#003366]"
            placeholder="Link Bukti (opsional)"
          />
        </div>
        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="font-medium text-sm mb-1">Deskripsi</label>
          <textarea
            name="deskripsi"
            placeholder="Deskripsi (opsional)"
            value={form.deskripsi}
            onChange={handleChange}
            className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#003366]"
            rows="2"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-[#003366] hover:bg-[#002244] transition text-white px-6 py-3 rounded font-semibold md:col-span-2 mt-2 shadow disabled:opacity-60"
        >
          {loading ? "Menyimpan..." : "Simpan Laporan"}
        </button>
      </form>
    </div>
  );
};

export default TambahLaporan;
