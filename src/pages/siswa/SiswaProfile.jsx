import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import API from "../../api/api";
import {
  FiUser,
  FiEdit3,
  FiLock,
  FiSave,
  FiX,
  FiEye,
  FiEyeOff,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiBook,
  FiUserCheck,
  FiAward,
} from "react-icons/fi";

const SiswaProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Form states
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    phone: "",
    alamat: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [formErrors, setFormErrors] = useState({});

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await API.get("/student/profile");
      setProfileData(response.data);
      setEditForm({
        name: response.data.user?.name || "",
        email: response.data.user?.email || "",
        phone: response.data.phone || "",
        alamat: response.data.alamat || "",
      });
    } catch (err) {
      console.error("Error fetching profile data:", err);
      Swal.fire("Error!", "Gagal mengambil data profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const validateEditForm = () => {
    const errors = {};

    if (!editForm.name.trim()) {
      errors.name = "Nama tidak boleh kosong";
    }

    if (editForm.email && !/\S+@\S+\.\S+/.test(editForm.email)) {
      errors.email = "Format email tidak valid";
    }

    if (
      editForm.phone &&
      !/^[0-9]{10,15}$/.test(editForm.phone.replace(/[^0-9]/g, ""))
    ) {
      errors.phone = "Nomor telepon harus 10-15 digit";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors = {};

    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Password saat ini harus diisi";
    }

    if (!passwordForm.newPassword) {
      errors.newPassword = "Password baru harus diisi";
    } else if (passwordForm.newPassword.length < 6) {
      errors.newPassword = "Password baru minimal 6 karakter";
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Konfirmasi password tidak cocok";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEditSubmit = async () => {
    if (!validateEditForm()) return;

    try {
      const updateData = {
        name: editForm.name,
        email: editForm.email || null,
        phone: editForm.phone || null,
        alamat: editForm.alamat || null,
      };

      await API.put("/student/profile", updateData);

      setEditMode(false);
      await fetchProfileData();

      Swal.fire("Berhasil!", "Profile berhasil diperbarui", "success");
    } catch (err) {
      console.error("Error updating profile:", err);
      Swal.fire(
        "Error!",
        err.response?.data?.message || "Gagal memperbarui profile",
        "error"
      );
    }
  };

  const handlePasswordSubmit = async () => {
    if (!validatePasswordForm()) return;

    try {
      await API.put("/student/password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setChangePasswordMode(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      Swal.fire("Berhasil!", "Password berhasil diperbarui", "success");
    } catch (err) {
      console.error("Error changing password:", err);
      Swal.fire(
        "Error!",
        err.response?.data?.message || "Gagal mengubah password",
        "error"
      );
    }
  };

  const handleEditCancel = () => {
    setEditMode(false);
    setEditForm({
      name: profileData.user?.name || "",
      email: profileData.user?.email || "",
      phone: profileData.phone || "",
      alamat: profileData.alamat || "",
    });
    setFormErrors({});
  };

  const handlePasswordCancel = () => {
    setChangePasswordMode(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setFormErrors({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Data profile tidak ditemukan</p>
      </div>
    );
  }

  const {
    user,
    nisn,
    jenisKelamin,
    tempatLahir,
    tglLahir,
    alamat,
    phone,
    kelas,
    angkatan,
    waliKelas,
    totalScore,
  } = profileData;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiUser /> Profile Siswa
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola informasi profile dan keamanan akun Anda
          </p>
        </div>
        <div className="flex items-center gap-3">
          {!editMode && !changePasswordMode && (
            <>
              <button
                onClick={() => setEditMode(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
              >
                <FiEdit3 /> Edit Profile
              </button>
              <button
                onClick={() => setChangePasswordMode(true)}
                className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
              >
                <FiLock /> Ganti Password
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture & Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center">
              <FiUser className="h-16 w-16 text-gray-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {user?.name || "Nama tidak tersedia"}
            </h2>
            <p className="text-gray-600 mb-2">NISN: {nisn || "-"}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <FiBook />
                <span>{kelas || "Kelas tidak tersedia"}</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <FiCalendar />
                <span>Angkatan {angkatan || "-"}</span>
              </div>
              {waliKelas && (
                <div className="flex items-center justify-center gap-2 text-gray-600">
                  <FiUserCheck />
                  <span>Wali Kelas: {waliKelas}</span>
                </div>
              )}
              <div className="flex items-center justify-center gap-2 text-gray-600">
                <FiAward />
                <span>
                  Total Poin:{" "}
                  <span className="font-bold text-blue-700">
                    {totalScore ?? 0}
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">
              Informasi Personal
            </h3>

            {/* Edit Mode */}
            {editMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.name ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Masukkan nama lengkap"
                  />
                  {formErrors.name && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Masukkan email"
                  />
                  {formErrors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      formErrors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Masukkan nomor telepon"
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.phone}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Alamat
                  </label>
                  <textarea
                    value={editForm.alamat}
                    onChange={(e) =>
                      setEditForm({ ...editForm, alamat: e.target.value })
                    }
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Masukkan alamat lengkap"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handleEditSubmit}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
                  >
                    <FiSave /> Simpan
                  </button>
                  <button
                    onClick={handleEditCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600"
                  >
                    <FiX /> Batal
                  </button>
                </div>
              </div>
            ) : changePasswordMode ? (
              /* Change Password Mode */
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Saat Ini *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.current ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                        formErrors.currentPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Masukkan password saat ini"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          current: !showPassword.current,
                        })
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.current ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {formErrors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.currentPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password Baru *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? "text" : "password"}
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                        formErrors.newPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Masukkan password baru"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          new: !showPassword.new,
                        })
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.new ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {formErrors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Konfirmasi Password Baru *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? "text" : "password"}
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10 ${
                        formErrors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Konfirmasi password baru"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword({
                          ...showPassword,
                          confirm: !showPassword.confirm,
                        })
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={handlePasswordSubmit}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
                  >
                    <FiSave /> Simpan Password
                  </button>
                  <button
                    onClick={handlePasswordCancel}
                    className="bg-gray-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600"
                  >
                    <FiX /> Batal
                  </button>
                </div>
              </div>
            ) : (
              /* View Mode */
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Nama Lengkap
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <FiUser className="text-gray-400" />
                      <span>{user?.name || "-"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      NISN
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <FiBook className="text-gray-400" />
                      <span>{nisn || "-"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Email
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <FiMail className="text-gray-400" />
                      <span>{user?.email || "-"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Nomor Telepon
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <FiPhone className="text-gray-400" />
                      <span>{profileData.phone || "-"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Kelas
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <FiBook className="text-gray-400" />
                      <span>{kelas || "-"}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Angkatan
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <FiCalendar className="text-gray-400" />
                      <span>{angkatan || "-"}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Jenis Kelamin
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <FiUser className="text-gray-400" />
                      <span>{jenisKelamin || "-"}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">
                      Tempat, Tanggal Lahir
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <FiCalendar className="text-gray-400" />
                      <span>
                        {tempatLahir || "-"}, {formatDate(tglLahir)}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Alamat
                  </label>
                  <div className="flex items-start gap-2 text-gray-900">
                    <FiMapPin className="text-gray-400 mt-1" />
                    <span>{alamat || "-"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiswaProfile;
