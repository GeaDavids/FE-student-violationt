// src/components/SidebarSiswa.jsx
import { FileText } from "lucide-react";
import { Link } from "react-router-dom";

const SidebarSiswa = () => {
  return (
    <div className="w-64 h-screen bg-[#003366] text-white p-5 shadow-lg">
      <h1 className="text-2xl font-bold mb-10 border-b pb-2 text-center">Siswa</h1>
      <nav className="space-y-4">
        <Link to="/siswa/dashboard" className="flex items-center gap-3 hover:text-yellow-400 transition">
          <FileText size={20} />
          <span>Credit Score</span>
        </Link>
      </nav>
    </div>
  );
};

export default SidebarSiswa;
