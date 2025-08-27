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
  FiChevronLeft,
  FiBookOpen,
  FiCalendar,
  FiDatabase,
  FiTrendingUp,
  FiShield,
  FiEdit,
  FiDownload,
  FiUser,
  FiArrowUp,
  FiMenu,
  FiX,
} from "react-icons/fi";

const Sidebar = ({ onKelolaUserClick }) => {
  const [role, setRole] = useState("");
  const [isWaliKelas, setIsWaliKelas] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showUserSubmenu, setShowUserSubmenu] = useState(false);
  const [showMasterDataSubmenu, setShowMasterDataSubmenu] = useState(false);
  const [showKesiswaanSubmenu, setShowKesiswaanSubmenu] = useState(false);
  const [showReportSubmenu, setShowReportSubmenu] = useState(false);
  const [showBKLaporanSubmenu, setShowBKLaporanSubmenu] = useState(false);
  const [showBKMasterDataSubmenu, setShowBKMasterDataSubmenu] = useState(false);
  const [showBKMonitoringSubmenu, setShowBKMonitoringSubmenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (storedRole) setRole(storedRole);
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setIsWaliKelas(!!user.isWaliKelas);
      } catch {}
    }
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

  const toggleKesiswaanSubmenu = () => {
    setShowKesiswaanSubmenu(!showKesiswaanSubmenu);
  };

  const toggleReportSubmenu = () => {
    setShowReportSubmenu(!showReportSubmenu);
  };

  const toggleBKLaporanSubmenu = () => {
    setShowBKLaporanSubmenu(!showBKLaporanSubmenu);
  };

  const toggleBKMasterDataSubmenu = () => {
    setShowBKMasterDataSubmenu(!showBKMasterDataSubmenu);
  };

  const toggleBKMonitoringSubmenu = () => {
    setShowBKMonitoringSubmenu(!showBKMonitoringSubmenu);
  };

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    // Collapse semua submenu ketika sidebar di-collapse
    if (!isCollapsed) {
      setShowUserSubmenu(false);
      setShowMasterDataSubmenu(false);
      setShowKesiswaanSubmenu(false);
      setShowReportSubmenu(false);
      setShowBKLaporanSubmenu(false);
      setShowBKMasterDataSubmenu(false);
      setShowBKMonitoringSubmenu(false);
    }
  };

  return (
    <div
      className={`${
        isCollapsed ? "w-16" : "w-64"
      } bg-gradient-to-b from-slate-900 via-slate-800 to-blue-900 text-white min-h-screen flex flex-col shadow-2xl transition-all duration-300 ease-in-out relative`}
    >
      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-6 w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110 z-10 border-2 border-white"
        title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
      >
        {isCollapsed ? (
          <FiChevronRight size={16} />
        ) : (
          <FiChevronLeft size={16} />
        )}
      </button>

      {/* Header dengan logo */}
      <div
        className={`${
          isCollapsed ? "p-4" : "p-6"
        } border-b border-slate-600/20 transition-all duration-300`}
      >
        <div className="text-center">
          <div
            className={`${
              isCollapsed ? "w-8 h-8 mb-0" : "w-12 h-12 mb-3"
            } bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto transition-all duration-300`}
          >
            <FiUser
              className={`${
                isCollapsed ? "text-lg" : "text-2xl"
              } text-slate-200 transition-all duration-300`}
            />
          </div>
          {!isCollapsed && (
            <>
              <h2 className="text-lg font-bold text-white mb-1 animate-fadeIn">
                SMKN 14 Garut
              </h2>
              <div className="inline-flex px-3 py-1 bg-slate-700/30 backdrop-blur-sm rounded-full animate-fadeIn">
                <span className="text-xs font-medium text-slate-100">
                  {role?.toUpperCase()}
                </span>
              </div>
            </>
          )}
          {isCollapsed && (
            <div className="mt-2">
              <div className="w-2 h-2 bg-green-400 rounded-full mx-auto animate-pulse"></div>
            </div>
          )}
        </div>
      </div>

      {/* Menu Navigation */}
      <div
        className={`flex-1 ${
          isCollapsed ? "p-2" : "p-4"
        } overflow-hidden transition-all duration-300`}
      >
        <div className="h-full overflow-y-auto scrollbar-hide">
          <nav
            className={`${
              isCollapsed ? "space-y-1" : "space-y-2"
            } transition-all duration-300`}
          >
            {role === "siswa" && (
              <div className="space-y-2">
                <Link
                  to="/siswa/dashboard"
                  className={`flex items-center ${
                    isCollapsed ? "justify-center px-3" : "gap-3 px-4"
                  } py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 transition-all duration-200 group`}
                  title={isCollapsed ? "Dashboard" : ""}
                >
                  <FiHome className="text-lg text-slate-200 group-hover:text-white transition-colors" />
                  {!isCollapsed && (
                    <span className="font-medium">Dashboard</span>
                  )}
                </Link>
                <Link
                  to="/siswa/notifikasi"
                  className={`flex items-center ${
                    isCollapsed ? "justify-center px-3" : "gap-3 px-4"
                  } py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 transition-all duration-200 group`}
                  title={isCollapsed ? "Notifikasi" : ""}
                >
                  <FiFileText className="text-lg text-yellow-300 group-hover:text-white transition-colors" />
                  {!isCollapsed && (
                    <span className="font-medium">Notifikasi</span>
                  )}
                </Link>
                <Link
                  to="/siswa/profile"
                  className={`flex items-center ${
                    isCollapsed ? "justify-center px-3" : "gap-3 px-4"
                  } py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 transition-all duration-200 group`}
                  title={isCollapsed ? "Profil" : ""}
                >
                  <FiUser className="text-lg text-indigo-300 group-hover:text-white transition-colors" />
                  {!isCollapsed && <span className="font-medium">Profil</span>}
                </Link>
              </div>
            )}

            {role === "guru" && (
              <div className="space-y-2">
                <Link
                  to="/guru/dashboard"
                  className={`flex items-center ${
                    isCollapsed ? "justify-center px-3" : "gap-3 px-4"
                  } py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 transition-all duration-200 group`}
                  title={isCollapsed ? "Dashboard" : ""}
                >
                  <FiHome className="text-lg text-slate-200 group-hover:text-white transition-colors" />
                  {!isCollapsed && (
                    <span className="font-medium">Dashboard</span>
                  )}
                </Link>
                <Link
                  to="/guru/reports"
                  className={`flex items-center ${
                    isCollapsed ? "justify-center px-3" : "gap-3 px-4"
                  } py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 transition-all duration-200 group`}
                  title={isCollapsed ? "Laporan Saya" : ""}
                >
                  <FiFileText className="text-lg text-emerald-300 group-hover:text-white transition-colors" />
                  {!isCollapsed && (
                    <span className="font-medium">Laporan Saya</span>
                  )}
                </Link>
                {isWaliKelas && (
                  <Link
                    to="/walikelas/dashboard"
                    className={`flex items-center ${
                      isCollapsed ? "justify-center px-3" : "gap-3 px-4"
                    } py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 transition-all duration-200 group`}
                    title={isCollapsed ? "Wali Kelas" : ""}
                  >
                    <FiUsers className="text-lg text-yellow-300 group-hover:text-white transition-colors" />
                    {!isCollapsed && (
                      <span className="font-medium">Wali Kelas</span>
                    )}
                  </Link>
                )}
                <Link
                  to="/guru/profile"
                  className={`flex items-center ${
                    isCollapsed ? "justify-center px-3" : "gap-3 px-4"
                  } py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 transition-all duration-200 group`}
                  title={isCollapsed ? "Profil" : ""}
                >
                  <FiUser className="text-lg text-indigo-300 group-hover:text-white transition-colors" />
                  {!isCollapsed && <span className="font-medium">Profil</span>}
                </Link>
              </div>
            )}

            {role === "bk" && (
              <div className="space-y-2">
                {/* Dashboard */}
                <Link
                  to="/bk/dashboard"
                  className={`flex items-center ${
                    isCollapsed ? "justify-center px-3" : "gap-3 px-4"
                  } py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 transition-all duration-200 group`}
                >
                  <FiHome className="text-lg text-slate-200 group-hover:text-white transition-colors" />
                  {!isCollapsed && (
                    <span className="font-medium">Dashboard</span>
                  )}
                </Link>

                {/* Laporan & Monitoring */}
                <div>
                  <button
                    onClick={toggleBKLaporanSubmenu}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <FiFileText className="text-lg text-emerald-300 group-hover:text-white transition-colors" />
                      {!isCollapsed && (
                        <span className="font-medium">Laporan </span>
                      )}
                    </div>
                    {showBKLaporanSubmenu ? (
                      <FiChevronDown className="text-sm text-slate-200 group-hover:text-white transition-all duration-200" />
                    ) : (
                      <FiChevronRight className="text-sm text-slate-200 group-hover:text-white transition-all duration-200" />
                    )}
                  </button>

                  {showBKLaporanSubmenu && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-green-400/30 pl-4">
                      <Link
                        to="/bk/laporan-siswa"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                      >
                        <FiFileText className="text-emerald-300 group-hover:text-white transition-colors text-sm" />
                        <span>Laporan</span>
                      </Link>
                      <Link
                        to="/bk/monitoring-siswa"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                      >
                        <FiTrendingUp className="text-emerald-300 group-hover:text-white transition-colors text-sm" />
                        <span>Monitoring Siswa</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Master Data */}
                <div>
                  <button
                    onClick={toggleBKMasterDataSubmenu}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <FiDatabase className="text-lg text-indigo-300 group-hover:text-white transition-colors" />
                      {!isCollapsed && (
                        <span className="font-medium">Master Data</span>
                      )}
                    </div>
                    {showBKMasterDataSubmenu ? (
                      <FiChevronDown className="text-sm text-slate-200 group-hover:text-white transition-all duration-200" />
                    ) : (
                      <FiChevronRight className="text-sm text-slate-200 group-hover:text-white transition-all duration-200" />
                    )}
                  </button>

                  {showBKMasterDataSubmenu && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-purple-400/30 pl-4">
                      <Link
                        to="/bk/kelola-pelanggaran"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                      >
                        <FiFileText className="text-orange-300 group-hover:text-white transition-colors text-sm" />
                        <span>Kelola Pelanggaran</span>
                      </Link>
                      <Link
                        to="/bk/kelola-prestasi"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                      >
                        <FiAward className="text-yellow-300 group-hover:text-white transition-colors text-sm" />
                        <span>Kelola Prestasi</span>
                      </Link>
                      <Link
                        to="/bk/kelola-kategori"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                      >
                        <FiAward className="text-yellow-300 group-hover:text-white transition-colors text-sm" />
                        <span>Kelola Kategori</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Manajemen BK */}
                <div>
                  <button
                    onClick={toggleBKMonitoringSubmenu}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <FiSettings className="text-lg text-cyan-300 group-hover:text-white transition-colors" />
                      {!isCollapsed && (
                        <span className="font-medium">Manajemen BK</span>
                      )}
                    </div>
                    {showBKMonitoringSubmenu ? (
                      <FiChevronDown className="text-sm text-slate-200 group-hover:text-white transition-all duration-200" />
                    ) : (
                      <FiChevronRight className="text-sm text-slate-200 group-hover:text-white transition-all duration-200" />
                    )}
                  </button>

                  {showBKMonitoringSubmenu && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-cyan-400/30 pl-4">
                      <Link
                        to="/bk/penanganan"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                      >
                        <FiEdit className="text-cyan-300 group-hover:text-white transition-colors text-sm" />
                        <span>Penanganan</span>
                      </Link>
                      <Link
                        to="/bk/automasi-surat-peringatan"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                      >
                        <FiDownload className="text-cyan-300 group-hover:text-white transition-colors text-sm" />
                        <span>Surat Peringatan</span>
                      </Link>
                    </div>
                  )}
                </div>
                <Link
                  to="/guru/profile"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                >
                  <FiUser className="text-cyan-300 group-hover:text-white transition-colors text-sm" />
                  <span>Profil</span>
                </Link>
                <Link
                  to="/bk/export-laporan"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                >
                  <FiUser className="text-cyan-300 group-hover:text-white transition-colors text-sm" />
                  <span>Export Laporan</span>
                </Link>

                <Link
                  to="/bk/export-poin-siswa"
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                >
                  <FiUser className="text-cyan-300 group-hover:text-white transition-colors text-sm" />
                  <span>Export Poin SIswa</span>
                </Link>

                {isWaliKelas && (
                  <Link
                    to="/walikelas/dashboard"
                    className={`flex items-center ${
                      isCollapsed ? "justify-center px-3" : "gap-3 px-4"
                    } py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 transition-all duration-200 group`}
                    title={isCollapsed ? "Wali Kelas" : ""}
                  >
                    <FiUsers className="text-lg text-yellow-300 group-hover:text-white transition-colors" />
                    {!isCollapsed && (
                      <span className="font-medium">Wali Kelas</span>
                    )}
                  </Link>
                )}
              </div>
            )}

            {role === "superadmin" && (
              <div className="space-y-2">
                {/* Manajemen User */}
                <div>
                  <button
                    onClick={toggleUserSubmenu}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <FiUsers className="text-lg text-slate-200 group-hover:text-white transition-colors" />
                      {!isCollapsed && (
                        <span className="font-medium">Manajemen User</span>
                      )}
                    </div>
                    {showUserSubmenu ? (
                      <FiChevronDown className="text-sm text-slate-200 group-hover:text-white transition-all duration-200" />
                    ) : (
                      <FiChevronRight className="text-sm text-slate-200 group-hover:text-white transition-all duration-200" />
                    )}
                  </button>

                  {showUserSubmenu && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-slate-400/30 pl-4">
                      <Link
                        to="/superadmin/pilih-kelas"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                      >
                        <FiUsers className="text-slate-300 group-hover:text-white transition-colors text-sm" />
                        <span>Kelola Data Siswa</span>
                      </Link>
                      <Link
                        to="/superadmin/kelola-guru"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                      >
                        <FiUsers className="text-slate-300 group-hover:text-white transition-colors text-sm" />
                        <span>Kelola Data Guru</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Master Data */}
                <div>
                  <button
                    onClick={toggleMasterDataSubmenu}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <FiDatabase className="text-lg text-indigo-300 group-hover:text-white transition-colors" />
                      {!isCollapsed && (
                        <span className="font-medium">Master Data</span>
                      )}
                    </div>
                    {showMasterDataSubmenu ? (
                      <FiChevronDown className="text-sm text-slate-200 group-hover:text-white transition-all duration-200" />
                    ) : (
                      <FiChevronRight className="text-sm text-slate-200 group-hover:text-white transition-all duration-200" />
                    )}
                  </button>

                  {showMasterDataSubmenu && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-purple-400/30 pl-4">
                      <Link
                        to="/superadmin/kelola-kelas"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                      >
                        <FiBookOpen className="text-indigo-300 group-hover:text-white transition-colors text-sm" />
                        <span>Kelola Kelas</span>
                      </Link>
                      <Link
                        to="/superadmin/kelola-angkatan"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                      >
                        <FiCalendar className="text-indigo-300 group-hover:text-white transition-colors text-sm" />
                        <span>Kelola Angkatan</span>
                      </Link>
                      <Link
                        to="/superadmin/tahun-ajaran"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                      >
                        <FiCalendar className="text-indigo-300 group-hover:text-white transition-colors text-sm" />
                        <span>Tahun Ajaran</span>
                      </Link>
                      <Link
                        to="/superadmin/kenaikan-kelas"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                      >
                        <FiArrowUp className="text-indigo-300 group-hover:text-white transition-colors text-sm" />
                        <span>Kenaikan Kelas</span>
                      </Link>
                    </div>
                  )}
                </div>

                {/* Kesiswaan */}
                <button
                  onClick={toggleKesiswaanSubmenu}
                  className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-3">
                    <FiDatabase className="text-lg text-indigo-300 group-hover:text-white transition-colors" />
                    {!isCollapsed && (
                      <span className="font-medium">Kesiswaan</span>
                    )}
                  </div>
                  {setShowKesiswaanSubmenu ? (
                    <FiChevronDown className="text-sm text-slate-200 group-hover:text-white transition-all duration-200" />
                  ) : (
                    <FiChevronRight className="text-sm text-slate-200 group-hover:text-white transition-all duration-200" />
                  )}
                </button>

                {showKesiswaanSubmenu && (
                  <div className="ml-4 mt-2 space-y-1 border-l-2 border-purple-400/30 pl-4">
                    <Link
                      to="/superadmin/kategori"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                    >
                      <FiFileText className="text-orange-300 group-hover:text-white transition-colors text-sm" />
                      <span>Kategori</span>
                    </Link>
                    <Link
                      to="/superadmin/kelola-pelanggaran"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                    >
                      <FiAward className="text-yellow-300 group-hover:text-white transition-colors text-sm" />
                      <span>Kelola Pelanggaran</span>
                    </Link>
                    <Link
                      to="/superadmin/kelola-prestasi"
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                    >
                      <FiAward className="text-yellow-300 group-hover:text-white transition-colors text-sm" />
                      <span>Data Prestasi</span>
                    </Link>
                  </div>
                )}
                {/* Report */}
                <div>
                  <button
                    onClick={toggleReportSubmenu}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-indigo-500/10 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <FiTrendingUp className="text-lg text-emerald-300 group-hover:text-white transition-colors" />
                      {!isCollapsed && (
                        <span className="font-medium">Report</span>
                      )}
                    </div>
                    {showReportSubmenu ? (
                      <FiChevronDown className="text-sm text-slate-200 group-hover:text-white transition-all duration-200" />
                    ) : (
                      <FiChevronRight className="text-sm text-slate-200 group-hover:text-white transition-all duration-200" />
                    )}
                  </button>

                  {showReportSubmenu && (
                    <div className="ml-4 mt-2 space-y-1 border-l-2 border-green-400/30 pl-4">
                      <Link
                        to="/superadmin/laporan-pelanggaran"
                        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-500/5 transition-all duration-200 group text-sm"
                      >
                        <FiFileText className="text-emerald-300 group-hover:text-white transition-colors text-sm" />
                        <span>Laporan</span>
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </nav>
        </div>
      </div>

      {/* Footer dengan tombol aksi */}
      <div
        className={`${
          isCollapsed ? "p-2" : "p-4"
        } border-t border-slate-600/20 transition-all duration-300`}
      >
        <button
          onClick={handleLogout}
          className={`w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white ${
            isCollapsed ? "py-2 px-2" : "py-3 px-4"
          } rounded-xl flex items-center justify-center ${
            isCollapsed ? "" : "gap-2"
          } transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105`}
          title={isCollapsed ? "Logout" : ""}
        >
          <FiLogOut
            className={`${
              isCollapsed ? "text-base" : "text-lg"
            } transition-all duration-200`}
          />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
