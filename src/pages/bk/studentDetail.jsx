import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import bkAPI from "../../api/bk";
import academicYearAPI from "../../api/academicYear";
import api from "../../api/api";
import Swal from "sweetalert2";

const StudentDetail = () => {
  const { nisn } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [academicYears, setAcademicYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("all");
  const [suratPeringatan, setSuratPeringatan] = useState([]);
  const [loadingSurat, setLoadingSurat] = useState(false);

  // Fetch academic years
  useEffect(() => {
    const fetchYears = async () => {
      try {
        const res = await academicYearAPI.getAll();
        setAcademicYears(res.data.data);
        // Default tetap 'all', tidak perlu setSelectedYear di sini
      } catch (err) {
        setAcademicYears([]);
      }
    };
    fetchYears();
  }, []);

  // Fetch student detail for selected year
  useEffect(() => {
    if (!selectedYear) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Jika 'all', kirim null/undefined agar backend handle semua tahun ajaran
        const tahunParam = selectedYear === "all" ? undefined : selectedYear;
        const res = await bkAPI.getStudentDetail(nisn, tahunParam);
        setData(res.data);

        // Fetch surat peringatan untuk siswa ini
        await fetchSuratPeringatan(nisn);
      } catch (err) {
        setError("Gagal memuat detail siswa");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [nisn, selectedYear]);

  // Fungsi untuk mengambil surat peringatan
  const fetchSuratPeringatan = async (studentNisn) => {
    try {
      setLoadingSurat(true);
      const response = await api.get(`/automasi/history?nisn=${studentNisn}`);
      setSuratPeringatan(response.data.data || []);
    } catch (error) {
      console.error("Error fetching surat peringatan:", error);
      setSuratPeringatan([]);
    } finally {
      setLoadingSurat(false);
    }
  };

  // Fungsi untuk melihat detail surat peringatan
  const viewSuratDetail = async (surat) => {
    try {
      const response = await api.get(`/automasi/surat/${surat.id}`);
      const detailSurat = response.data.data;

      Swal.fire({
        title: detailSurat.judul,
        html: `
          <div class="text-left space-y-3">
            <div class="border-b pb-2 mb-3">
              <p><strong>Jenis:</strong> ${getJenisSuratText(
                detailSurat.jenisSurat
              )}</p>
              <p><strong>Tingkat:</strong> Level ${detailSurat.tingkatSurat}</p>
              <p><strong>Total Score:</strong> <span class="text-red-600 font-bold">${
                detailSurat.totalScoreSaat
              }</span></p>
              <p><strong>Status:</strong> ${getStatusText(
                detailSurat.statusKirim
              )}</p>
              <p><strong>Tanggal Dibuat:</strong> ${new Date(
                detailSurat.createdAt
              ).toLocaleDateString("id-ID")}</p>
            </div>
            <div>
              <h4 class="font-bold mb-2">Isi Surat:</h4>
              <div class="bg-gray-50 p-3 rounded text-sm max-h-60 overflow-y-auto whitespace-pre-line">${
                detailSurat.isiSurat
              }</div>
            </div>
          </div>
        `,
        width: "600px",
        confirmButtonText: "Tutup",
        confirmButtonColor: "#3B82F6",
      });
    } catch (error) {
      console.error("Error fetching surat detail:", error);
      Swal.fire("Error", "Gagal memuat detail surat", "error");
    }
  };

  // Helper functions untuk text label
  const getJenisSuratText = (jenis) => {
    const labels = {
      SP1: "Surat Peringatan 1",
      PANGGIL_ORTU: "Surat Pemanggilan Orang Tua",
      TERANCAM_KELUAR: "Surat Peringatan Terancam Dikeluarkan",
    };
    return labels[jenis] || jenis;
  };

  const getStatusText = (status) => {
    const labels = {
      pending: "Pending",
      sent: "Terkirim",
      failed: "Gagal",
    };
    return labels[status] || status;
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!data) return null;

  const { siswa, laporan } = data;

  // Fungsi untuk get badge status surat
  const getStatusBadge = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      sent: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };

    const labels = {
      pending: "Pending",
      sent: "Terkirim",
      failed: "Gagal",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[status]}`}
      >
        {labels[status]}
      </span>
    );
  };

  // Fungsi untuk get badge jenis surat
  const getJenisSuratBadge = (jenis) => {
    const colors = {
      SP1: "bg-yellow-100 text-yellow-800",
      PANGGIL_ORTU: "bg-orange-100 text-orange-800",
      TERANCAM_KELUAR: "bg-red-100 text-red-800",
    };

    const labels = {
      SP1: "Surat Peringatan 1",
      PANGGIL_ORTU: "Panggil Orang Tua",
      TERANCAM_KELUAR: "Terancam Keluar",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${colors[jenis]}`}
      >
        {labels[jenis] || jenis}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Row 1: Biodata dan Laporan */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Kiri - Biodata */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-1">
          <h2 className="text-xl font-bold mb-4">Biodata Siswa</h2>
          <div className="mb-2">
            <span className="font-semibold">NISN:</span> {siswa.nisn}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Nama:</span> {siswa.nama}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Kelas:</span> {siswa.kelas}
          </div>
          <div className="mb-2">
            <span className="font-semibold">Angkatan:</span> {siswa.angkatan}
          </div>
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <div>
              <span className="font-semibold text-red-600">
                Total Pelanggaran:
              </span>{" "}
              {siswa.totalPelanggaran}
            </div>
            <div>
              <span className="font-semibold text-green-600">
                Total Prestasi:
              </span>{" "}
              {siswa.totalPrestasi}
            </div>
            <div>
              <span className="font-semibold">Total Score:</span>{" "}
              <span
                className={
                  siswa.totalScore < 0
                    ? "text-red-600 font-bold"
                    : "text-green-600"
                }
              >
                {siswa.totalScore}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            Kembali
          </button>
        </div>

        {/* Card Kanan - Laporan */}
        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-2">
            <h2 className="text-xl font-bold">Laporan Siswa</h2>
            <div>
              <label htmlFor="tahunAjaran" className="mr-2 font-semibold">
                Tahun Ajaran:
              </label>
              <select
                id="tahunAjaran"
                value={selectedYear || ""}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="all">Semua Tahun Ajaran</option>
                {academicYears.map((y) => (
                  <option key={y.id} value={y.id}>
                    {y.tahunAjaran || y.nama || y.tahun || y.id}
                    {y.isActive ? " (Aktif)" : ""}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {laporan.length === 0 ? (
            <div className="text-gray-500">
              Tidak ada laporan pada tahun ajaran ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border">Tanggal</th>
                    <th className="px-4 py-2 border">Tipe</th>
                    <th className="px-4 py-2 border">Nama Item</th>
                    <th className="px-4 py-2 border">Point</th>
                    <th className="px-4 py-2 border">Kelas</th>
                    <th className="px-4 py-2 border">Deskripsi</th>
                    <th className="px-4 py-2 border">Reporter</th>
                  </tr>
                </thead>
                <tbody>
                  {laporan.map((lap, idx) => (
                    <tr key={lap.id || idx} className="hover:bg-gray-50">
                      <td className="px-4 py-2 border text-center">
                        {new Date(lap.tanggal).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {lap.tipe}
                      </td>
                      <td className="px-4 py-2 border">{lap.namaItem}</td>
                      <td className="px-4 py-2 border text-center">
                        {lap.point}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        {lap.kelasSaatLaporan || "-"}
                      </td>
                      <td className="px-4 py-2 border">{lap.deskripsi}</td>
                      <td className="px-4 py-2 border">{lap.reporter?.name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: Surat Peringatan */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold mb-4">Surat Peringatan</h2>
        {loadingSurat ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading surat peringatan...</p>
          </div>
        ) : suratPeringatan.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            <div className="mb-2">📧</div>
            <p>Belum ada surat peringatan untuk siswa ini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">Tanggal</th>
                  <th className="px-4 py-2 border">Jenis Surat</th>
                  <th className="px-4 py-2 border">Tingkat</th>
                  <th className="px-4 py-2 border">Score Saat Dibuat</th>
                  <th className="px-4 py-2 border">Status</th>
                  <th className="px-4 py-2 border">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {suratPeringatan.map((surat, idx) => (
                  <tr key={surat.id || idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-center">
                      {new Date(surat.createdAt).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {getJenisSuratBadge(surat.jenisSurat)}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                        Level {surat.tingkatSurat}
                      </span>
                    </td>
                    <td className="px-4 py-2 border text-center font-semibold">
                      <span className="text-red-600">
                        {surat.totalScoreSaat}
                      </span>
                    </td>
                    <td className="px-4 py-2 border text-center">
                      {getStatusBadge(surat.statusKirim)}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => viewSuratDetail(surat)}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetail;
