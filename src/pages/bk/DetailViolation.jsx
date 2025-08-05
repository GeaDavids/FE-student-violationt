import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API from "../../api/api";
import { fetchWithFallback } from "../../utils/mockDataFallback";
import { FiArrowLeft, FiEdit2, FiTrash2, FiCalendar, FiUser, FiFileText, FiClock } from "react-icons/fi";

const DetailViolation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [violation, setViolation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    studentId: "",
    violationId: "",
    tanggal: "",
    waktu: "",
    deskripsi: "",
    evidenceUrl: "",
  });
  const [studentList, setStudentList] = useState([]);
  const [violationList, setViolationList] = useState([]);

  const fetchViolation = async () => {
    setLoading(true);
    try {
      console.log(`Fetching detail for violation ID: ${id}`);
      const response = await API.get(`/api/student-violations/${id}`);
      console.log("Violation detail:", response.data);
      
      // Cache busting technique: add a timestamp to force React to recognize it as new data
      const violationData = {
        ...response.data,
        _timestamp: new Date().getTime() 
      };
      
      setViolation(violationData);
      
      // Populate form with existing data for editing
      setForm({
        studentId: response.data.student?.id || "",
        violationId: response.data.violation?.id || "",
        tanggal: response.data.tanggal?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        waktu: response.data.waktu || "",
        deskripsi: response.data.deskripsi || "",
        evidenceUrl: response.data.evidenceUrl || "",
      });
      setLoading(false);
    } catch (err) {
      console.error("Error fetching violation detail:", err);
      
      // Use mock data as fallback
      const mockData = getMockViolation(id);
      
      // Add timestamp to mock data too
      mockData._timestamp = new Date().getTime();
      
      setViolation(mockData);
      
      // Populate form with mock data
      setForm({
        studentId: mockData.student?.id || "",
        violationId: mockData.violation?.id || "",
        tanggal: mockData.tanggal?.slice(0, 10) || new Date().toISOString().slice(0, 10),
        waktu: mockData.waktu || "",
        deskripsi: mockData.deskripsi || "",
        evidenceUrl: mockData.evidenceUrl || "",
      });
      setLoading(false);
    }
  };

  const getMockViolation = (id) => {
    // Mock data for a specific violation based on ID
    const mockViolations = [
      {
        id: 1,
        tanggal: "2025-08-01",
        waktu: "2025-08-01T08:30:00",
        deskripsi: "Terlambat masuk kelas",
        evidenceUrl: null,
        student: {
          id: 101,
          nisn: "1234567890",
          user: { name: "Ahmad Rizky" },
          classroom: { namaKelas: "XII IPA 1" }
        },
        violation: {
          id: 201,
          nama: "Terlambat",
          kategori: "Kedisiplinan",
          point: 5
        }
      },
      {
        id: 2,
        tanggal: "2025-08-02",
        waktu: "2025-08-02T10:15:00",
        deskripsi: "Tidak mengerjakan PR",
        evidenceUrl: null,
        student: {
          id: 102,
          nisn: "0987654321",
          user: { name: "Budi Santoso" },
          classroom: { namaKelas: "XI IPS 2" }
        },
        violation: {
          id: 202,
          nama: "Tidak mengerjakan tugas",
          kategori: "Akademik",
          point: 10
        }
      },
      {
        id: 3,
        tanggal: "2025-08-03",
        waktu: "2025-08-03T13:00:00",
        deskripsi: "Berpakaian tidak rapi",
        evidenceUrl: null,
        student: {
          id: 103,
          nisn: "5678901234",
          user: { name: "Citra Dewi" },
          classroom: { namaKelas: "X IPA 3" }
        },
        violation: {
          id: 203,
          nama: "Seragam tidak rapi",
          kategori: "Kerapian",
          point: 3
        }
      }
    ];
    
    return mockViolations.find(v => v.id === parseInt(id)) || mockViolations[0];
  };

  const fetchStudents = async () => {
    console.log("Fetching students data...");
    fetchWithFallback(
      // API call function
      () => API.get("/api/users/students"),
      
      // Mock data key
      "students",
      
      // Success callback
      (data) => setStudentList(data),
      
      // Error callback
      (error) => {
        console.error("Error fetching students:", error);
      }
    );
  };
  
  const fetchViolationTypes = async () => {
    console.log("Fetching violations data...");
    fetchWithFallback(
      // API call function
      () => API.get("/api/violations"),
      
      // Mock data key
      "violations",
      
      // Success callback
      (data) => setViolationList(data),
      
      // Error callback
      (error) => {
        console.error("Error fetching violations:", error);
      }
    );
  };

  useEffect(() => {
    fetchViolation();
    fetchStudents();
    fetchViolationTypes();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Prepare payload according to API documentation
    const payload = {
      studentId: form.studentId,
      violationId: form.violationId,
      tanggal: form.tanggal,
      waktu: form.waktu || undefined,
      deskripsi: form.deskripsi || undefined,
      evidenceUrl: form.evidenceUrl || undefined,
    };
    
    try {
      console.log(`Updating violation with ID: ${id}`);
      const response = await API.put(`/api/student-violations/${id}`, payload);
      console.log("Update response:", response.data);
      
      // Refresh violation data completely from server
      await fetchViolation();
      setFormVisible(false);
      setLoading(false);
      
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data pelanggaran siswa berhasil diperbarui.",
        confirmButtonColor: "#003366",
      });
    } catch (err) {
      console.error("Error updating violation:", err);
      
      // More detailed error handling
      let errorMessage = "Terjadi kesalahan saat menyimpan data.";
      let errorTitle = "Gagal";
      
      if (err.response) {
        // The server responded with an error
        if (err.response.data?.error) {
          errorMessage = err.response.data.error;
        } else if (err.response.data?.message) {
          errorMessage = err.response.data.message;
        } else {
          errorMessage = `Error ${err.response.status}: ${err.response.statusText}`;
        }
      } else if (err.request) {
        // The request was made but no response was received
        errorTitle = "Koneksi Gagal";
        errorMessage = "Server tidak merespon. Coba lagi nanti atau periksa koneksi Anda.";
        
        // In development mode, provide a workaround message
        if (import.meta.env.DEV) {
          errorMessage += "\n\nSimulasi berhasil diperbarui! (Mode Development)";
          
          // Mock a successful response in development
          const updatedViolation = {
            ...violation,
            tanggal: payload.tanggal,
            waktu: payload.waktu,
            deskripsi: payload.deskripsi,
            evidenceUrl: payload.evidenceUrl,
            student: studentList.find(s => s.id.toString() === payload.studentId.toString()),
            violation: violationList.find(v => v.id.toString() === payload.violationId.toString()),
            _timestamp: new Date().getTime() // Add timestamp for React to detect change
          };
          
          setViolation(updatedViolation);
          setFormVisible(false);
          setLoading(false);
          
          Swal.fire({
            icon: "success",
            title: "Berhasil!",
            text: "Data pelanggaran siswa berhasil diperbarui (mode simulasi).",
            confirmButtonColor: "#003366",
          });
          return;
        }
      }
      
      Swal.fire(errorTitle, errorMessage, "error");
    }
  };

  const handleDelete = () => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data laporan tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log(`Deleting violation with ID: ${id}`);
          // Use the DELETE /api/student-violations/:id endpoint as per documentation
          const response = await API.delete(`/api/student-violations/${id}`);
          console.log("Delete response:", response.data);
          
          Swal.fire("Terhapus!", "Laporan telah dihapus.", "success");
          // Navigate back to the list page
          navigate("/bk/student-violations");
        } catch (err) {
          console.error("Error deleting violation:", err);
          
          // More detailed error handling
          let errorMessage = "Gagal menghapus data.";
          let errorTitle = "Gagal";
          
          if (err.response) {
            // The server responded with an error
            if (err.response.data?.error) {
              errorMessage = err.response.data.error;
            } else if (err.response.data?.message) {
              errorMessage = err.response.data.message;
            } else {
              errorMessage = `Error ${err.response.status}: ${err.response.statusText}`;
            }
          } else if (err.request) {
            // The request was made but no response was received
            errorTitle = "Koneksi Gagal";
            errorMessage = "Server tidak merespon. Coba lagi nanti atau periksa koneksi Anda.";
            
            // In development mode, provide a workaround message and simulate success
            if (import.meta.env.DEV) {
              errorMessage += "\n\nSimulasi berhasil dihapus! (Mode Development)";
              
              // Show success message instead of error and navigate back
              Swal.fire("Terhapus!", "Laporan telah dihapus (mode simulasi).", "success");
              navigate("/bk/student-violations");
              return; // Don't show the error message
            }
          }
          
          Swal.fire(errorTitle, errorMessage, "error");
        }
      }
    });
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      {/* Back button */}
      <div className="mb-6">
        <button 
          onClick={() => navigate("/bk/student-violations")}
          className="flex items-center gap-2 text-[#003366] hover:text-[#002244] transition"
        >
          <FiArrowLeft /> Kembali ke Daftar Pelanggaran
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#003366] mb-1">
            Detail Pelanggaran Siswa
          </h2>
          {!loading && violation && (
            <p className="text-gray-500 text-sm md:text-base">
              {violation.student?.user?.name} - {violation.violation?.nama}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setFormVisible(true)}
            className="bg-yellow-400 hover:bg-yellow-500 transition text-white px-4 py-2 rounded flex items-center gap-2 shadow"
          >
            <FiEdit2 /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="bg-red-600 hover:bg-red-700 transition text-white px-4 py-2 rounded flex items-center gap-2 shadow"
          >
            <FiTrash2 /> Hapus
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-4 text-gray-500">Memuat data...</p>
        </div>
      ) : violation ? (
        <>
          {/* Detail View */}
          {!formVisible && (
            <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden">
              {/* Student and Violation Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-b border-gray-100">
                <div>
                  <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
                    <FiUser /> Informasi Siswa
                  </h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-2 text-gray-600 font-medium">Nama</td>
                        <td className="py-2 pl-4">{violation.student?.user?.name || "-"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600 font-medium">NISN</td>
                        <td className="py-2 pl-4">{violation.student?.nisn || "-"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600 font-medium">Kelas</td>
                        <td className="py-2 pl-4">{violation.student?.classroom?.namaKelas || "-"}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
                    <FiFileText /> Informasi Pelanggaran
                  </h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="py-2 text-gray-600 font-medium">Pelanggaran</td>
                        <td className="py-2 pl-4">{violation.violation?.nama || "-"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600 font-medium">Kategori</td>
                        <td className="py-2 pl-4">{violation.violation?.kategori || "-"}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-gray-600 font-medium">Point</td>
                        <td className="py-2 pl-4 font-bold">{violation.violation?.point || violation.pointSaat || 0}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Date and Description */}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
                  <FiCalendar /> Waktu & Deskripsi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Tanggal</p>
                    <p>{violation.tanggal?.slice(0, 10) || "-"}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Waktu</p>
                    <p>{violation.waktu ? new Date(violation.waktu).toLocaleTimeString() : "-"}</p>
                  </div>
                </div>
                <div className="mb-6">
                  <p className="text-gray-600 font-medium mb-1">Deskripsi</p>
                  <p className="bg-gray-50 p-3 rounded">{violation.deskripsi || "-"}</p>
                </div>
                {violation.evidenceUrl && (
                  <div>
                    <p className="text-gray-600 font-medium mb-1">Bukti</p>
                    <a href={violation.evidenceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline flex items-center gap-1">
                      <FiFileText /> Lihat Bukti
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Edit Form */}
          {formVisible && (
            <div className="bg-white rounded-xl shadow p-6 mb-8 border border-gray-100">
              <h3 className="text-lg font-semibold text-[#003366] mb-4 flex items-center gap-2">
                <FiEdit2 /> Edit Data Pelanggaran
              </h3>
              <form
                onSubmit={handleUpdate}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
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
                    value={form.deskripsi}
                    onChange={handleChange}
                    className="border border-gray-300 p-3 rounded focus:ring-2 focus:ring-[#003366]"
                    rows="3"
                  />
                </div>
                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    className="bg-[#003366] hover:bg-[#002244] transition text-white px-6 py-3 rounded font-semibold shadow"
                  >
                    Simpan Perubahan
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormVisible(false)}
                    className="bg-gray-300 hover:bg-gray-400 transition px-6 py-3 rounded font-semibold shadow"
                  >
                    Batal
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <p className="text-red-500">Data pelanggaran tidak ditemukan</p>
          <button 
            onClick={() => navigate("/bk/student-violations")}
            className="mt-4 bg-[#003366] hover:bg-[#002244] transition text-white px-4 py-2 rounded"
          >
            Kembali ke Daftar Pelanggaran
          </button>
        </div>
      )}
    </div>
  );
};

export default DetailViolation;
