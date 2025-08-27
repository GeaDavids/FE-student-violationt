import { useState, useEffect, useCallback } from "react";
import API from "../api/api";
import { FiBell, FiAlertCircle, FiAward, FiInfo, FiX } from "react-icons/fi";

const NotificationBell = ({ studentId, onNotificationUpdate }) => {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!studentId) return;

    try {
      setLoading(true);
      const response = await API.get(`/notifications/${studentId}`);
      setNotifications(response.data);

      if (onNotificationUpdate) {
        const unreadCount = response.data.filter((n) => !n.isRead).length;
        onNotificationUpdate(unreadCount);
      }
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  }, [studentId, onNotificationUpdate]);

  useEffect(() => {
    fetchNotifications();

    // Refresh notifications every 2 minutes
    const interval = setInterval(fetchNotifications, 120000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const markAsRead = async (notificationId) => {
    try {
      await API.put(`/api/notifications/read/${notificationId}`);

      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId ? { ...notif, isRead: true } : notif
        )
      );

      if (onNotificationUpdate) {
        const unreadCount = notifications.filter(
          (n) => !n.isRead && n.id !== notificationId
        ).length;
        onNotificationUpdate(unreadCount);
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
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
        return <FiInfo className="text-blue-500" />;
    }
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString("id-ID");
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <FiBell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Notifikasi
              </h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="h-5 w-5" />
              </button>
            </div>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-600 mt-1">
                {unreadCount} notifikasi belum dibaca
              </p>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : notifications.length > 0 ? (
              <div className="space-y-1">
                {notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-gray-50 cursor-pointer border-l-4 ${
                      notification.isRead
                        ? "border-gray-200 bg-white"
                        : "border-blue-500 bg-blue-50"
                    }`}
                    onClick={() =>
                      !notification.isRead && markAsRead(notification.id)
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4
                          className={`font-medium text-sm ${
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
                        <p className="text-xs text-gray-400 mt-2">
                          {formatDateTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">
                <FiBell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>Tidak ada notifikasi</p>
              </div>
            )}
          </div>

          {notifications.length > 10 && (
            <div className="p-3 border-t bg-gray-50 text-center">
              <p className="text-xs text-gray-600">
                Menampilkan 10 notifikasi terbaru
              </p>
            </div>
          )}
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </div>
  );
};

export default NotificationBell;
