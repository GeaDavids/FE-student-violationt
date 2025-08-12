import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { login, setAuthData, getIdentifierType } from "../api/auth";

const Login = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await login(identifier, password);

      const token = response.token;
      const role = response.user.role;
      const user = response.user;

      // Simpan data auth menggunakan utility function
      setAuthData(token, role, user);

      // Arahkan ke dashboard berdasarkan role
      switch (role) {
        case "student":
          navigate("/dashboard");
          break;
        case "teacher":
          navigate("/dashboard");
          break;
        case "bk":
          navigate("/bk/dashboard");
          break;
        case "superadmin":
          navigate("/dashboard");
          break;
        default:
          navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login error:", err);
      const identifierType = getIdentifierType(identifier);
      let errorMessage = "Login gagal. Periksa kembali data Anda.";

      if (identifierType === "nisn") {
        errorMessage = "Login gagal. Periksa kembali NISN dan Password Anda.";
      } else if (identifierType === "email") {
        errorMessage = "Login gagal. Periksa kembali Email dan Password Anda.";
      }

      setError(err.message || errorMessage);
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-cover bg-center"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      <div className="bg-white bg-opacity-90 p-8 rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex justify-center mb-4">
          <img
            src="/logo1.png"
            alt="Logo SMK"
            className="h-20 w-20 object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold text-center text-[#003366] mb-6">
          SILAKAN LOGIN
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[#003366] font-semibold">
              Username
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Masukkan NISN atau Email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]"
              required
            />
          </div>

          <div>
            <label className="block text-[#003366] font-semibold">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003366]"
              required
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

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
