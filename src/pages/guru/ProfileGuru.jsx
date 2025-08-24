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
      setProfile(response.data.profile);
      setClassroom(response.data.classroom);
      setEditForm({
        name: response.data.profile.user.name,
        email: response.data.profile.user.email,
        noHp: response.data.profile.noHp || "",
        alamat: response.data.profile.alamat || "",
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

      // Refresh profile data
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[#003366]">Profil Saya</h2>
          <p className="text-gray-600">
            Kelola informasi profil dan lihat aktivitas Anda
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchProfile}
            className="bg-[#003366] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#002244] transition-colors"
          >
            <FiRefreshCw /> Refresh
          </button>
        </div>
      </div>

      {/* Profile Information Only */}
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-[#003366] flex items-center gap-2">
            <FiUser /> Informasi Pribadi
          </h3>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="text-[#003366] hover:text-[#002244] flex items-center gap-2"
            >
              <FiEdit2 size={16} /> Edit
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveProfile}
                disabled={saving}
                className="bg-[#003366] text-white px-3 py-1 rounded-md text-sm flex items-center gap-1 hover:bg-[#002244] disabled:opacity-50"
              >
                <FiSave size={14} />
                {saving ? "Menyimpan..." : "Simpan"}
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setEditForm({
                    name: profile.user.name,
                    email: profile.user.email,
                    noHp: profile.noHp || "",
                    alamat: profile.alamat || "",
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={16} />
              </button>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Lengkap
            </label>
            {editing ? (
              <input
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, name: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 py-2">{profile.user.name}</p>
            )}
          </div>

          {/* NIP */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              NIP
            </label>
            <p className="text-gray-900 py-2">{profile.nip || "-"}</p>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            {editing ? (
              <input
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 py-2">{profile.user.email}</p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              No. HP
            </label>
            {editing ? (
              <input
                type="tel"
                value={editForm.noHp}
                onChange={(e) =>
                  setEditForm((prev) => ({ ...prev, noHp: e.target.value }))
                }
                placeholder="Masukkan nomor HP"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 py-2">{profile.noHp || "-"}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alamat
            </label>
            {editing ? (
              <textarea
                value={editForm.alamat}
                onChange={(e) =>
                  setEditForm((prev) => ({
                    ...prev,
                    alamat: e.target.value,
                  }))
                }
                rows={3}
                placeholder="Masukkan alamat lengkap"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003366] focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900 py-2">{profile.alamat || "-"}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileGuru;
