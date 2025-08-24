import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import { useNavigate } from "react-router-dom";

const DashboardWaliKelas = () => {
  const [students, setStudents] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ganti endpoint sesuai backend Anda
        const resSiswa = await axios.get("/walikelas/students");
        const resLaporan = await axios.get("/walikelas/reports");
        setStudents(resSiswa.data.students || []);
        setReports(resLaporan.data.reports || []);
      } catch (err) {
        setError("Gagal memuat data dashboard wali kelas");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold mb-4 text-blue-900">
        Dashboard Wali Kelas
      </h1>
      {/* Daftar Siswa */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-2">
          Daftar Siswa di Kelas Anda
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">NISN</th>
                <th className="px-4 py-2 border">Nama</th>
                <th className="px-4 py-2 border">Angkatan</th>
                <th className="px-4 py-2 border">Email</th>
                <th className="px-4 py-2 border">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {students.map((siswa) => (
                <tr key={siswa.nisn} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">{siswa.nisn}</td>
                  <td className="px-4 py-2 border">{siswa.user?.name}</td>
                  <td className="px-4 py-2 border">{siswa.angkatan?.tahun}</td>
                  <td className="px-4 py-2 border">{siswa.user?.email}</td>
                  <td className="px-4 py-2 border text-center">
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                      onClick={() => navigate(`/walikelas/siswa/${siswa.nisn}`)}
                    >
                      Detail
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Daftar Laporan */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="text-lg font-semibold mb-2">
          Daftar Laporan Siswa di Kelas Anda
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 border">Tanggal</th>
                <th className="px-4 py-2 border">NISN</th>
                <th className="px-4 py-2 border">Nama Siswa</th>
                <th className="px-4 py-2 border">Tipe</th>
                <th className="px-4 py-2 border">Nama Item</th>
                <th className="px-4 py-2 border">Point</th>
                <th className="px-4 py-2 border">Reporter</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((lap) => (
                <tr key={lap.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border">
                    {new Date(lap.tanggal).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 border">{lap.student?.nisn}</td>
                  <td className="px-4 py-2 border">
                    {lap.student?.user?.name}
                  </td>
                  <td className="px-4 py-2 border">{lap.item?.tipe}</td>
                  <td className="px-4 py-2 border">{lap.item?.nama}</td>
                  <td className="px-4 py-2 border">{lap.item?.point}</td>
                  <td className="px-4 py-2 border">{lap.reporter?.name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardWaliKelas;
