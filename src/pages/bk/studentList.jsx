import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import bkAPI from "../../api/bk";
import { getTahunAjaran } from "../../api/rekap";

const StudentList = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tahunOptions, setTahunOptions] = useState([]);
  const [selectedTahun, setSelectedTahun] = useState("all");

  useEffect(() => {
    const fetchTahun = async () => {
      try {
        const tahunList = await getTahunAjaran();
        setTahunOptions(tahunList);
        // Default tetap 'all', tidak perlu setSelectedTahun di sini
      } catch {
        setTahunOptions([]);
      }
    };
    fetchTahun();
  }, []);

  useEffect(() => {
    if (!selectedTahun) return;
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Jika 'all', kirim undefined agar backend handle semua tahun ajaran
        const tahunParam = selectedTahun === "all" ? undefined : selectedTahun;
        const res = await bkAPI.getStudentsInClassroom(classroomId, tahunParam);
        setData(res.data.data || []);
      } catch (err) {
        setError("Gagal memuat data siswa");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [classroomId, selectedTahun]);

  return (
    <div className="p-6">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
      >
        Kembali
      </button>
      <h1 className="text-2xl font-bold mb-4">Daftar Siswa Kelas</h1>
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
        <div>
          <label className="font-semibold mr-2">Tahun Ajaran:</label>
          <select
            className="border rounded px-2 py-1"
            value={selectedTahun}
            onChange={(e) => setSelectedTahun(e.target.value)}
          >
            <option value="all">Semua Tahun Ajaran</option>
            {tahunOptions.map((t) => (
              <option key={t.id} value={t.id}>
                {t.tahunAjaran || t.nama || t.tahun || t.id}
              </option>
            ))}
          </select>
        </div>
        <input
          type="text"
          placeholder="Cari NISN atau Nama Siswa..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-64"
        />
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">NISN</th>
                <th className="px-4 py-2 border">Nama</th>
                <th className="px-4 py-2 border">Pelanggaran</th>
                <th className="px-4 py-2 border">Prestasi</th>
                <th className="px-4 py-2 border">Total Score</th>
                <th className="px-4 py-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Tidak ada data siswa
                  </td>
                </tr>
              ) : (
                data
                  .filter(
                    (siswa) =>
                      siswa.nisn.toLowerCase().includes(search.toLowerCase()) ||
                      siswa.nama.toLowerCase().includes(search.toLowerCase())
                  )
                  .map((siswa, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        navigate(`/bk/students/${siswa.nisn}/detail`)
                      }
                    >
                      <td className="px-4 py-2 border text-center">
                        {siswa.nisn}
                      </td>
                      <td className="px-4 py-2 border">{siswa.nama}</td>
                      <td className="px-4 py-2 border text-center text-red-600 font-semibold">
                        {siswa.pelanggaran}
                      </td>
                      <td className="px-4 py-2 border text-center text-green-600 font-semibold">
                        {siswa.prestasi}
                      </td>
                      <td className="px-4 py-2 border text-center font-bold">
                        {siswa.totalScore}
                      </td>
                      <td className="px-4 py-2 border text-center">
                        <button
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/bk/students/${siswa.nisn}/detail`);
                          }}
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
      )}
    </div>
  );
};

export default StudentList;
