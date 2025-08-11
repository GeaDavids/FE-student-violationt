import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FiBookOpen, FiUsers, FiSearch, FiDownload } from "react-icons/fi";

const PilihKelas = () => {
  const navigate = useNavigate();
  const [kelasList, setKelasList] = useState([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");

  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  // fetch kelas
  useEffect(() => {
    const fetchKelas = async () => {
      try {
        const res = await axios.get(
          `/api/superadmin/students/classrooms`,
          axiosConfig
        );
        console.log("Data kelas response:", res.data);
        // Extract array from response object
        setKelasList(res.data.data || res.data || []);
      } catch (err) {
        console.error("Gagal mengambil data kelas:", err);
        setKelasList([]);
      }
    };
    fetchKelas();
  }, []);

  const handlePilihKelas = (kelas) => {
    navigate(`/superadmin/kelola-siswa/${kelas.id}`, {
      state: {
        selectedClass: kelas.id,
        selectedClassName: kelas.namaKelas || kelas.name,
        kelasData: kelas,
      },
    });
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#003366] flex items-center gap-3">
              <FiUsers className="text-blue-600" />
              Pilih Kelas
            </h2>
            <p className="text-gray-600 mt-1">
              Pilih kelas untuk mengelola data siswa
            </p>
          </div>
          <Link
            to="/import-siswa"
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-md transition-all transform hover:scale-105"
          >
            <FiDownload />
            Import Data
          </Link>
        </div>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="relative max-w-md">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Cari kode kelas, nama kelas, atau wali kelas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#003366] text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">
                  Kode Kelas
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  Nama Kelas
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  Wali Kelas
                </th>
                <th className="px-6 py-4 text-left font-semibold">
                  Jumlah Siswa
                </th>
                <th className="px-6 py-4 text-left font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {kelasList
                .filter((kelas) => {
                  const searchTerm = search.toLowerCase();
                  return (
                    (kelas.kodeKelas || "")
                      .toLowerCase()
                      .includes(searchTerm) ||
                    (kelas.namaKelas || kelas.name || "")
                      .toLowerCase()
                      .includes(searchTerm) ||
                    (kelas.waliKelas || "").toLowerCase().includes(searchTerm)
                  );
                })
                .map((kelas) => (
                  <tr
                    key={kelas.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {kelas.kodeKelas || kelas.id}
                    </td>
                    <td
                      className="px-6 py-4 text-gray-800 cursor-pointer hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                      onClick={() => handlePilihKelas(kelas)}
                    >
                      {kelas.namaKelas || kelas.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {kelas.waliKelas || "Belum Ditentukan"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                        <FiUsers className="mr-1" />
                        {kelas.jmlSiswa || kelas.jumlahSiswa || 0} siswa
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handlePilihKelas(kelas)}
                        className="bg-[#013366] hover:bg-[#002244] text-white py-2 px-4 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-md text-sm"
                      >
                        <FiBookOpen />
                        Kelola Siswa
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {kelasList.length === 0 && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center">
              <FiBookOpen className="text-4xl text-gray-300 mb-2" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Tidak Ada Data Kelas
              </h3>
              <p className="text-gray-600">
                Belum ada kelas yang tersedia untuk dikelola.
              </p>
            </div>
          </div>
        )}

        {/* No Search Results */}
        {kelasList.length > 0 &&
          kelasList.filter((kelas) => {
            const searchTerm = search.toLowerCase();
            return (
              (kelas.kodeKelas || "").toLowerCase().includes(searchTerm) ||
              (kelas.namaKelas || kelas.name || "")
                .toLowerCase()
                .includes(searchTerm) ||
              (kelas.waliKelas || "").toLowerCase().includes(searchTerm)
            );
          }).length === 0 && (
            <div className="text-center py-12">
              <div className="flex flex-col items-center">
                <FiSearch className="text-4xl text-yellow-400 mb-2" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Tidak Ada Hasil
                </h3>
                <p className="text-gray-600">
                  Tidak ada kelas yang sesuai dengan pencarian "{search}".
                </p>
              </div>
            </div>
          )}
      </div>
    </div>
  );
};

export default PilihKelas;
