import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalKelolaUser from "../components/ModalKelolaUser"; // buatkan nanti
import KelolaSiswa from "../pages/superadmin/KelolaSiswa";


const Dashboard = () => {
  const [role, setRole] = useState("");
  const [showKelolaUser, setShowKelolaUser] = useState(false);
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
    <div className="p-6">
      {role === "siswa" && <div>Credit Score Kamu: Coming Soon</div>}
      {role === "guru" && <div>Form Input Credit Score Sementara</div>}
      {role === "bk" && <div>Kelola Data Siswa & Pelanggaran</div>}
      {role === "superadmin" && (
        <>
          <div className="flex flex-col items-center justify-center text-center mb-10">
            <img src="/logo1.png" alt="Logo" className="w-28 h-28 mb-4" />
            <h1 className="text-3xl font-bold text-[#003366] mb-2">
              Selamat Datang, Super Admin!
            </h1>
            <p className="text-gray-600 text-lg">
              Kelola seluruh data pengguna dan informasi sekolah di sini.
            </p>
          </div>

          {showKelolaUser && <ModalKelolaUser onClose={handleCloseModal} />}
          {showKelolaUser && selectedUserOption === "siswa" && <KelolaSiswa />}

        </>
      )}
    </div>
  );
};

export default Dashboard;
