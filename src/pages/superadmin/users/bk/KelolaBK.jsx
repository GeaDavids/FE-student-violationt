import { useEffect, useState } from "react";
import axios from "axios";
import { FiUsers, FiPlus, FiSearch } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

const KelolaGuru = () => {
  const navigate = useNavigate();
  const [dataGuru, setDataGuru] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    nip: "",
    noHp: "",
    role: "guru",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const token = localStorage.getItem("token");

  const axiosConfig = {
    withCredentials: true,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const fetchGuru = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) {
        params.append("search", search);
      }

      if (roleFilter !== "all") {
        params.append("role", roleFilter);
      }

      const res = await axios.get(
        `/api/superadmin/teachers/all?${params}`,
        axiosConfig
      );

      setDataGuru(res.data.data);
      setPagination({
        ...pagination,
        page: res.data.pagination.page,
        total: res.data.pagination.total,
        totalPages: res.data.pagination.totalPages,
      });
    } catch (err) {
      console.error("Gagal mengambil data guru:", err);
      Swal.fire("Error!", "Gagal mengambil data guru", "error");
    }
  };

  useEffect(() => {
    fetchGuru(1);
  }, [search, roleFilter]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    setRoleFilter(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!form.name.trim() || !form.email.trim() || !form.nip.trim()) {
      setErrorMsg("Nama, email, dan NIP tidak boleh kosong.");
      Swal.fire("Gagal", "Nama, email, dan NIP tidak boleh kosong.", "error");
      return;
    }

    const payload = {
      name: form.name,
      email: form.email,
      nip: form.nip,
      noHp: form.noHp,
      role: form.role,
    };

    try {
      // Endpoint untuk create guru/BK tergantung role
      const endpoint =
        form.role === "bk" ? "/api/users/bk" : "/api/users/teachers";
      await axios.post(endpoint, payload, axiosConfig);

      const roleLabel = form.role === "bk" ? "BK" : "Guru";
      Swal.fire(
        "Berhasil!",
        `${roleLabel} baru berhasil ditambahkan!`,
        "success"
      );

      setForm({ name: "", email: "", nip: "", noHp: "", role: "guru" });
      setFormVisible(false);
      fetchGuru(1);
    } catch (err) {
      let msg = "Terjadi kesalahan saat menyimpan.";
      if (
        err.response &&
        err.response.data &&
        (err.response.data.error || err.response.data.message)
      ) {
        msg = err.response.data.error || err.response.data.message;
      }
      setErrorMsg(msg);
      Swal.fire("Gagal", msg, "error");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#003366] flex items-center gap-3">
          <FiUsers className="text-blue-600" />
          Kelola Guru & BK
        </h2>
        <button
          onClick={() => {
            setForm({ name: "", email: "", nip: "", noHp: "", role: "guru" });
            setFormVisible(true);
          }}
          className="bg-gradient-to-r from-[#003366] to-blue-600 hover:from-[#002244] hover:to-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 shadow-md transition-all transform hover:scale-105"
        >
          <FiPlus /> Tambah Guru/BK
        </button>
      </div>

      {/* Filter dan Search */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama, email, atau NIP..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={roleFilter}
            onChange={handleRoleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Semua Role</option>
            <option value="guru">Guru</option>
            <option value="bk">BK</option>
          </select>

          <div className="text-sm text-gray-600 flex items-center">
            Total: {pagination.total} data
          </div>
        </div>
      </div>

      {formVisible && (
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Tambah Guru/BK Baru
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                placeholder="Nama Lengkap"
                value={form.name}
                onChange={handleChange}
                required
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                name="nip"
                placeholder="NIP"
                value={form.nip}
                onChange={handleChange}
                required
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                name="noHp"
                placeholder="No. HP (Opsional)"
                value={form.noHp}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="guru">Guru</option>
                <option value="bk">BK</option>
              </select>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-3 rounded-lg flex-1 transition-all"
                >
                  Simpan
                </button>
                <button
                  type="button"
                  onClick={() => setFormVisible(false)}
                  className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-lg flex-1 transition-all"
                >
                  Batal
                </button>
              </div>
            </div>
          </form>
          {errorMsg && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errorMsg}
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#003366] to-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">NIP</th>
                <th className="px-6 py-4 text-left font-semibold">Nama</th>
                <th className="px-6 py-4 text-left font-semibold">Email</th>
                <th className="px-6 py-4 text-left font-semibold">No. HP</th>
                <th className="px-6 py-4 text-left font-semibold">Role</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dataGuru.length > 0 ? (
                dataGuru.map((guru) => (
                  <tr
                    key={guru.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {guru.nip || "-"}
                    </td>
                    <td
                      className="px-6 py-4 text-gray-800 cursor-pointer hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                      onClick={() =>
                        navigate("/superadmin/detail-guru", {
                          state: {
                            guru: guru,
                            fromPage: "kelola-guru",
                          },
                        })
                      }
                    >
                      {guru.nama}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{guru.email}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono">
                      {guru.noHp || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                          guru.role === "bk"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {guru.role === "bk" ? "BK" : "Guru"}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center">
                      <FiUsers className="text-4xl text-gray-300 mb-2" />
                      <p>Tidak ada data guru/BK.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Menampilkan {(pagination.page - 1) * pagination.limit + 1} -{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              dari {pagination.total} data
            </div>
            <div className="flex gap-2">
              {Array.from(
                { length: pagination.totalPages },
                (_, i) => i + 1
              ).map((page) => (
                <button
                  key={page}
                  onClick={() => fetchGuru(page)}
                  className={`px-3 py-1 rounded ${
                    page === pagination.page
                      ? "bg-[#003366] text-white"
                      : "bg-white text-gray-600 border hover:bg-gray-50"
                  } transition-colors`}
                >
                  {page}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default KelolaGuru;
