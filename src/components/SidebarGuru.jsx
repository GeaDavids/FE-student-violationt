import { FilePlus } from "lucide-react";
import { Link } from "react-router-dom";

const SidebarGuru = () => {
  return (
    <div className="w-64 h-screen bg-[#003366] text-white p-5 shadow-lg">
      <h1 className="text-2xl font-bold mb-10 border-b pb-2 text-center">GURU SMKN 14</h1>
      <nav className="space-y-4">
        <Link to="/guru/dashboard" className="flex items-center gap-3 hover:text-yellow-400 transition">
          <FilePlus size={20} />
          <span>Input Credit Score</span>
        </Link>
      </nav>
    </div>
  );
};

export default SidebarGuru;
