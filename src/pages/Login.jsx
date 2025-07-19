import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login } from "../api/auth";

const Login = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await login(username, password);
      const userRole = result.user?.role || role;

      // Simpan token ke localStorage (jika diberikan)
      if (result.token) {
        localStorage.setItem("token", result.token);
      }

      // Arahkan ke halaman sesuai role
      switch (userRole) {
        case "bk":
          navigate("/bk/dashboard");
          break;
        case "siswa":
          navigate("/siswa/dashboard");
          break;
        case "guru":
          navigate("/guru/dashboard");
          break;
        case "superadmin":
          navigate("/superadmin/dashboard");
          break;
        default:
          alert("Role tidak dikenali");
      }
    } catch (err) {
      alert("Login gagal. Periksa kembali username/password.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-4">
          <img src="/logo1.png" alt="Logo SMK" className="h-20 w-20 object-contain" />
        </div>

        <h2 className="text-2xl font-bold text-center text-[#003366] mb-6">SILAHKAN LOGIN</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#003366] font-semibold">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]"
              placeholder="Masukkan username"
            />
          </div>
          <div>
            <label className="block text-[#003366] font-semibold">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]"
              placeholder="Masukkan password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#003366] text-white font-bold py-2 rounded-lg hover:bg-[#002244] transition"
          >
            Masuk
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
