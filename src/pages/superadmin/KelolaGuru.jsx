import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FiUser,
  FiEdit2,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiRefreshCw,
} from "react-icons/fi";

const KelolaGuru = () => {
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
  const [editingId, setEditingId] = useState(null);
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
      if (editingId) {
        console.log("Updating teacher with ID:", editingId);
        const response = await axios.put(
          `/api/users/teachers/${editingId}`,
          payload,
          axiosConfig
        );
        Swal.fire("Berhasil!", "Data guru berhasil diperbarui.", "success");
      } else {
        await axios.post("/api/users/teachers", payload, axiosConfig);
        Swal.fire("Berhasil!", "Guru baru berhasil ditambahkan.", "success");
      }

      setForm({ name: "", email: "", nip: "", noHp: "", alamat: "" });
      setEditingId(null);
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

  const handleEdit = (guru) => {
    setForm({
      name: guru.user.name,
      email: guru.user.email,
      nip: guru.nip || "",
      noHp: guru.noHp || "",
      alamat: guru.alamat || "",
    });
    setEditingId(guru.user.id); // 🔧 pakai user.id
    setFormVisible(true);
  };

  const handleDelete = (userId) => {
    Swal.fire({
      title: "Yakin ingin menghapus?",
      text: "Data guru tidak bisa dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, hapus!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          console.log("Deleting teacher with ID:", userId);
          await axios.delete(`/api/users/teachers/${userId}`, axiosConfig);
          Swal.fire("Terhapus!", "Data guru telah dihapus.", "success");
          fetchGuru();
        } catch (err) {
          console.error("Delete error:", err.response || err);
          Swal.fire("Gagal", "Gagal menghapus data guru.", "error");
        }
      }
    });
  };

  const handleResetPassword = (userId) => {
    Swal.fire({
      title: "Reset Password?",
      text: "Password guru akan diatur ulang ke default.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Reset",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.put(
            `/api/users/teachers/${userId}/reset-password`,
            {},
            axiosConfig
          );
          Swal.fire("Berhasil!", "Password telah di-reset.", "success");
        } catch (err) {
          console.error("Reset password error:", err.response || err);
          Swal.fire("Gagal", "Tidak dapat mereset password.", "error");
        }
      }
    });
  };

  const handleDetail = (guru) => {
    Swal.fire({
      title: `<strong>Detail Guru</strong>`,
      html: `
        <p><b>Nama:</b> ${guru.user.name}</p>
        <p><b>Email:</b> ${guru.user.email}</p>
        <p><b>Role:</b> ${guru.user.role}</p>
        <p><b>NIP:</b> ${guru.nip}</p>
        <p><b>No. HP:</b> ${guru.noHp}</p>
        <p><b>Alamat:</b> ${guru.alamat}</p>
      `,
      icon: "info",
    });
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
            setEditingId(null);
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
              {editingId ? "Update" : "Tambah"}
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
              <th className="border px-4 py-2 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuru.length > 0 ? (
              filteredGuru.map((guru) => (
                <tr key={guru.id} className="hover:bg-gray-50">
                  <td
                    className="border px-4 py-2 text-gray-800 cursor-pointer hover:text-[#003366]"
                    onClick={() => handleDetail(guru)}
                  >
                    {guru.user.name}
                  </td>
                  <td className="border px-4 py-2">{guru.user.email}</td>
                  <td className="border px-4 py-2">{guru.nip}</td>
                  <td className="border px-4 py-2 text-center space-x-2">
                    <button
                      onClick={() => handleEdit(guru)}
                      title="Edit"
                      className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-2 rounded"
                    >
                      <FiEdit2 />
                    </button>
                    <button
                      onClick={() => handleDelete(guru.user.id)}
                      title="Delete"
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded"
                    >
                      <FiTrash2 />
                    </button>
                    <button
                      onClick={() => handleResetPassword(guru.user.id)}
                      title="Reset Password"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded"
                    >
                      🔁
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4 text-gray-500">
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
