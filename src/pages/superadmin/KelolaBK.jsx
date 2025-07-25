import { useEffect, useState } from "react";
import axios from "axios";
import { FiUserCheck, FiEdit2, FiTrash2, FiPlus } from "react-icons/fi";

const KelolaBK = () => {
  const [dataBK, setDataBK] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({ name: "", email: "" });
  const [editingId, setEditingId] = useState(null);
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
      const res = await axios.get("/api/users/counselors", axiosConfig); // Ganti sesuai endpoint API BK
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
    try {
      if (editingId) {
        await axios.put(`/api/users/counselors/${editingId}`, form, axiosConfig);
      } else {
        await axios.post("/api/users/counselors", form, axiosConfig);
      }
      setForm({ name: "", email: "" });
      setEditingId(null);
      setFormVisible(false);
      fetchBK();
    } catch (err) {
      console.error("Gagal menyimpan BK:", err);
      setErrorMsg("Terjadi kesalahan saat menyimpan.");
    }
  };

  const handleEdit = (bk) => {
    setForm({ name: bk.name, email: bk.email });
    setEditingId(bk.id);
    setFormVisible(true);
  };

  const handleDelete = async (id) => {
    const konfirmasi = confirm("Apakah yakin ingin menghapus data BK ini?");
    if (!konfirmasi) return;
    try {
      await axios.delete(`/api/users/counselors/${id}`, axiosConfig);
      fetchBK();
    } catch (err) {
      console.error("Gagal menghapus BK:", err);
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
            setEditingId(null);
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
              {editingId ? "Update" : "Tambah"}
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
              <th className="border px-4 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {dataBK.length > 0 ? (
              dataBK.map((bk) => (
                <tr key={bk.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{bk.name}</td>
                  <td className="border px-4 py-2">{bk.email}</td>
                  <td className="border px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(bk)}
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(bk.id)}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                    >
                      <FiTrash2 />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
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
