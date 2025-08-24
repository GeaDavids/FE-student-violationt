import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import bkAPI from "../../api/bk";
const MonitoringSiswa = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [studentResults, setStudentResults] = useState([]);
  const [studentLoading, setStudentLoading] = useState(false);
  const [studentError, setStudentError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await bkAPI.getClassroomStats();
        setData(res.data.data || []);
      } catch (err) {
        setError("Gagal memuat data kelas");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Monitoring Siswa</h1>
      {/* Search siswa global */}
      <div className="mb-6">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            setStudentLoading(true);
            setStudentError(null);
            setStudentResults([]);
            try {
              const res = await bkAPI.searchStudents(studentSearch);
              setStudentResults(res.data.data || []);
            } catch (err) {
              setStudentError("Gagal mencari siswa");
            } finally {
              setStudentLoading(false);
            }
          }}
          className="flex flex-col md:flex-row md:items-center gap-2"
        >
          <input
            type="text"
            placeholder="Cari siswa (NISN/Nama, lintas kelas)"
            value={studentSearch}
            onChange={(e) => setStudentSearch(e.target.value)}
            className="border px-3 py-2 rounded w-full md:w-80"
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            disabled={studentLoading || !studentSearch.trim()}
          >
            Cari Siswa
          </button>
        </form>
        {/* Hasil pencarian siswa */}
        {studentLoading && <div className="mt-2">Mencari...</div>}
        {studentError && (
          <div className="mt-2 text-red-500">{studentError}</div>
        )}
        {studentResults.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 border">NISN</th>
                  <th className="px-4 py-2 border">Nama</th>
                  <th className="px-4 py-2 border">Kelas</th>
                  <th className="px-4 py-2 border">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {studentResults.map((siswa, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-center">
                      {siswa.nisn}
                    </td>
                    <td className="px-4 py-2 border">{siswa.nama}</td>
                    <td className="px-4 py-2 border text-center">
                      {siswa.kodeKelas} - {siswa.kelas}
                    </td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                        onClick={() =>
                          navigate(`/bk/students/${siswa.nisn}/detail`)
                        }
                      >
                        Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <div className="mb-4 flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
        <input
          type="text"
          placeholder="Cari Kode/Nama Kelas..."
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
                <th className="px-4 py-2 border">Kode Kelas</th>
                <th className="px-4 py-2 border">Nama Kelas</th>
                <th className="px-4 py-2 border">Jumlah Siswa</th>
                <th className="px-4 py-2 border">Jumlah Pelanggaran</th>
                <th className="px-4 py-2 border">Jumlah Prestasi</th>
                <th className="px-4 py-2 border">Rata-rata Point</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-4 text-gray-500">
                    Tidak ada data kelas
                  </td>
                </tr>
              ) : (
                data
                  .filter(
                    (kelas) =>
                      kelas.kodeKelas
                        .toLowerCase()
                        .includes(search.toLowerCase()) ||
                      kelas.namaKelas
                        .toLowerCase()
                        .includes(search.toLowerCase())
                  )
                  .map((kelas) => (
                    <tr
                      key={kelas.id}
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() =>
                        navigate(`/bk/classrooms/${kelas.id}/students`)
                      }
                    >
                      <td className="px-4 py-2 border text-center">
                        {kelas.kodeKelas}
                      </td>
                      <td className="px-4 py-2 border">{kelas.namaKelas}</td>
                      <td className="px-4 py-2 border text-center">
                        {kelas.jmlSiswa}
                      </td>
                      <td className="px-4 py-2 border text-center text-red-600 font-semibold">
                        {kelas.jmlPelanggaran}
                      </td>
                      <td className="px-4 py-2 border text-center text-green-600 font-semibold">
                        {kelas.jmlPrestasi}
                      </td>
                      <td className="px-4 py-2 border text-center font-bold">
                        {kelas.avrgPoint}
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

export default MonitoringSiswa;
