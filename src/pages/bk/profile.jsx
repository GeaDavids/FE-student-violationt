import { useState, useEffect } from "react";
import { FiUser, FiMail, FiPhone, FiBriefcase, FiCalendar, FiEdit2 } from "react-icons/fi";

const ProfileBK = () => {
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "BK",
    department: "Bimbingan Konseling",
    joinDate: "2024-01-01"
  });

  useEffect(() => {
    // Ambil data user dari localStorage atau API
    const storedName = localStorage.getItem("userName") || "Admin BK";
    const storedEmail = localStorage.getItem("userEmail") || "bk@school.com";
    
    setUserData(prev => ({
      ...prev,
      name: storedName,
      email: storedEmail
    }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Saya</h1>
          <p className="text-gray-600">Kelola informasi profil dan pengaturan akun Anda</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-12 text-white relative">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30">
                <FiUser className="text-4xl text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">{userData.name}</h2>
                <p className="text-blue-100 text-lg flex items-center">
                  <FiBriefcase className="mr-2" />
                  {userData.role} - {userData.department}
                </p>
              </div>
            </div>
            <button className="absolute top-6 right-6 p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
              <FiEdit2 className="text-white" />
            </button>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FiUser className="mr-3 text-blue-600" />
                  Informasi Personal
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="text-sm font-medium text-gray-500 mb-1 block">Nama Lengkap</label>
                    <p className="text-gray-900 font-medium">{userData.name}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="text-sm font-medium text-gray-500 mb-1 block flex items-center">
                      <FiMail className="mr-2" />
                      Email
                    </label>
                    <p className="text-gray-900 font-medium">{userData.email}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="text-sm font-medium text-gray-500 mb-1 block flex items-center">
                      <FiPhone className="mr-2" />
                      No. Telepon
                    </label>
                    <p className="text-gray-900 font-medium">{userData.phone || "Belum diisi"}</p>
                  </div>
                </div>
              </div>

              {/* System Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                  <FiBriefcase className="mr-3 text-blue-600" />
                  Informasi Sistem
                </h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="text-sm font-medium text-gray-500 mb-1 block">Role</label>
                    <span className="inline-flex px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {userData.role}
                    </span>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="text-sm font-medium text-gray-500 mb-1 block">Departemen</label>
                    <p className="text-gray-900 font-medium">{userData.department}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <label className="text-sm font-medium text-gray-500 mb-1 block flex items-center">
                      <FiCalendar className="mr-2" />
                      Bergabung Sejak
                    </label>
                    <p className="text-gray-900 font-medium">
                      {new Date(userData.joinDate).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex space-x-4">
                <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                  <FiEdit2 className="mr-2" />
                  Edit Profile
                </button>
                <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  Ubah Password
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileBK;
