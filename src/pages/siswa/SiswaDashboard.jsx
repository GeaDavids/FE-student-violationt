// dashboard
import { useEffect, useState, useCallback } from "react";
import React from "react";
import useSuratPeringatan from "./useSuratPeringatan";
import Swal from "sweetalert2";
import API from "../../api/api";
import {
  FiUser,
  FiAward,
  FiTrendingUp,
  FiTrendingDown,
  FiInfo,
  FiCalendar,
  FiStar,
  FiActivity,
  FiBell,
  FiAlertCircle,
  FiCheckCircle,
  FiClock,
  FiBook,
  FiTarget,
  FiBarChart2,
  FiRefreshCw,
} from "react-icons/fi";

const SiswaDashboard = () => {
  // HOOKS: custom hooks must be called before any early return or conditional
  const { surat, loading: loadingSurat } = useSuratPeringatan();
  const [selectedSurat, setSelectedSurat] = useState(null);

  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notificationLoading, setNotificationLoading] = useState(false);

  const userId = localStorage.getItem("userId");
  const userName = localStorage.getItem("name");

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      // Get dashboard data directly
      const dashboardRes = await API.get("/student/dashboard");
      setDashboardData(dashboardRes.data);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      Swal.fire("Error!", "Gagal mengambil data dashboard", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      setNotificationLoading(true);

      const notifRes = await API.get("/student/notifications");
      setNotifications(notifRes.data.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setNotificationLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    fetchNotifications();

    // Refresh data every 5 minutes
    const interval = setInterval(() => {
      fetchDashboardData();
      fetchNotifications();
    }, 300000);

    return () => clearInterval(interval);
  }, [fetchDashboardData, fetchNotifications]);

  const markNotificationAsRead = async (notificationId) => {
    try {
      await API.put(`/notifications/read/${notificationId}`);

      // Update local state
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter((n) => !n.isRead);

      await Promise.all(
        unreadNotifications.map((notif) =>
          API.put(`/notifications/read/${notif.id}`)
        )
      );

      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, isRead: true }))
      );

      Swal.fire("Berhasil!", "Semua notifikasi telah dibaca", "success");
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
      Swal.fire(
        "Error!",
        "Gagal menandai semua notifikasi sebagai dibaca",
        "error"
      );
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("id-ID");
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("id-ID");
  };

  const getScoreColor = (score) => {
    if (score >= 0) return "text-green-600";
    if (score <= -100) return "text-yellow-600";
    if (score <= -200) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBackground = (score) => {
    if (score >= 0) return "bg-green-100";
    if (score <= -100) return "bg-yellow-100";
    if (score <= -200) return "bg-orange-100";
    return "bg-red-100";
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "violation":
        return <FiAlertCircle className="text-red-500" />;
      case "achievement":
        return <FiAward className="text-green-500" />;
      case "warning":
        return <FiAlertCircle className="text-yellow-500" />;
      default:
        return <FiBell className="text-blue-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">Data tidak ditemukan</p>
      </div>
    );
  }

  const { student, summary } = dashboardData;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50 p-3 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-3 text-white mb-4 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">Dashboard Siswa</h1>
            <p className="text-blue-100 text-xs mt-1">
              Selamat datang, {student?.nama || userName}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchDashboardData();
                fetchNotifications();
              }}
              className="bg-white text-blue-600 px-2 py-1.5 rounded-md flex items-center gap-1 hover:bg-blue-50 transition-all text-xs font-medium shadow-sm"
            >
              <FiRefreshCw className="w-3 h-3" /> Refresh
            </button>
            <div className="text-right">
              <p className="text-xs text-blue-100">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Student Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mb-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <div className="p-1.5 rounded-md bg-blue-100">
              <FiUser className="h-4 w-4 text-blue-600" />
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                NISN
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {student?.nisn || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <div className="p-1.5 rounded-md bg-purple-100">
              <FiBook className="h-4 w-4 text-purple-600" />
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Kelas
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {student?.kelas || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <div className="p-1.5 rounded-md bg-green-100">
              <FiCalendar className="h-4 w-4 text-green-600" />
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Angkatan
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {student?.angkatan || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <div
              className={`p-1.5 rounded-md ${getScoreBackground(
                summary?.totalScore ?? 0
              )}`}
            >
              <FiTarget
                className={`h-4 w-4 ${getScoreColor(summary?.totalScore ?? 0)}`}
              />
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Credit Score
              </p>
              <p
                className={`text-base font-bold ${getScoreColor(
                  summary?.totalScore ?? 0
                )}`}
              >
                {summary?.totalScore ?? "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <div className="p-1.5 rounded-md bg-red-100 relative">
              <FiBell className="h-4 w-4 text-red-600" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-3 h-3 text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Notifikasi
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {unreadCount} Belum dibaca
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Wali Kelas Info */}
      <div className="mb-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
          <div className="flex items-center">
            <div className="p-1.5 rounded-md bg-indigo-100">
              <FiUser className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="ml-2">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wider">
                Wali Kelas
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {student?.waliKelas || "-"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Surat Peringatan Card */}
      <div className="mb-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <FiAlertCircle className="text-white w-3 h-3" />
            </div>
            Surat Peringatan
          </h2>
          {loadingSurat ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mx-auto"></div>
              <p className="text-gray-500 mt-2 text-xs">
                Memuat surat peringatan...
              </p>
            </div>
          ) : surat && surat.length > 0 ? (
            <div className="space-y-2">
              {surat.map((sp) => (
                <div
                  key={sp.id}
                  className="group p-3 rounded-lg border border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 hover:from-yellow-100 hover:to-orange-100 hover:border-yellow-300 cursor-pointer transition-all duration-300 hover:shadow-md"
                  onClick={() => setSelectedSurat(sp)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                        <FiAlertCircle className="text-white w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-yellow-900 text-sm group-hover:text-yellow-800 transition-colors">
                          {sp.jenisSurat}
                        </h3>
                        <p className="text-yellow-700 text-xs">
                          {sp.tingkatSurat} • Score: {sp.totalScoreSaat}
                        </p>
                      </div>
                    </div>
                    <div className="text-yellow-600 group-hover:text-yellow-500 transition-colors">
                      <FiInfo className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-6 flex flex-col items-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center mb-2">
                <FiCheckCircle className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-gray-700 text-sm mb-1">
                Selamat!
              </h3>
              <p className="text-xs text-gray-500">
                Tidak ada surat peringatan
              </p>
            </div>
          )}
        </div>

        {/* Modal Detail Surat */}
        {selectedSurat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/80 p-4">
            <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-xl w-full max-h-[75vh] overflow-y-auto">
              {/* Header */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gray-600 rounded-lg flex items-center justify-center">
                    <FiAlertCircle className="text-white w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Surat Peringatan
                    </h3>
                    <p className="text-xs text-gray-600">Detail Surat</p>
                  </div>
                </div>
                <button
                  className="w-6 h-6 bg-gray-100 hover:bg-gray-200 rounded-md flex items-center justify-center text-gray-500 hover:text-gray-700 transition-all"
                  onClick={() => setSelectedSurat(null)}
                >
                  &times;
                </button>
              </div>

              {/* Judul Surat */}
              <div className="mb-4">
                <h4 className="text-base font-semibold text-gray-800 mb-2">
                  {selectedSurat.judul || selectedSurat.jenisSurat}
                </h4>
              </div>

              {/* Isi Surat */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="whitespace-pre-line leading-relaxed text-justify text-gray-700 text-xs">
                  {selectedSurat.isiSurat ||
                    "Tidak ada isi surat yang tersedia."}
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-center">
                <button
                  onClick={() => setSelectedSurat(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all text-sm"
                >
                  <FiCheckCircle className="w-3 h-3" />
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Notifications Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <FiBell className="w-4 h-4" /> Notifikasi
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs">
                    {unreadCount}
                  </span>
                )}
              </h2>
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                >
                  Tandai semua
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto">
              {notificationLoading ? (
                <div className="text-center py-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-2 rounded-lg border cursor-pointer transition-colors ${
                      notification.isRead
                        ? "bg-gray-50 border-gray-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                    onClick={() =>
                      !notification.isRead &&
                      markNotificationAsRead(notification.id)
                    }
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-0.5">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-medium text-xs ${
                            notification.isRead
                              ? "text-gray-700"
                              : "text-gray-900"
                          }`}
                        >
                          {notification.judul}
                        </h4>
                        <p
                          className={`text-xs mt-1 ${
                            notification.isRead
                              ? "text-gray-500"
                              : "text-gray-600"
                          }`}
                        >
                          {notification.pesan}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDateTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <FiBell className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">Tidak ada notifikasi</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 space-y-4">
          {/* Recent Reports */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
            <h2 className="text-base font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FiActivity className="w-4 h-4" /> Laporan Terbaru
            </h2>
            <div className="space-y-2">
              {dashboardData?.recentActivity &&
              dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity
                  .slice(0, 4)
                  .map((activity, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-2 rounded-lg ${
                        activity.type === "violation"
                          ? "bg-red-50 border-l-4 border-red-400"
                          : "bg-green-50 border-l-4 border-green-400"
                      }`}
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-xs">
                          {activity.itemName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {formatDate(activity.tanggal)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Dilaporkan oleh: {activity.reporter?.name}
                        </p>
                        <span
                          className={`inline-block px-1.5 py-0.5 text-xs rounded-full mt-1 ${
                            activity.type === "violation"
                              ? "bg-red-100 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {activity.type === "violation"
                            ? "Pelanggaran"
                            : "Prestasi"}
                        </span>
                      </div>
                      <div className="text-right ml-2">
                        <span
                          className={`font-semibold text-xs ${
                            activity.type === "violation"
                              ? "text-red-600"
                              : "text-green-600"
                          }`}
                        >
                          {activity.points > 0 ? "+" : ""}
                          {activity.points} poin
                        </span>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <FiActivity className="h-6 w-6 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs">Tidak ada laporan terbaru</p>
                </div>
              )}
            </div>
          </div>

          {/* Automatic Actions */}
          {dashboardData?.tindakanOtomatis &&
            dashboardData.tindakanOtomatis.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <h3 className="text-base font-semibold text-yellow-800 mb-2 flex items-center gap-2">
                  <FiInfo className="w-4 h-4" /> Tindakan Otomatis Aktif
                </h3>
                <div className="space-y-2">
                  {dashboardData.tindakanOtomatis.map((tindakan, index) => (
                    <div key={index} className="p-2 bg-yellow-100 rounded-lg">
                      <p className="font-medium text-yellow-900 text-xs">
                        {tindakan.nama}
                      </p>
                      <p className="text-xs text-yellow-700 mt-1">
                        {tindakan.deskripsi}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SiswaDashboard;
