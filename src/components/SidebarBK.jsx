import { FileText, Users } from "lucide-react";
import { Link } from "react-router-dom";

const SidebarBK = () => {
  return (
    <div className="w-64 h-screen bg-[#003366] text-white p-5 shadow-lg">
      <div className="flex items-center mb-10">
        <div className="flex-grow border-t border-white"></div>
        <h1 className="mx-4 text-xl font-bold text-white whitespace-nowrap">
          BK SMKN 14
        </h1>
        <div className="flex-grow border-t border-white"></div>
      </div>

      <nav className="space-y-4">
        <Link
          to="/bk/dashboard"
          className="flex items-center gap-3 hover:text-yellow-400 transition"
        >
          <FileText size={20} />
          <span>Dashboard</span>
        </Link>
        <Link
          to="/bk/siswa"
          className="flex items-center gap-3 hover:text-yellow-400 transition"
        >
          <Users size={20} />
          <span>Data Siswa</span>
        </Link>
        <Link
          to="/bk/pelanggaran"
          className="flex items-center gap-3 hover:text-yellow-400 transition"
        >
          <FileText size={20} />
          <span>Data Pelanggaran</span>
        </Link>
      </nav>
    </div>
  );
};

export default SidebarBK;
