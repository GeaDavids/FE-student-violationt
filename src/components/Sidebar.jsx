import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FiAward,
  FiHome,
  FiUsers,
  FiFileText,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiChevronRight,
  FiBookOpen,
  FiCalendar,
  FiDatabase,
  FiTrendingUp,
  FiShield,
  FiEdit,
  FiDownload,
  FiUser,
} from "react-icons/fi";

const Sidebar = ({ onKelolaUserClick }) => {
  const [role, setRole] = useState("");
  const [showUserSubmenu, setShowUserSubmenu] = useState(false);
  const [showMasterDataSubmenu, setShowMasterDataSubmenu] = useState(false);
  const [showReportSubmenu, setShowReportSubmenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  const toggleUserSubmenu = () => {
    setShowUserSubmenu(!showUserSubmenu);
  };

  const toggleMasterDataSubmenu = () => {
    setShowMasterDataSubmenu(!showMasterDataSubmenu);
  };

  const toggleReportSubmenu = () => {
    setShowReportSubmenu(!showReportSubmenu);
  };

  return (
    <div className="w-64 bg-gradient-to-b from-[#001a33] via-[#003366] to-[#004080] text-white min-h-screen flex flex-col shadow-2xl">
      {/* Header dengan logo */}
      <div className="p-6 border-b border-blue-400/20">
        <div className="text-center">
          <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-3">
            <FiUser className="text-2xl text-blue-200" />
          </div>
          <h2 className="text-lg font-bold text-white mb-1">SMK 14 System</h2>
          <div className="inline-flex px-3 py-1 bg-blue-500/20 backdrop-blur-sm rounded-full">
            <span className="text-xs font-medium text-blue-100">
              {role?.toUpperCase()}
            </span>
          </div>
        </div>
      </div>

      {/* Menu Navigation */}
      <div className="flex-1 p-4 overflow-y-auto">
        <nav className="space-y-2">
          {role === "siswa" && (
            <Link
              to="/siswa/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
            >
              <FiHome className="text-lg text-blue-200 group-hover:text-white transition-colors" />
              <span className="font-medium">Dashboard</span>
            </Link>
          )}

          {role === "guru" && (
            <Link
              to="/guru/input-pelanggaran"
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
            >
              <FiEdit className="text-lg text-blue-200 group-hover:text-white transition-colors" />
              <span className="font-medium">Input Pelanggaran</span>
            </Link>
          )}

          {role === "bk" && (
            <div className="space-y-2">
              <Link
                to="/bk/dashboard"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
              >
                <FiHome className="text-lg text-blue-200 group-hover:text-white transition-colors" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <Link
                to="/bk/laporan-siswa"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
              >
                <FiFileText className="text-lg text-blue-200 group-hover:text-white transition-colors" />
                <span className="font-medium">Laporan P&P</span>
              </Link>
              <Link
                to="/bk/monitoring-siswa"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
              >
                <FiBarChart2 className="text-lg text-blue-200 group-hover:text-white transition-colors" />
                <span className="font-medium">Monitoring Siswa</span>
              </Link>
              <Link
                to="/bk/manajemen-resiko"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
              >
                <FiShield className="text-lg text-blue-200 group-hover:text-white transition-colors" />
                <span className="font-medium">Manajemen Resiko</span>
              </Link>
              <Link
                to="/bk/adjustment-poin"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
              >
                <FiSettings className="text-lg text-blue-200 group-hover:text-white transition-colors" />
                <span className="font-medium">Adjustment Poin</span>
              </Link>
              <Link
                to="/bk/kelola-violations"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
              >
                <FiFileText className="text-lg text-orange-300 group-hover:text-white transition-colors" />
                <span className="font-medium">Kelola Pelanggaran</span>
              </Link>
              <Link
                to="/bk/kelola-achievements"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
              >
                <FiAward className="text-lg text-yellow-300 group-hover:text-white transition-colors" />
                <span className="font-medium">Kelola Prestasi</span>
              </Link>
              <Link
                to="/bk/export-violations"
                className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
              >
                <FiDownload className="text-lg text-green-300 group-hover:text-white transition-colors" />
                <span className="font-medium">Ekspor Data</span>
              </Link>
            </div>
          )}

          {role === "superadmin" && (
            <div className="space-y-2">
              {/* Manajemen User */}
              <div>
                <button
                  onClick={toggleUserSubmenu}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <FiUsers className="text-lg text-blue-200 group-hover:text-white transition-colors" />
                    <span className="font-medium">Manajemen User</span>
                  </div>
                  {showUserSubmenu ? (
                    <FiChevronDown className="text-sm text-blue-200 group-hover:text-white transition-all duration-200" />
                  ) : (
                    <FiChevronRight className="text-sm text-blue-200 group-hover:text-white transition-all duration-200" />
                  )}
                </button>

                {showUserSubmenu && (
                  <div className="ml-4 mt-2 space-y-1 border-l-2 border-blue-400/30 pl-4">
                    <Link
                      to="/superadmin/pilih-kelas"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 group text-sm"
                    >
                      <FiUsers className="text-blue-300 group-hover:text-white transition-colors text-sm" />
                      <span>Kelola Data Siswa</span>
                    </Link>
                    <Link
                      to="/superadmin/kelola-guru"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 group text-sm"
                    >
                      <FiUsers className="text-blue-300 group-hover:text-white transition-colors text-sm" />
                      <span>Kelola Data Guru</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Master Data */}
              <div>
                <button
                  onClick={toggleMasterDataSubmenu}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <FiDatabase className="text-lg text-purple-300 group-hover:text-white transition-colors" />
                    <span className="font-medium">Master Data</span>
                  </div>
                  {showMasterDataSubmenu ? (
                    <FiChevronDown className="text-sm text-blue-200 group-hover:text-white transition-all duration-200" />
                  ) : (
                    <FiChevronRight className="text-sm text-blue-200 group-hover:text-white transition-all duration-200" />
                  )}
                </button>

                {showMasterDataSubmenu && (
                  <div className="ml-4 mt-2 space-y-1 border-l-2 border-purple-400/30 pl-4">
                    <Link
                      to="/superadmin/kelola-kelas"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 group text-sm"
                    >
                      <FiBookOpen className="text-purple-300 group-hover:text-white transition-colors text-sm" />
                      <span>Kelola Kelas</span>
                    </Link>
                    <Link
                      to="/superadmin/kelola-angkatan"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 group text-sm"
                    >
                      <FiCalendar className="text-purple-300 group-hover:text-white transition-colors text-sm" />
                      <span>Kelola Angkatan</span>
                    </Link>
                    <Link
                      to="/superadmin/kelola-violation"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 group text-sm"
                    >
                      <FiFileText className="text-orange-300 group-hover:text-white transition-colors text-sm" />
                      <span>Data Pelanggaran</span>
                    </Link>
                    <Link
                      to="/superadmin/kelola-prestasi"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 group text-sm"
                    >
                      <FiAward className="text-yellow-300 group-hover:text-white transition-colors text-sm" />
                      <span>Data Prestasi</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Report */}
              <div>
                <button
                  onClick={toggleReportSubmenu}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-white/10 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <FiTrendingUp className="text-lg text-green-300 group-hover:text-white transition-colors" />
                    <span className="font-medium">Report</span>
                  </div>
                  {showReportSubmenu ? (
                    <FiChevronDown className="text-sm text-blue-200 group-hover:text-white transition-all duration-200" />
                  ) : (
                    <FiChevronRight className="text-sm text-blue-200 group-hover:text-white transition-all duration-200" />
                  )}
                </button>

                {showReportSubmenu && (
                  <div className="ml-4 mt-2 space-y-1 border-l-2 border-green-400/30 pl-4">
                    <Link
                      to="/superadmin/laporan-pelanggaran"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 group text-sm"
                    >
                      <FiFileText className="text-green-300 group-hover:text-white transition-colors text-sm" />
                      <span>Laporan</span>
                    </Link>
                    <Link
                      to="/superadmin/monitoring-pelanggaran"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all duration-200 group text-sm"
                    >
                      <FiBarChart2 className="text-green-300 group-hover:text-white transition-colors text-sm" />
                      <span>Monitoring</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Footer dengan tombol aksi */}
      <div className="p-4 border-t border-blue-400/20">
        <button
          onClick={handleLogout}
          className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <FiLogOut className="text-lg" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
