import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FiBookOpen,
  FiUsers,
  FiSearch,
  FiDownload,
  FiEye,
  FiUser,
} from "react-icons/fi";

const PilihKelas = () => {
  const navigate = useNavigate();
  const [kelasList, setKelasList] = useState([]);
  const [search, setSearch] = useState("");
  const [searchSiswa, setSearchSiswa] = useState("");
  const [siswaList, setSiswaList] = useState([]);
  const [loadingSiswa, setLoadingSiswa] = useState(false);

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

  // search siswa function
  const searchSiswaHandler = async () => {
    if (searchSiswa.trim() === "") {
      setSiswaList([]);
      return;
    }

    try {
      setLoadingSiswa(true);
      const res = await axios.get(
        `/api/superadmin/students/students?search=${encodeURIComponent(
          searchSiswa
        )}`,
        axiosConfig
      );
      setSiswaList(res.data.data || res.data || []);
    } catch (err) {
      console.error("Gagal mencari siswa:", err);
      setSiswaList([]);
    } finally {
      setLoadingSiswa(false);
    }
  };

  // trigger search when searchSiswa changes with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      searchSiswaHandler();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchSiswa]);

  const handleDetailSiswa = (siswa) => {
    navigate(`/superadmin/detail-siswa/${siswa.id}`, {
      state: { siswaData: siswa },
    });
  };

  const handlePilihKelas = (kelas) => {
    navigate(`/superadmin/kelola-siswa/${kelas.id}`, {
      state: {
        selectedClass: kelas.id,
        selectedClassName: kelas.namaKelas || kelas.name,
        kelasData: kelas,
      },
    });
  };

  // Filter data based on search
  const filteredKelasList = kelasList.filter((kelas) => {
    const searchTerm = search.toLowerCase();
    return (
      (kelas.kodeKelas || "").toLowerCase().includes(searchTerm) ||
      (kelas.namaKelas || kelas.name || "")
        .toLowerCase()
        .includes(searchTerm) ||
      (kelas.waliKelas || "").toLowerCase().includes(searchTerm)
    );
  });

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-[#003366] flex items-center gap-3">
              <FiUsers className="text-blue-600" />
              Kelola Siswa
            </h2>
            <p className="text-gray-600 mt-1">
              Pilih kelas untuk mengelola data siswa atau cari siswa secara
              langsung
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Pilih Kelas */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-[#003366] flex items-center gap-2">
            <FiBookOpen className="text-blue-600" />
            Pilih Kelas
          </h3>

          {/* Search Section for Classes */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="relative">
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
                    <th className="px-4 py-3 text-left font-semibold text-sm">
                      Kode Kelas
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">
                      Nama Kelas
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-sm">
                      Jumlah
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredKelasList.map((kelas) => (
                    <tr
                      key={kelas.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-4 py-3 text-gray-900 font-medium text-sm">
                        {kelas.kodeKelas || kelas.id}
                      </td>
                      <td
                        className="px-4 py-3 text-gray-800 cursor-pointer hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 text-sm"
                        onClick={() => handlePilihKelas(kelas)}
                      >
                        {kelas.namaKelas || kelas.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-gray-600 text-sm flex items-center justify-left gap-2">
                        <FiUsers className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors" />
                        <div className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium transition-colors">
                          {kelas.jmlSiswa || kelas.jumlahSiswa || 0}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State for Classes */}
            {kelasList.length === 0 && (
              <div className="text-center py-8">
                <div className="flex flex-col items-center">
                  <FiBookOpen className="text-3xl text-gray-300 mb-2" />
                  <h3 className="text-md font-semibold text-gray-900 mb-1">
                    Tidak Ada Data Kelas
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Belum ada kelas yang tersedia.
                  </p>
                </div>
              </div>
            )}

            {/* No Search Results for Classes */}
            {kelasList.length > 0 && filteredKelasList.length === 0 && (
              <div className="text-center py-8">
                <div className="flex flex-col items-center">
                  <FiSearch className="text-3xl text-yellow-400 mb-2" />
                  <h3 className="text-md font-semibold text-gray-900 mb-1">
                    Tidak Ada Hasil
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Tidak ada kelas yang sesuai dengan pencarian "{search}".
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Cari Siswa */}
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-[#003366] flex items-center gap-2">
            <FiUser className="text-blue-600" />
            Cari Siswa
          </h3>

          {/* Search Section for Students */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama siswa, NISN, atau kelas..."
                value={searchSiswa}
                onChange={(e) => setSearchSiswa(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Students Search Results */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            {loadingSiswa ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-gray-600 text-sm">Mencari siswa...</p>
              </div>
            ) : siswaList.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {siswaList.map((siswa) => (
                  <div
                    key={siswa.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {siswa.nama || siswa.name}
                        </h4>
                        <p className="text-gray-600 text-xs">
                          NISN: {siswa.nisn}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Kelas: {siswa.kelas?.nama || "Tidak diketahui"}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDetailSiswa(siswa)}
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white py-2 px-3 rounded-lg flex items-center gap-1 transition-all duration-200 shadow-md text-xs"
                      >
                        <FiEye className="text-xs" />
                        Detail
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : searchSiswa.trim() !== "" ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center">
                  <FiUser className="text-3xl text-gray-300 mb-2" />
                  <h3 className="text-md font-semibold text-gray-900 mb-1">
                    Siswa Tidak Ditemukan
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Tidak ada siswa yang sesuai dengan pencarian "{searchSiswa}
                    ".
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="flex flex-col items-center">
                  <FiSearch className="text-3xl text-gray-300 mb-2" />
                  <h3 className="text-md font-semibold text-gray-900 mb-1">
                    Mulai Pencarian
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Ketik nama siswa, NISN, atau kelas untuk memulai pencarian.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PilihKelas;
