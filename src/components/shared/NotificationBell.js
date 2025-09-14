"use client";
import { useState, useEffect } from "react";
import axios from "axios";

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [hasUnread, setHasUnread] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/notifications", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setNotifications(res.data.notifications);
      setHasUnread(res.data.hasUnread);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const handleToggle = async () => {
    setOpen(!open);
    if (hasUnread) {
      const token = localStorage.getItem("token");
      await axios.post("/api/notifications/mark-read", null, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setHasUnread(false);
    }
  };

  return (
    <div className="relative inline-block text-left z-50">
      <button onClick={handleToggle} className="relative text-2xl">
        🔔
        {hasUnread && (
          <span className="absolute top-0 right-0 inline-block w-2 h-2 bg-red-500 rounded-full" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-lg rounded-md p-3 max-h-64 overflow-y-auto border border-gray-200">
          <h4 className="font-semibold text-sm mb-2">Notifications</h4>
          {notifications.length === 0 ? (
            <p className="text-sm text-gray-500">No notifications</p>
          ) : (
            notifications.map((n, idx) => (
              <div key={idx} className="text-sm border-b py-2 last:border-none">
                <div>{n.message}</div>
                <div className="text-xs text-gray-400">
                  {new Date(n.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
