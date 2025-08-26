// notif
import { useEffect, useState, useCallback } from "react";
import Swal from "sweetalert2";
import API from "../../api/api";
import {
  FiBell,
  FiAlertCircle,
  FiAward,
  FiInfo,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiSearch,
  FiRefreshCw,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";

const SiswaNotifikasi = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, unread, read
  const [searchTerm, setSearchTerm] = useState("");

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await API.get("/student/notifications");
      setNotifications(response.data.data || []);
      setFilteredNotifications(response.data.data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      Swal.fire("Error!", "Gagal mengambil data notifikasi", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    let filtered = notifications;

    // Filter by read status
    if (filter === "unread") {
      filtered = filtered.filter((n) => !n.isRead);
    } else if (filter === "read") {
      filtered = filtered.filter((n) => n.isRead);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (n) =>
          n.judul.toLowerCase().includes(searchTerm.toLowerCase()) ||
          n.pesan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredNotifications(filtered);
  }, [notifications, filter, searchTerm]);

  const markAsRead = async (notificationId) => {
    try {
      await API.put(`/student/notifications/${notificationId}/read`);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );
    } catch (err) {
      console.error("Error marking notification as read:", err);
      Swal.fire("Error!", "Gagal menandai notifikasi sebagai dibaca", "error");
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put("/student/notifications/read-all");

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

  const getNotificationIcon = (type) => {
    switch (type) {
      case "violation":
        return <FiAlertCircle className="text-red-500 text-lg" />;
      case "achievement":
        return <FiAward className="text-green-500 text-lg" />;
      case "warning":
        return <FiAlertCircle className="text-yellow-500 text-lg" />;
      default:
        return <FiBell className="text-blue-500 text-lg" />;
    }
  };

  const getNotificationBadge = (type) => {
    switch (type) {
      case "violation":
        return "Pelanggaran";
      case "achievement":
        return "Prestasi";
      case "warning":
        return "Peringatan";
      default:
        return "Info";
    }
  };

  const getNotificationBadgeColor = (type) => {
    switch (type) {
      case "violation":
        return "bg-red-100 text-red-800";
      case "achievement":
        return "bg-green-100 text-green-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("id-ID");
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-4 space-y-4 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FiBell className="text-xl" /> Notifikasi
            </h1>
            <p className="text-blue-100 text-sm mt-1">
              Kelola dan lihat semua notifikasi Anda
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchNotifications()}
              className="bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-white/30 transition-all text-sm"
            >
              <FiRefreshCw className="text-sm" /> Refresh
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-green-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600 transition-all text-sm"
              >
                <FiCheckCircle className="text-sm" /> Tandai Semua
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
              <FiBell className="h-4 w-4" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Total</p>
              <p className="text-lg font-bold text-gray-900">
                {notifications.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-red-100 text-red-600">
              <FiEyeOff className="h-4 w-4" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Belum Dibaca</p>
              <p className="text-lg font-bold text-red-600">{unreadCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-green-100 text-green-600">
              <FiEye className="h-4 w-4" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Sudah Dibaca</p>
              <p className="text-lg font-bold text-green-600">
                {notifications.length - unreadCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-purple-100 text-purple-600">
              <FiFilter className="h-4 w-4" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-gray-600">Ditampilkan</p>
              <p className="text-lg font-bold text-purple-600">
                {filteredNotifications.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
              <input
                type="text"
                placeholder="Cari notifikasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "all"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "unread"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Belum Dibaca
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                filter === "read"
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Sudah Dibaca
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-3 text-sm text-gray-600">Memuat notifikasi...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50/70 transition-all duration-200 ${
                  !notification.isRead
                    ? "bg-blue-50/50 border-l-4 border-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-2 rounded-lg bg-gray-50">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <h3
                            className={`font-semibold text-sm truncate ${
                              notification.isRead
                                ? "text-gray-700"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.judul}
                          </h3>
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium flex-shrink-0 ${getNotificationBadgeColor(
                              notification.type
                            )}`}
                          >
                            {getNotificationBadge(notification.type)}
                          </span>
                          {!notification.isRead && (
                            <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                          )}
                        </div>
                        <p
                          className={`text-sm mb-2 line-clamp-2 ${
                            notification.isRead
                              ? "text-gray-600"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.pesan}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiClock className="text-xs" />
                            {formatDateTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-700 text-xs font-medium ml-2 flex-shrink-0 hover:bg-blue-50 px-2 py-1 rounded transition-all"
                        >
                          Tandai dibaca
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <FiBell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <h3 className="text-base font-medium text-gray-900 mb-1">
              Tidak ada notifikasi
            </h3>
            <p className="text-sm">
              {filter === "unread"
                ? "Semua notifikasi sudah dibaca"
                : filter === "read"
                ? "Belum ada notifikasi yang dibaca"
                : searchTerm
                ? "Tidak ada notifikasi yang sesuai dengan pencarian"
                : "Belum ada notifikasi untuk Anda"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SiswaNotifikasi;
