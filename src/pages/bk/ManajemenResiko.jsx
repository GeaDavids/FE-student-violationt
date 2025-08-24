import React, { useEffect, useState } from "react";
import axios from "../../api/axios";
import Swal from "sweetalert2";

const ManajemenResiko = () => {
  const [sanksiList, setSanksiList] = useState([]);
  const [selectedSanksi, setSelectedSanksi] = useState("");
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");

  // Ambil daftar sanksi
  useEffect(() => {
    const fetchSanksi = async () => {
      try {
        const res = await axios.get("/bk/sanksi");
        setSanksiList(res.data.data || []);
      } catch {
        setSanksiList([]);
      }
    };
    fetchSanksi();
  }, []);

  // Ambil daftar templates
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const res = await axios.get("/bk/sanksi-templates");
        setTemplates(res.data.data || []);
      } catch {
        setTemplates([]);
      }
    };
    fetchTemplates();
  }, []);

  // Ambil siswa sesuai sanksi
  const fetchStudents = async (sanksiId) => {
    setLoading(true);
    try {
      const res = await axios.get("/bk/eligible-students-for-sanksi", {
        params: { sanksiId },
      });
      setStudents(res.data.data || []);
    } catch (err) {
      Swal.fire("Error", "Gagal mengambil data siswa", "error");
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSanksiChange = (e) => {
    setSelectedSanksi(e.target.value);
    setSelectedStudents([]); // Reset selection saat ganti sanksi
    if (e.target.value) {
      fetchStudents(e.target.value);
    } else {
      setStudents([]);
    }
  };

  // Handle checkbox selection
  const handleStudentSelect = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedStudents.length === students.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map((s) => s.id));
    }
  };

  // Batch kirim sanksi
  const handleBatchKirimSanksi = async () => {
    if (selectedStudents.length === 0) {
      Swal.fire("Error", "Pilih minimal 1 siswa", "error");
      return;
    }

    const result = await Swal.fire({
      title: `Kirim Sanksi ke ${selectedStudents.length} Siswa?`,
      html: `
        <div class="mb-3">
          <label class="block text-sm font-medium mb-1">Template (opsional):</label>
          <select id="template-select" class="swal2-select">
            <option value="">-- Pilih Template --</option>
            ${templates
              .filter((t) => !selectedSanksi || t.sanksiId == selectedSanksi)
              .map((t) => `<option value="${t.id}">${t.nama}</option>`)
              .join("")}
          </select>
        </div>
        <input id='catatan-input' class='swal2-input' placeholder='Catatan (opsional)'>
      `,
      showCancelButton: true,
      confirmButtonText: "Kirim Semua",
      cancelButtonText: "Batal",
      preConfirm: () => {
        const templateSelect = document.getElementById("template-select");
        const catatanInput = document.getElementById("catatan-input");
        return {
          templateId: templateSelect?.value || null,
          catatan: catatanInput?.value || "",
        };
      },
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await axios.post("/bk/batch-kirim-sanksi", {
          studentIds: selectedStudents,
          sanksiId: parseInt(selectedSanksi),
          catatan: result.value.catatan,
          templateId: result.value.templateId
            ? parseInt(result.value.templateId)
            : null,
        });

        Swal.fire("Sukses", response.data.message, "success");
        setSelectedStudents([]);
        fetchStudents(selectedSanksi);
      } catch (err) {
        console.error("Error batch kirim sanksi:", err);
        Swal.fire(
          "Error",
          err?.response?.data?.error || "Gagal mengirim sanksi batch",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">
        Daftar Siswa Sesuai Range Sanksi
      </h1>
      <div className="mb-6 flex gap-4 items-end">
        <div>
          <label className="block font-semibold mb-1">Pilih Sanksi</label>
          <select
            className="border rounded px-3 py-2 w-64"
            value={selectedSanksi}
            onChange={handleSanksiChange}
          >
            <option value="">-- Pilih Sanksi --</option>
            {sanksiList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nama} (≤ {s.point})
              </option>
            ))}
          </select>
        </div>
        {selectedSanksi && (
          <div className="text-sm text-gray-600">
            <strong>Sanksi terpilih:</strong>{" "}
            {sanksiList.find((s) => s.id == selectedSanksi)?.nama}
          </div>
        )}
        {selectedStudents.length > 0 && (
          <button
            onClick={handleBatchKirimSanksi}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            Kirim ke {selectedStudents.length} Siswa
          </button>
        )}
      </div>
      <div className="bg-white rounded shadow p-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Memuat data siswa...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            {selectedSanksi
              ? "Tidak ada siswa yang memenuhi kriteria untuk sanksi ini."
              : "Silakan pilih sanksi terlebih dahulu."}
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Ditemukan <strong>{students.length}</strong> siswa yang memenuhi
                kriteria
                {selectedStudents.length > 0 && (
                  <span className="ml-2 text-blue-600">
                    ({selectedStudents.length} dipilih)
                  </span>
                )}
              </div>
              {students.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedStudents.length === students.length
                    ? "Batal Pilih Semua"
                    : "Pilih Semua"}
                </button>
              )}
            </div>
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-2 py-2 border w-12">
                    <input
                      type="checkbox"
                      checked={
                        selectedStudents.length === students.length &&
                        students.length > 0
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-2 border">NISN</th>
                  <th className="px-4 py-2 border">Nama</th>
                  <th className="px-4 py-2 border">Kelas</th>
                  <th className="px-4 py-2 border">Total Skor</th>
                  <th className="px-4 py-2 border">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-2 py-2 border text-center">
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(s.id)}
                        onChange={() => handleStudentSelect(s.id)}
                      />
                    </td>
                    <td className="px-4 py-2 border">{s.nisn}</td>
                    <td className="px-4 py-2 border">{s.nama}</td>
                    <td className="px-4 py-2 border">{s.kelas}</td>
                    <td className="px-4 py-2 border text-center">
                      {s.totalScore}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <KirimSanksiButton
                        student={s}
                        sanksiId={selectedSanksi}
                        onSuccess={() => fetchStudents(selectedSanksi)}
                        disabled={loading || !selectedSanksi}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default ManajemenResiko;

function KirimSanksiButton({ student, sanksiId, onSuccess, disabled }) {
  const [loading, setLoading] = useState(false);

  const handleKirim = async () => {
    const result = await Swal.fire({
      title: `Kirim Sanksi untuk ${student.nama}?`,
      html: `<input id='catatan-input' class='swal2-input' placeholder='Catatan (opsional)'>`,
      showCancelButton: true,
      confirmButtonText: "Kirim",
      cancelButtonText: "Batal",
      preConfirm: () => {
        const input = document.getElementById("catatan-input");
        return input ? input.value : "";
      },
    });

    if (result.isConfirmed) {
      setLoading(true);
      try {
        const response = await axios.post("/bk/kirim-sanksi", {
          studentId: student.id,
          sanksiId: parseInt(sanksiId),
          catatan: result.value,
        });

        Swal.fire(
          "Sukses",
          response.data.message || "Sanksi berhasil dikirim",
          "success"
        );
        if (onSuccess) onSuccess();
      } catch (err) {
        console.error("Error kirim sanksi:", err);
        Swal.fire(
          "Error",
          err?.response?.data?.error || "Gagal mengirim sanksi",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <button
      className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
      onClick={handleKirim}
      disabled={disabled || loading}
    >
      {loading ? "Mengirim..." : "Kirim Sanksi"}
    </button>
  );
}
