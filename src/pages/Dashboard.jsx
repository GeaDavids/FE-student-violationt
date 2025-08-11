import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalKelolaUser from "../components/ModalKelolaUser";
import { PilihKelas } from "./superadmin";

const Dashboard = () => {
  const [role, setRole] = useState("");
  const [showKelolaUser, setShowKelolaUser] = useState(false);
  const [selectedUserOption, setSelectedUserOption] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    if (!storedRole) navigate("/");
    else setRole(storedRole);
  }, [navigate]);

  const handleKelolaUserClick = () => setShowKelolaUser(true);
  const handleCloseModal = () => setShowKelolaUser(false);

  if (!role) return null;

  return (
    <div className="h-full w-full flex items-center justify-center px-4">
      {role === "siswa" && (
        <div className="text-center text-lg font-medium text-gray-700">
          Credit Score Kamu:{" "}
          <span className="italic text-blue-600">Coming Soon</span>
        </div>
      )}

      {role === "guru" && (
        <div className="text-center text-lg font-medium text-gray-700">
          Form Input Credit Score:{" "}
          <span className="italic text-blue-600">Sementara</span>
        </div>
      )}

      {role === "bk" && (
        <div className="text-center text-lg font-medium text-gray-700">
          Fitur:{" "}
          <span className="italic text-blue-600">
            Kelola Data Siswa & Pelanggaran
          </span>
        </div>
      )}

      {role === "superadmin" && (
        <div className="flex flex-col items-center justify-center text-center">
          <img
            src="/logo1.png"
            alt="Logo"
            className="w-40 h-40 mb-6 drop-shadow-md"
          />
          <h1 className="text-4xl font-bold text-[#003366] mb-2">
            Selamat Datang, Super Admin!
          </h1>
          <p className="text-gray-600 text-lg max-w-xl">
            Kelola seluruh data pengguna dan informasi sekolah melalui menu yang
            telah disediakan.
          </p>

          {/* Modal jika dibutuhkan */}
          {showKelolaUser && <ModalKelolaUser onClose={handleCloseModal} />}
          {showKelolaUser && selectedUserOption === "siswa" && <PilihKelas />}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
