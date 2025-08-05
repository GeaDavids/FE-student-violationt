
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiAward } from "react-icons/fi";

const Sidebar = ({ onKelolaUserClick }) => {
  const [role, setRole] = useState("");
  const [showUserSubmenu, setShowUserSubmenu] = useState(false);
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

  return (
    <div className="w-64 bg-[#003366] text-white min-h-screen flex flex-col justify-between">
      {/* Bagian atas: Header & Menu */}
      <div className="p-4">
        <h2 className="text-xl font-bold mb-6">{role?.toUpperCase()}</h2>
        <ul className="space-y-4">
          {role === "siswa" && (
            <li>
              <Link to="/siswa/credit-score" className="hover:underline">
                📊 Lihat Credit Score
              </Link>
            </li>
          )}

          {role === "guru" && (
            <>
              <li>
                <Link to="/guru/input-pelanggaran" className="hover:underline flex items-center gap-2">
                  📝 Input Pelanggaran
                </Link>
              </li>
            </>
          )}

          {role === "bk" && (
            <>
              <li>
                <Link to="/bk/dashboard" className="hover:underline flex items-center gap-2">
                  🏠 Dashboard
                </Link>
              </li>
              <li>
                <Link to="/bk/student-violations" className="hover:underline flex items-center gap-2">
                  📝 Kelola Pelanggaran Siswa
                </Link>
              </li>
              <li>
                <Link to="/bk/add-violation" className="hover:underline flex items-center gap-2">
                  ⚠️ Input Pelanggaran
                </Link>
              </li>
              <li>
                <Link to="/bk/add-achievement" className="hover:underline flex items-center gap-2">
                  🏆 Input Prestasi
                </Link>
              </li>
              <li>
                <Link to="/bk/achievements" className="hover:underline flex items-center gap-2">
                  🌟 Kelola Prestasi Siswa
                </Link>
              </li>
              <li>
                <Link to="/bk/export-violations" className="hover:underline flex items-center gap-2">
                  📊 Ekspor Data Pelanggaran
                </Link>
              </li>
            </>
          )}

          {role === "superadmin" && (
            <>
              <li
                className="cursor-pointer hover:underline"
                onClick={toggleUserSubmenu}
              >
                👥 Manajemen User
              </li>

              {showUserSubmenu && (
                <ul className="ml-4 mt-2 space-y-2 text-sm">
                  <li>
                    <Link
                      to="/superadmin/kelola-siswa"
                      className="hover:underline"
                    >
                      👦 Kelola Data Siswa
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/superadmin/kelola-guru"
                      className="hover:underline"
                    >
                      👩‍🏫 Kelola Data Guru
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/superadmin/kelola-bk"
                      className="hover:underline"
                    >
                      🧑‍💼 Kelola Data BK
                    </Link>
                  </li>
                </ul>
              )}

              <li>
                <Link to="/superadmin/kelola-kelas" className="hover:underline">
                  🏷️ Kelola Data Kelas
                </Link>
              </li>

              <li>
                <Link to="/superadmin/kelola-angkatan" className="hover:underline">
                  📅 Kelola Angkatan
                </Link>
              </li>


              <li>
                <Link to="/superadmin/kelola-violation" className="hover:underline">
                  ⚠️ Kelola Jenis Pelanggaran
                </Link>
              </li>
              <li>
                <Link to="/superadmin/kelola-kategori" className="hover:underline">
                  🏷️ Kelola Kategori Pelanggaran
                </Link>
              </li>
              <li>
                <Link to="/superadmin/kelola-prestasi" className="hover:underline flex items-center gap-2">
                  <FiAward /> Kelola Prestasi
                </Link>
              </li>
              
              <li>
                <Link to="/superadmin/add-achievement" className="hover:underline flex items-center gap-2">
                  🏆 Input Prestasi
                </Link>
              </li>
              
              <li>
                <Link to="/superadmin/add-violation" className="hover:underline flex items-center gap-2">
                  ⚠️ Input Pelanggaran
                </Link>
              </li>

              <li>
                <Link to="/superadmin/laporan-pelanggaran" className="hover:underline">
                  📋 Laporan Pelanggaran
                </Link>
              </li>

              <li>
                <Link to="/superadmin/monitoring-pelanggaran" className="hover:underline">
                  📊 Monitoring Pelanggaran
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Bagian bawah: Tombol Logout */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="bg-white text-[#003366] px-4 py-2 rounded w-full hover:bg-gray-100 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
