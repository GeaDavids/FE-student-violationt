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
    if (!searchSiswa.trim()) {
      setSiswaList([]);
      return;
    }

    setLoadingSiswa(true);
    try {
      const res = await axios.get(
        `/api/superadmin/students/students?search=${encodeURIComponent(
          searchSiswa
        )}`,
        axiosConfig
      );
      console.log("Hasil pencarian siswa:", res.data);
      setSiswaList(res.data.data || res.data || []);
    } catch (err) {
      console.error("Gagal mencari siswa:", err);
      setSiswaList([]);
    } finally {
      setLoadingSiswa(false);
    }
  };

  // trigger search on input change
  useEffect(() => {
    const timer = setTimeout(() => {
      searchSiswaHandler();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchSiswa]);

  const handlePilihKelas = (kelas) => {
    console.log("Navigating to kelas:", kelas);
    navigate(`/superadmin/kelola-siswa/${kelas.id}`, {
      state: { kelasData: kelas },
    });
  };

  const handleDetailSiswa = (siswa) => {
    console.log("Navigating to siswa detail:", siswa);
    navigate(`/superadmin/detail-siswa/${siswa.id}`, {
      state: { siswaData: siswa },
    });
  };

  // Filter kelas based on search
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-4 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-4 border border-gray-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg text-white shadow-md">
                <FiUsers className="text-lg" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800 tracking-tight">
                  Kelola Siswa
                </h1>
                <p className="text-slate-600 mt-0.5 text-xs">
                  Pilih kelas untuk mengelola data siswa atau cari siswa secara
                  langsung
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link
                to="/import-siswa"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-md transition-all duration-200 hover:scale-105 font-medium text-sm"
              >
                <FiDownload className="text-sm" />
                Import Data
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column - Pilih Kelas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg text-white">
                <FiBookOpen className="text-sm" />
              </div>
              <h2 className="text-base font-bold text-slate-800">
                Pilih Kelas
              </h2>
            </div>

            {/* Search Section for Classes */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-slate-200">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
                <input
                  type="text"
                  placeholder="Cari kelas..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-slate-50 text-slate-700 text-sm"
                />
              </div>
            </div>

            {/* Classes List */}
            <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
              <div className="overflow-hidden">
                <table className="w-full">
                  <thead
                    className="text-gray-700"
                    style={{ backgroundColor: "oklch(96.7% 0.003 264.542)" }}
                  >
                    <tr>
                      <th className="px-3 py-2.5 text-left font-semibold text-xs tracking-wide uppercase">
                        Kode
                      </th>
                      <th className="px-3 py-2.5 text-left font-semibold text-xs tracking-wide uppercase">
                        Nama Kelas
                      </th>
                      <th className="px-3 py-2.5 text-left font-semibold text-xs tracking-wide uppercase">
                        Siswa
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredKelasList.map((kelas) => (
                      <tr
                        key={kelas.id}
                        className="hover:bg-blue-50/30 transition-all duration-200 cursor-pointer group"
                        onClick={() => handlePilihKelas(kelas)}
                      >
                        <td className="px-3 py-2.5 text-[#001a33] font-bold text-sm group-hover:text-[#003366]">
                          {kelas.kodeKelas || kelas.id}
                        </td>
                        <td className="px-3 py-2.5 text-gray-800 text-sm font-medium group-hover:text-[#003366]">
                          {kelas.namaKelas || kelas.name}
                        </td>
                        <td className="px-3 py-2.5 text-[#004080] text-sm flex items-center gap-2 font-semibold">
                          <FiUsers className="text-[#003366] text-xs" />
                          <span>
                            {kelas.jmlSiswa || kelas.jumlahSiswa || 0}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Empty State for Classes */}
              {kelasList.length === 0 && (
                <div className="text-center py-4">
                  <div className="flex flex-col items-center">
                    <FiBookOpen className="text-xl text-gray-300 mb-2" />
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      Tidak Ada Data Kelas
                    </h3>
                    <p className="text-gray-600 text-xs">
                      Belum ada kelas yang tersedia.
                    </p>
                  </div>
                </div>
              )}

              {/* No Search Results for Classes */}
              {kelasList.length > 0 && filteredKelasList.length === 0 && (
                <div className="text-center py-4">
                  <div className="flex flex-col items-center">
                    <FiSearch className="text-xl text-yellow-400 mb-2" />
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      Tidak Ada Hasil
                    </h3>
                    <p className="text-gray-600 text-xs">
                      Tidak ada kelas yang sesuai dengan pencarian "{search}".
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Cari Siswa */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg text-white">
                <FiUser className="text-sm" />
              </div>
              <h2 className="text-base font-bold text-slate-800">Cari Siswa</h2>
            </div>

            {/* Search Section for Students */}
            <div className="bg-white rounded-lg shadow-md p-3 border border-gray-200">
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Cari nama siswa, NISN, atau kelas..."
                  value={searchSiswa}
                  onChange={(e) => setSearchSiswa(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-gray-50 text-gray-700 text-sm"
                />
              </div>
            </div>

            {/* Students Search Results */}
            <div className="bg-white rounded-lg shadow-md border border-slate-200 overflow-hidden">
              {loadingSiswa ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#004080] mx-auto mb-2"></div>
                  <p className="text-gray-600 text-xs">Mencari siswa...</p>
                </div>
              ) : siswaList.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {siswaList.map((siswa) => (
                    <div
                      key={siswa.id}
                      className="p-3 hover:bg-blue-50/30 transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex justify-between items-center gap-3">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#003366] transition-colors">
                            {siswa.nama || siswa.name}
                          </h4>
                          <p className="text-gray-600 text-xs mt-0.5">
                            NISN:{" "}
                            <span className="font-mono font-medium">
                              {siswa.nisn}
                            </span>
                          </p>
                          <p className="text-gray-500 text-xs mt-0.5">
                            Kelas:{" "}
                            <span className="font-semibold">
                              {siswa.kelas?.nama || "Tidak diketahui"}
                            </span>
                          </p>
                        </div>
                        <button
                          onClick={() => handleDetailSiswa(siswa)}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-1.5 px-3 rounded-lg flex items-center gap-1.5 transition-all duration-200 shadow-md font-semibold text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        >
                          <FiEye className="text-xs" />
                          Detail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : searchSiswa.trim() !== "" ? (
                <div className="text-center py-4">
                  <div className="flex flex-col items-center">
                    <FiUser className="text-xl text-gray-300 mb-2" />
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      Siswa Tidak Ditemukan
                    </h3>
                    <p className="text-gray-600 text-xs">
                      Tidak ada siswa yang sesuai dengan pencarian "
                      {searchSiswa}".
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="flex flex-col items-center">
                    <FiSearch className="text-xl text-gray-300 mb-2" />
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">
                      Mulai Pencarian
                    </h3>
                    <p className="text-gray-600 text-xs">
                      Ketik nama siswa, NISN, atau kelas untuk memulai
                      pencarian.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PilihKelas;
