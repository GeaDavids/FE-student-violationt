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

      // Update dashboard data
      if (dashboardData) {
        setDashboardData((prev) => ({
          ...prev,
          summary: {
            ...prev.summary,
            unreadNotifications: Math.max(
              0,
              prev.summary.unreadNotifications - 1
            ),
          },
        }));
      }
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

      if (dashboardData) {
        setDashboardData((prev) => ({
          ...prev,
          summary: {
            ...prev.summary,
            unreadNotifications: 0,
          },
        }));
      }

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
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    if (score >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getScoreBackground = (score) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    if (score >= 40) return "bg-orange-100";
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

  const { student, summary, tindakanOtomatis } = dashboardData;
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard Siswa</h1>
          <p className="text-gray-600 mt-1">
            Selamat datang, {student?.user?.name || userName}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              fetchDashboardData();
              fetchNotifications();
            }}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <FiRefreshCw /> Refresh
          </button>
          <div className="text-right">
            <p className="text-sm text-gray-500">
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

      {/* Student Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FiUser className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">NISN</p>
              <p className="text-lg font-semibold text-gray-900">
                {student?.nisn || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FiBook className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Kelas</p>
              <p className="text-lg font-semibold text-gray-900">
                {student?.classroom?.namaKelas || "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div
              className={`p-3 rounded-full ${getScoreBackground(
                summary?.totalScore || 100
              )}`}
            >
              <FiTarget
                className={`h-6 w-6 ${getScoreColor(
                  summary?.totalScore || 100
                )}`}
              />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Credit Score</p>
              <p
                className={`text-2xl font-bold ${getScoreColor(
                  summary?.totalScore || 100
                )}`}
              >
                {summary?.totalScore || 100}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 relative">
              <FiBell className="h-6 w-6" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Notifikasi</p>
              <p className="text-lg font-semibold text-gray-900">
                {unreadCount} Belum dibaca
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Surat Peringatan Card */}
      <div className="mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <FiAlertCircle className="text-yellow-500" /> Surat Peringatan
          </h2>
          {loadingSurat ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-500 mx-auto"></div>
            </div>
          ) : surat && surat.length > 0 ? (
            <div className="space-y-3">
              {surat.map((sp) => (
                <div
                  key={sp.id}
                  className="p-4 rounded border border-yellow-300 bg-yellow-50 text-yellow-900 font-bold text-lg cursor-pointer hover:bg-yellow-100"
                  onClick={() => setSelectedSurat(sp)}
                >
                  {sp.jenisSurat}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-4">
              Belum ada surat peringatan
            </div>
          )}
        </div>
        {/* Modal Detail Surat */}
        {selectedSurat && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
                onClick={() => setSelectedSurat(null)}
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-2 text-yellow-800">
                {selectedSurat.jenisSurat}
              </h3>
              <div className="mb-2 text-gray-700">
                <span className="font-semibold">Judul:</span>{" "}
                {selectedSurat.judul || "-"}
              </div>
              <div className="mb-4 text-gray-800 border rounded bg-yellow-50 p-4 shadow-inner">
                <div className="text-center mb-2">
                  <span className="font-bold text-lg underline">
                    {selectedSurat.judul || selectedSurat.jenisSurat}
                  </span>
                </div>
                <div className="whitespace-pre-line leading-relaxed text-justify max-h-60 overflow-auto">
                  {selectedSurat.isiSurat || "-"}
                </div>
              </div>
              <div className="mb-2 text-gray-700">
                <span className="font-semibold">Tingkat:</span>{" "}
                {selectedSurat.tingkatSurat}
              </div>
              <div className="mb-2 text-gray-700">
                <span className="font-semibold">Score Saat Surat:</span>{" "}
                {selectedSurat.totalScoreSaat}
              </div>
              <div className="mb-2 text-gray-700">
                <span className="font-semibold">Status:</span>{" "}
                {selectedSurat.statusKirim}
              </div>
              <div className="mb-2 text-gray-700">
                <span className="font-semibold">Tanggal Kirim:</span>{" "}
                {selectedSurat.tanggalKirim
                  ? new Date(selectedSurat.tanggalKirim).toLocaleString("id-ID")
                  : "-"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Notifications Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FiBell /> Notifikasi
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">
                    {unreadCount}
                  </span>
                )}
              </h2>
              {unreadCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Tandai semua dibaca
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notificationLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : notifications.length > 0 ? (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      notification.isRead
                        ? "bg-gray-50 border-gray-200"
                        : "bg-blue-50 border-blue-200"
                    }`}
                    onClick={() =>
                      !notification.isRead &&
                      markNotificationAsRead(notification.id)
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-medium ${
                            notification.isRead
                              ? "text-gray-700"
                              : "text-gray-900"
                          }`}
                        >
                          {notification.judul}
                        </h4>
                        <p
                          className={`text-sm mt-1 ${
                            notification.isRead
                              ? "text-gray-500"
                              : "text-gray-600"
                          }`}
                        >
                          {notification.pesan}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDateTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiBell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Tidak ada notifikasi</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="lg:col-span-2 space-y-6">
          {/* Recent Reports */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiActivity /> Laporan Terbaru
            </h2>
            <div className="space-y-3">
              {dashboardData?.recentActivity &&
              dashboardData.recentActivity.length > 0 ? (
                dashboardData.recentActivity
                  .slice(0, 5)
                  .map((activity, index) => (
                    <div
                      key={index}
                      className={`flex justify-between items-center p-3 rounded ${
                        activity.type === "violation"
                          ? "bg-red-50 border-l-4 border-red-400"
                          : "bg-green-50 border-l-4 border-green-400"
                      }`}
                    >
                      <div>
                        <p className="font-medium text-gray-900">
                          {activity.itemName}
                        </p>
                        <p className="text-sm text-gray-600">
                          {formatDate(activity.tanggal)}
                        </p>
                        <p className="text-xs text-gray-500">
                          Dilaporkan oleh: {activity.reporter?.name}
                        </p>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full mt-1 ${
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
                      <div className="text-right">
                        <span
                          className={`font-semibold ${
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
                <p className="text-gray-500 text-center py-4">
                  Tidak ada laporan terbaru
                </p>
              )}
            </div>
          </div>

          {/* Automatic Actions */}
          {tindakanOtomatis && tindakanOtomatis.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                <FiInfo /> Tindakan Otomatis Aktif
              </h3>
              <div className="space-y-2">
                {tindakanOtomatis.map((tindakan, index) => (
                  <div key={index} className="p-3 bg-yellow-100 rounded">
                    <p className="font-medium text-yellow-900">
                      {tindakan.nama}
                    </p>
                    <p className="text-sm text-yellow-700">
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
