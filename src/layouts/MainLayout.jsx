import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ModalKelolaUser from "../components/ModalKelolaUser";
import NotificationBell from "../components/NotificationBell";
import API from "../api/api";

const Layout = ({ children }) => {
  const [kelolaUserTarget, setKelolaUserTarget] = useState(null);
  const [studentId, setStudentId] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const role = localStorage.getItem("role");
  const userName = localStorage.getItem("name");

  useEffect(() => {
    const fetchStudentId = async () => {
      if (role === "siswa") {
        try {
          const response = await API.get("/student/profile");
          setStudentId(response.data.id);
        } catch (err) {
          console.error("Error fetching student profile:", err);
        }
      }
    };

    fetchStudentId();
  }, [role]);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar onKelolaUserClick={(target) => setKelolaUserTarget(target)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">
                SMKN 14 GARUT - {role?.toUpperCase()}
              </h1>
              <p className="text-sm text-gray-600">
                Selamat datang, {userName}
              </p>
            </div>

            {/* Notification Bell - hanya untuk siswa */}
            {role === "siswa" && studentId && (
              <div className="flex items-center gap-4">
                <NotificationBell
                  studentId={studentId}
                  onNotificationUpdate={setUnreadCount}
                />
                {unreadCount > 0 && (
                  <span className="text-sm text-red-600">
                    {unreadCount} notifikasi baru
                  </span>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50">{children}</div>
      </div>

      {/* Modal Kelola User */}
      {kelolaUserTarget && (
        <ModalKelolaUser
          type={kelolaUserTarget}
          onClose={() => setKelolaUserTarget(null)}
        />
      )}
    </div>
  );
};

export default Layout;
