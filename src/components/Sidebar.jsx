import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

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

  return (
    <div className="w-64 bg-[#003366] text-white h-screen p-4 flex flex-col justify-between">
      {/* Bagian atas: Header & Menu */}
      <div>
        <h2 className="text-xl font-bold mb-6">{role?.toUpperCase()}</h2>
        <ul className="space-y-4">
          {role === "siswa" && <li>📊 Lihat Credit Score</li>}
          {role === "guru" && <li>✍️ Input Credit Score</li>}
          {role === "bk" && (
            <>
              <li>👥 Kelola Siswa</li>
              <li>📄 Lihat Pelanggaran</li>
            </>
          )}

          {role === "superadmin" && (
            <>
              <li>
                <Link to="/superadmin/kelola-siswa" className="hover:underline">
                  🛠️ Kelola Data Siswa
                </Link>
              </li>
              <li>🧑 Kelola Data Guru</li>
              <li>👨‍🏫 Kelola Data BK</li>
              <li>🏫 Kelola Data Sekolah</li>
            </>
          )}
        </ul>
      </div>

      {/* Bagian bawah: Tombol Logout */}
      <button
        onClick={handleLogout}
        className="bg-white text-[#003366] px-4 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
};

export default Sidebar;
