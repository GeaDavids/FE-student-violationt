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
        return <FiAlertCircle className="text-red-500 text-xl" />;
      case "achievement":
        return <FiAward className="text-green-500 text-xl" />;
      case "warning":
        return <FiAlertCircle className="text-yellow-500 text-xl" />;
      default:
        return <FiBell className="text-blue-500 text-xl" />;
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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FiBell /> Notifikasi
          </h1>
          <p className="text-gray-600 mt-1">
            Kelola dan lihat semua notifikasi Anda
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => fetchNotifications()}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600"
          >
            <FiRefreshCw /> Refresh
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="bg-green-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-600"
            >
              <FiCheckCircle /> Tandai Semua Dibaca
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FiBell className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">
                {notifications.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <FiEyeOff className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Belum Dibaca</p>
              <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FiEye className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Sudah Dibaca</p>
              <p className="text-2xl font-bold text-green-600">
                {notifications.length - unreadCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <FiFilter className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Ditampilkan</p>
              <p className="text-2xl font-bold text-purple-600">
                {filteredNotifications.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Cari notifikasi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg ${
                filter === "all"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setFilter("unread")}
              className={`px-4 py-2 rounded-lg ${
                filter === "unread"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Belum Dibaca
            </button>
            <button
              onClick={() => setFilter("read")}
              className={`px-4 py-2 rounded-lg ${
                filter === "read"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Sudah Dibaca
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Memuat notifikasi...</p>
          </div>
        ) : filteredNotifications.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  !notification.isRead
                    ? "bg-blue-50 border-l-4 border-blue-500"
                    : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3
                            className={`font-semibold ${
                              notification.isRead
                                ? "text-gray-700"
                                : "text-gray-900"
                            }`}
                          >
                            {notification.judul}
                          </h3>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getNotificationBadgeColor(
                              notification.type
                            )}`}
                          >
                            {getNotificationBadge(notification.type)}
                          </span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p
                          className={`text-sm mb-3 ${
                            notification.isRead
                              ? "text-gray-600"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.pesan}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <FiClock />
                            {formatDateTime(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
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
          <div className="p-12 text-center text-gray-500">
            <FiBell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada notifikasi
            </h3>
            <p>
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
