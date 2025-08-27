import { useState, useEffect } from "react";
import axios from "axios";
import {
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiEdit2,
  FiSave,
  FiX,
  FiUsers,
  FiFileText,
  FiAlertTriangle,
  FiAward,
  FiCalendar,
  FiActivity,
  FiRefreshCw,
} from "react-icons/fi";
// AcademicYearSelector dan teacherAPI dihapus

const ProfileGuru = () => {
  const [profile, setProfile] = useState(null);
  const [classroom, setClassroom] = useState(null);
  // statistik, aktivitas, academic year dihapus
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    noHp: "",
    alamat: "",
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwLoading, setPwLoading] = useState(false);

  const token = localStorage.getItem("token");
  const axiosConfig = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/guru/profile", axiosConfig);
      setProfile(response.data.data);
      setEditForm({
        name: response.data.data.name,
        email: response.data.data.email,
        nip: response.data.data.nip || "",
        noHp: response.data.data.noHp || "",
        alamat: response.data.data.alamat || "",
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await axios.put("/api/guru/profile", editForm, axiosConfig);
      await fetchProfile();
      setEditing(false);
      alert("Profil berhasil diperbarui!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert(
        "Gagal memperbarui profil: " +
          (error.response?.data?.error || error.message)
      );
    } finally {
      setSaving(false);
    }
  };

  // Handle password change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");
    if (!pwForm.oldPassword || !pwForm.newPassword || !pwForm.confirmPassword) {
      setPwError("Semua field wajib diisi");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwError("Password baru minimal 6 karakter");
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwError("Konfirmasi password tidak cocok");
      return;
    }
    setPwLoading(true);
    try {
      await axios.put(
        "/api/auth/change-password",
        {
          oldPassword: pwForm.oldPassword,
          newPassword: pwForm.newPassword,
        },
        axiosConfig
      );
      setPwSuccess("Password berhasil diubah");
      setPwForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setPwError(error.response?.data?.message || "Gagal mengubah password");
    } finally {
      setPwLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getActivityIcon = (tipe) => {
    return tipe === "violation" ? (
      <FiAlertTriangle className="text-red-500" />
    ) : (
      <FiAward className="text-green-500" />
    );
  };

  const getActivityColor = (tipe) => {
    return tipe === "violation"
      ? "border-l-red-400 bg-red-50"
      : "border-l-green-400 bg-green-50";
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#003366] mx-auto"></div>
          <p className="mt-2 text-gray-500">Memuat profil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8">
        <div className="text-center py-8">
          <p className="text-gray-500">Gagal memuat profil</p>
          <button
            onClick={fetchProfile}
            className="mt-4 bg-[#003366] text-white px-4 py-2 rounded"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto min-h-screen bg-gray-50">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Panel */}
        <div className="w-full md:w-1/3">
          <div className="bg-gradient-to-br from-blue-600 to-indigo-500 rounded-2xl shadow-xl p-8 flex flex-col items-center">
            <div className="bg-white rounded-full p-5 mb-4">
              <FiUser className="text-5xl text-blue-600" />
            </div>
            <div className="text-xl font-bold text-white mb-1">
              {profile.name}
            </div>
            <div className="text-blue-100 mb-2">{profile.role}</div>
            <div className="flex flex-col gap-2 w-full mt-4">
              <div className="flex items-center gap-2 text-white text-sm">
                <FiCalendar /> {profile.nip || "-"}
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <FiMail /> {profile.email}
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <FiPhone /> {profile.noHp || "-"}
              </div>
              <div className="flex items-center gap-2 text-white text-sm">
                <FiMapPin /> {profile.alamat || "-"}
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {profile.role}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-full md:w-2/3">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
              <div className="text-2xl font-bold text-blue-900 mb-2 md:mb-0">
                Informasi Detail
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditForm((prev) => ({
                      ...prev,
                      nip: profile.nip || "",
                      name: profile.name,
                      email: profile.email,
                      noHp: profile.noHp || "",
                      alamat: profile.alamat || "",
                    }));
                    setEditing(true);
                  }}
                  className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow"
                >
                  <FiEdit2 /> Edit
                </button>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 shadow"
                >
                  <FiSave /> Ganti Password
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <FiUser /> Nama Lengkap
                </div>
                <div className="text-gray-900 font-medium">{profile.name}</div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <FiMail /> Email
                </div>
                <div className="text-gray-900 font-medium">{profile.email}</div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <FiCalendar /> NIP
                </div>
                <div className="text-gray-900 font-medium">
                  {profile.nip || "-"}
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <FiPhone /> No. HP
                </div>
                <div className="text-gray-900 font-medium">
                  {profile.noHp || "-"}
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <FiMapPin /> Alamat
                </div>
                <div className="text-gray-900 font-medium">
                  {profile.alamat || "-"}
                </div>
              </div>
              <div className="flex items-center justify-between py-4">
                <div className="flex items-center gap-2 text-gray-500">
                  <FiUsers /> Role
                </div>
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {profile.role}
                </span>
              </div>
            </div>
          </div>

          {/* Edit Modal */}
          {editing && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fadeIn">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
                  onClick={() => setEditing(false)}
                  aria-label="Tutup"
                >
                  ✕
                </button>
                <h2 className="text-xl font-bold mb-4 text-blue-900">
                  Edit Profil
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          name: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIP
                    </label>
                    <input
                      type="text"
                      value={editForm.nip || ""}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          nip: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No. HP
                    </label>
                    <input
                      type="tel"
                      value={editForm.noHp}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          noHp: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alamat
                    </label>
                    <textarea
                      value={editForm.alamat}
                      onChange={(e) =>
                        setEditForm((prev) => ({
                          ...prev,
                          alamat: e.target.value,
                        }))
                      }
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {saving ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ganti Password Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-fadeIn">
                <button
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPwForm({
                      oldPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setPwError("");
                    setPwSuccess("");
                  }}
                  aria-label="Tutup"
                >
                  ✕
                </button>
                <h2 className="text-xl font-bold mb-4 text-blue-900">
                  Ganti Password
                </h2>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Lama
                    </label>
                    <input
                      type="password"
                      value={pwForm.oldPassword}
                      onChange={(e) =>
                        setPwForm((f) => ({
                          ...f,
                          oldPassword: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password Baru
                    </label>
                    <input
                      type="password"
                      value={pwForm.newPassword}
                      onChange={(e) =>
                        setPwForm((f) => ({
                          ...f,
                          newPassword: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Konfirmasi Password Baru
                    </label>
                    <input
                      type="password"
                      value={pwForm.confirmPassword}
                      onChange={(e) =>
                        setPwForm((f) => ({
                          ...f,
                          confirmPassword: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
                      required
                    />
                  </div>
                  {pwError && (
                    <div className="text-red-500 text-sm">{pwError}</div>
                  )}
                  {pwSuccess && (
                    <div className="text-green-600 text-sm">{pwSuccess}</div>
                  )}
                  <div className="flex justify-end gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordModal(false);
                        setPwForm({
                          oldPassword: "",
                          newPassword: "",
                          confirmPassword: "",
                        });
                        setPwError("");
                        setPwSuccess("");
                      }}
                      className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={pwLoading}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {pwLoading ? "Menyimpan..." : "Simpan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileGuru;
