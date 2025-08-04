import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import {
  FiUser,
  FiPlus,
  FiSearch,
  FiRefreshCw,
} from "react-icons/fi";

const KelolaGuru = () => {
  const navigate = useNavigate();
  const [dataGuru, setDataGuru] = useState([]);
  const [filteredGuru, setFilteredGuru] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    nip: "",
    noHp: "",
    alamat: "",
  });
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("token");

  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchGuru = async () => {
    try {
      const res = await axios.get("/api/users/teachers", axiosConfig);
      setDataGuru(res.data);
      if (searchTerm) {
        const filtered = res.data.filter((guru) =>
          guru.user.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredGuru(filtered);
      } else {
        setFilteredGuru(res.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data guru:", err);
    }
  };

  useEffect(() => {
    fetchGuru();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      email: form.email,
      nip: form.nip,
      noHp: form.noHp,
      alamat: form.alamat,
    };

    try {
      await axios.post("/api/users/teachers", payload, axiosConfig);
      Swal.fire("Berhasil!", "Guru baru berhasil ditambahkan.", "success");

      setForm({ name: "", email: "", nip: "", noHp: "", alamat: "" });
      setFormVisible(false);
      fetchGuru();
    } catch (err) {
      console.error("Error:", err.response || err);
      let errorMessage = "Terjadi kesalahan saat menyimpan data guru.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      }
      Swal.fire("Gagal", errorMessage, "error");
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = dataGuru.filter((guru) =>
      guru.user.name.toLowerCase().includes(value)
    );
    setFilteredGuru(filtered);
  };

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#003366] flex items-center gap-2">
          <FiUser /> Kelola Guru
        </h2>
        <button
          onClick={() => {
            setForm({ name: "", email: "", nip: "", noHp: "", alamat: "" });
            setFormVisible(true);
          }}
          className="bg-[#003366] text-white px-4 py-2 rounded flex items-center gap-2"
        >
          <FiPlus /> Tambah Guru
        </button>
      </div>

      <div className="flex mb-4 gap-4">
        <div className="flex items-center border rounded px-3 py-2 w-full md:w-1/2">
          <FiSearch className="mr-2" />
          <input
            type="text"
            placeholder="Cari guru berdasarkan nama..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full outline-none"
          />
        </div>
        <button
          onClick={async () => {
            await fetchGuru();
            setSearchTerm("");
          }}
          className="bg-gray-200 px-3 py-2 rounded text-sm flex items-center gap-1"
        >
          <FiRefreshCw /> Reset
        </button>
      </div>

      {formVisible && (
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end"
          >
            <input
              type="text"
              name="name"
              placeholder="Nama Guru"
              value={form.name}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
            <input
              type="email"
              name="email"
              placeholder="Email Guru"
              value={form.email}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
            <input
              type="text"
              name="nip"
              placeholder="NIP"
              value={form.nip}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
            <input
              type="text"
              name="noHp"
              placeholder="No. HP"
              value={form.noHp}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
            <input
              type="text"
              name="alamat"
              placeholder="Alamat"
              value={form.alamat}
              onChange={handleChange}
              required
              className="border p-2 rounded"
            />
            <button
              type="submit"
              className="bg-[#003366] text-white px-4 py-2 rounded h-fit"
            >
              Tambah
            </button>
          </form>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full table-auto border border-gray-300 shadow rounded">
          <thead className="bg-[#f1f5f9] text-[#003366]">
            <tr>
              <th className="border px-4 py-2 text-left">Nama</th>
              <th className="border px-4 py-2 text-left">Email</th>
              <th className="border px-4 py-2 text-left">NIP</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuru.length > 0 ? (
              filteredGuru.map((guru) => (
                <tr key={guru.id} className="hover:bg-gray-50">
                  <td
                    className="border px-4 py-2 text-gray-800 cursor-pointer hover:text-gray-600 hover:bg-gray-50 transition-colors duration-200"
                    onClick={() => navigate('/superadmin/detail-guru', { 
                      state: { 
                        guru: guru,
                        fromPage: 'kelola-guru'
                      } 
                    })}
                  >
                    {guru.user.name}
                  </td>
                  <td className="border px-4 py-2">{guru.user.email}</td>
                  <td className="border px-4 py-2">{guru.nip}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  Tidak ada data guru.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default KelolaGuru;