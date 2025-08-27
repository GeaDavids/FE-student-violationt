// profile
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
  FiTarget,
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

      // Set initial form data
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

  const { user, nisn, kelas, angkatan, waliKelas } = profileData;

  return (
    <div className="p-4 space-y-4 min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FiUser className="text-white text-sm" />
              </div>
              Profile Siswa
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              Kelola informasi profile dan keamanan akun Anda
            </p>
          </div>
          <div className="flex items-center gap-2">
            {!editMode && !changePasswordMode && (
              <>
                <button
                  onClick={() => setEditMode(true)}
                  className="bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-all text-sm"
                >
                  <FiEdit3 className="text-sm" /> Edit
                </button>
                <button
                  onClick={() => setChangePasswordMode(true)}
                  className="bg-gray-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-600 transition-all text-sm"
                >
                  <FiLock className="text-sm" /> Password
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Profile Picture & Basic Info */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center h-full flex flex-col">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
              <FiUser className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 mb-1 truncate">
              {user?.name || "Nama tidak tersedia"}
            </h2>
            <p className="text-sm text-gray-600 mb-3">NISN: {nisn || "-"}</p>
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200 flex-grow flex items-center justify-center">
              <div className="text-center">
                <span className="text-2xl font-bold text-blue-600">
                  {profileData.totalScore || 100}
                </span>
                <p className="text-sm text-blue-700 font-medium">
                  Credit Score
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 h-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <FiUser className="text-white text-sm" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Informasi Lengkap
                </h3>
                <p className="text-xs text-gray-600">
                  Data pribadi dan informasi kontak siswa
                </p>
              </div>
            </div>

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
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                      Jenis Kelamin
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <div className="w-6 h-6 bg-pink-500 rounded-lg flex items-center justify-center">
                        <FiUser className="text-white text-xs" />
                      </div>
                      <span className="font-semibold text-sm">
                        {profileData.jenisKelamin === "L"
                          ? "Laki-laki"
                          : profileData.jenisKelamin === "P"
                          ? "Perempuan"
                          : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                      Kelas
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <div className="w-6 h-6 bg-green-500 rounded-lg flex items-center justify-center">
                        <FiBook className="text-white text-xs" />
                      </div>
                      <span className="font-semibold text-sm">
                        {kelas || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                      Angkatan
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                        <FiCalendar className="text-white text-xs" />
                      </div>
                      <span className="font-semibold text-sm">
                        {angkatan || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                      Wali Kelas
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <div className="w-6 h-6 bg-orange-500 rounded-lg flex items-center justify-center">
                        <FiUserCheck className="text-white text-xs" />
                      </div>
                      <span className="font-semibold text-sm">
                        {waliKelas || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                      Email
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <div className="w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center">
                        <FiMail className="text-white text-xs" />
                      </div>
                      <span className="font-semibold text-sm truncate">
                        {user?.email || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                      Nomor Telepon
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <div className="w-6 h-6 bg-yellow-500 rounded-lg flex items-center justify-center">
                        <FiPhone className="text-white text-xs" />
                      </div>
                      <span className="font-semibold text-sm">
                        {profileData.phone || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                      Tempat, Tanggal Lahir
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <div className="w-6 h-6 bg-cyan-500 rounded-lg flex items-center justify-center">
                        <FiCalendar className="text-white text-xs" />
                      </div>
                      <span className="font-semibold text-sm">
                        {profileData.tempatLahir
                          ? `${profileData.tempatLahir}, ${formatDate(
                              profileData.tglLahir
                            )}`
                          : "-"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                    <label className="block text-xs font-bold text-gray-600 mb-1 uppercase tracking-wider">
                      Alamat
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <div className="w-6 h-6 bg-teal-500 rounded-lg flex items-center justify-center">
                        <FiMapPin className="text-white text-xs" />
                      </div>
                      <span className="font-semibold text-sm">
                        {profileData.alamat || "-"}
                      </span>
                    </div>
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
