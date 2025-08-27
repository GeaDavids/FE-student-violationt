import React, { useEffect, useState } from "react";
import axios from "../../../api/axios";
import { useNavigate } from "react-router-dom";
import { FiUsers, FiFileText, FiAward, FiAlertTriangle } from "react-icons/fi";

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

  // Stats
  const totalSiswa = students.length;
  const totalLaporan = reports.length;
  const totalPelanggaran = reports.filter(
    (r) => r.item?.tipe === "pelanggaran"
  ).length;
  const totalPrestasi = reports.filter(
    (r) => r.item?.tipe === "prestasi"
  ).length;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <h1 className="text-3xl font-bold mb-8 text-blue-900">
        Dashboard Wali Kelas
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow flex items-center gap-4 p-5">
          <div className="bg-blue-100 rounded-full p-3">
            <FiUsers className="text-2xl text-blue-700" />
          </div>
          <div>
            <div className="text-gray-500 text-xs font-semibold">
              Total Siswa
            </div>
            <div className="text-2xl font-bold text-blue-900">{totalSiswa}</div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow flex items-center gap-4 p-5">
          <div className="bg-indigo-100 rounded-full p-3">
            <FiFileText className="text-2xl text-indigo-700" />
          </div>
          <div>
            <div className="text-gray-500 text-xs font-semibold">
              Total Laporan
            </div>
            <div className="text-2xl font-bold text-indigo-900">
              {totalLaporan}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow flex items-center gap-4 p-5">
          <div className="bg-red-100 rounded-full p-3">
            <FiAlertTriangle className="text-2xl text-red-700" />
          </div>
          <div>
            <div className="text-gray-500 text-xs font-semibold">
              Pelanggaran
            </div>
            <div className="text-2xl font-bold text-red-700">
              {totalPelanggaran}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow flex items-center gap-4 p-5">
          <div className="bg-green-100 rounded-full p-3">
            <FiAward className="text-2xl text-green-700" />
          </div>
          <div>
            <div className="text-gray-500 text-xs font-semibold">Prestasi</div>
            <div className="text-2xl font-bold text-green-700">
              {totalPrestasi}
            </div>
          </div>
        </div>
      </div>

      {/* Daftar Siswa */}
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-10">
        <h2 className="text-lg font-bold mb-4 text-blue-900">
          Daftar Siswa di Kelas Anda
        </h2>
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                <th className="py-2 px-3 text-left font-semibold">NISN</th>
                <th className="py-2 px-3 text-left font-semibold">Nama</th>
                <th className="py-2 px-3 text-left font-semibold">Angkatan</th>
                <th className="py-2 px-3 text-left font-semibold">Email</th>
                <th className="py-2 px-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {students.map((siswa) => (
                <tr
                  key={siswa.nisn}
                  className="border-b hover:bg-blue-50 transition"
                >
                  <td className="py-2 px-3">{siswa.nisn}</td>
                  <td className="py-2 px-3 font-medium">{siswa.user?.name}</td>
                  <td className="py-2 px-3">{siswa.angkatan?.tahun}</td>
                  <td className="py-2 px-3">{siswa.user?.email}</td>
                  <td className="py-2 px-3 text-center">
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg font-semibold text-xs shadow"
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
      <div className="bg-white rounded-2xl shadow-xl p-6">
        <h2 className="text-lg font-bold mb-4 text-blue-900">
          Daftar Laporan Siswa di Kelas Anda
        </h2>
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                <th className="py-2 px-3 text-left font-semibold">Tanggal</th>
                <th className="py-2 px-3 text-left font-semibold">NISN</th>
                <th className="py-2 px-3 text-left font-semibold">
                  Nama Siswa
                </th>
                <th className="py-2 px-3 text-center font-semibold">Tipe</th>
                <th className="py-2 px-3 text-left font-semibold">Nama Item</th>
                <th className="py-2 px-3 text-center font-semibold">Point</th>
                <th className="py-2 px-3 text-left font-semibold">Reporter</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((lap) => (
                <tr
                  key={lap.id}
                  className="border-b hover:bg-blue-50 transition"
                >
                  <td className="py-2 px-3">
                    {new Date(lap.tanggal).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-3">{lap.student?.nisn}</td>
                  <td className="py-2 px-3">{lap.student?.user?.name}</td>
                  <td className="py-2 px-3 text-center">
                    {lap.item?.tipe === "pelanggaran" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                        <FiAlertTriangle /> Pelanggaran
                      </span>
                    ) : lap.item?.tipe === "prestasi" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                        <FiAward /> Prestasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                        -
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-3">{lap.item?.nama}</td>
                  <td className="py-2 px-3 text-center">{lap.item?.point}</td>
                  <td className="py-2 px-3">{lap.reporter?.name}</td>
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
