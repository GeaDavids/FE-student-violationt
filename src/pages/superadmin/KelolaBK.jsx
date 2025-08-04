import { useEffect, useState } from "react";
import axios from "axios";
import { FiUserCheck, FiPlus } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const KelolaBK = () => {
  const navigate = useNavigate();
  const [dataBK, setDataBK] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [errorMsg, setErrorMsg] = useState("");

  const token = localStorage.getItem("token");

  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchBK = async () => {
    try {
      const res = await axios.get("/api/users/bk", axiosConfig); // Ganti sesuai endpoint API BK
      setDataBK(res.data);
    } catch (err) {
      console.error("Gagal mengambil data BK:", err);
    }
  };

  useEffect(() => {
    fetchBK();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (!form.name.trim() || !form.email.trim()) {
      setErrorMsg("Nama dan email tidak boleh kosong.");
      Swal.fire("Gagal", "Nama dan email tidak boleh kosong.", "error");
      return;
    }
    const payload = { name: form.name, email: form.email };
    try {
      await axios.post("/api/users/bk", payload, axiosConfig);
      Swal.fire("Berhasil!", "BK baru berhasil ditambahkan!", "success");
      
      setForm({ name: "", email: "" });
      setFormVisible(false);
      fetchBK();
    } catch (err) {
      let msg = "Terjadi kesalahan saat menyimpan.";
      if (err.response && err.response.data && (err.response.data.error || err.response.data.message)) {
        msg = err.response.data.error || err.response.data.message;
      }
      setErrorMsg(msg);
      Swal.fire("Gagal", msg, "error");
    }
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
          <FiUserCheck />
          Kelola BK
        </h2>
        <button
          onClick={() => {
            setForm({ name: "", email: "" });
            setFormVisible(true);
          }}
          className="bg-[#003366] text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FiPlus /> Tambah BK
        </button>
      </div>

      {formVisible && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          >
            <input
              type="text"
              name="name"
              placeholder="Nama BK"
              value={form.name}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email BK"
              value={form.email}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
            <button className="bg-[#003366] text-white px-4 py-2 rounded h-fit">
              Tambah
            </button>
          </form>
          {errorMsg && (
            <div className="mt-4 text-red-600 text-sm">{errorMsg}</div>
          )}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-300 shadow rounded">
          <thead className="bg-[#f1f5f9] text-[#003366]">
            <tr>
              <th className="border px-4 py-2 text-left">Nama</th>
              <th className="border px-4 py-2 text-left">Email</th>
            </tr>
          </thead>
          <tbody>
            {dataBK.length > 0 ? (
              dataBK.map((bk) => (
                <tr key={bk.id} className="hover:bg-gray-50">
                  <td 
                    className="border px-4 py-2 text-gray-800 cursor-pointer hover:text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => navigate('/superadmin/detail-bk', { 
                      state: { 
                        bk: bk,
                        fromPage: 'kelola-bk'
                      } 
                    })}
                  >
                    {bk.name}
                  </td>
                  <td className="border px-4 py-2">{bk.email}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="text-center py-4 text-gray-500">
                  Tidak ada data BK.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KelolaBK;
