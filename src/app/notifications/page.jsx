"use client";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import {
    Bell,
    Check,
    X,
    Trash2,
    Settings,
    Filter,
    Search,
    Mail,
    MessageSquare,
    AlertTriangle,
    Info,
    Heart,
    Star,
    Clock,
    Eye,
    EyeOff,
    MoreVertical,
  } from "lucide-react";
  import React, { useState } from "react";
  
  export default function Notification() {
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedNotifications, setSelectedNotifications] = useState(new Set());
    const [notifications, setNotifications] = useState([
      {
        id: 1,
        type: "message",
        title: "New message from Sarah Wilson",
        message:
          "Hey! Just wanted to check if you received the project files I sent yesterday.",
        time: "2 minutes ago",
        read: false,
        avatar:
          "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150",
        priority: "normal",
      },
      {
        id: 2,
        type: "alert",
        title: "Security Alert",
        message:
          "New login detected from Chrome on Windows. If this wasn't you, please secure your account.",
        time: "15 minutes ago",
        read: false,
        priority: "high",
      },
      {
        id: 3,
        type: "info",
        title: "System Update Available",
        message:
          "A new system update is available with bug fixes and performance improvements.",
        time: "1 hour ago",
        read: true,
        priority: "low",
      },
      {
        id: 4,
        type: "like",
        title: "John liked your post",
        message:
          "Your recent post about web development best practices received a new like.",
        time: "2 hours ago",
        read: true,
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
        priority: "normal",
      },
      {
        id: 5,
        type: "email",
        title: "Weekly Newsletter",
        message:
          "Your weekly digest of the latest news and updates is ready to read.",
        time: "3 hours ago",
        read: false,
        priority: "low",
      },
      {
        id: 6,
        type: "star",
        title: "Achievement Unlocked!",
        message:
          "Congratulations! You've completed 50 projects. Keep up the great work!",
        time: "1 day ago",
        read: true,
        priority: "normal",
      },
    ]);
  
    const getTypeIcon = (type) => {
      const iconMap = {
        message: MessageSquare,
        alert: AlertTriangle,
        info: Info,
        like: Heart,
        email: Mail,
        star: Star,
      };
      return iconMap[type] || Bell;
    };
  
    const getTypeColor = (type, priority) => {
      if (priority === "high") return "text-red-500 bg-red-100";
  
      const colorMap = {
        message: "text-blue-500 bg-blue-100",
        alert: "text-orange-500 bg-orange-100",
        info: "text-gray-500 bg-gray-100",
        like: "text-pink-500 bg-pink-100",
        email: "text-green-500 bg-green-100",
        star: "text-yellow-500 bg-yellow-100",
      };
      return colorMap[type] || "text-gray-500 bg-gray-100";
    };
  
    const filteredNotifications = notifications.filter((notification) => {
      const matchesFilter =
        filter === "all" ||
        (filter === "unread" && !notification.read) ||
        (filter === "read" && notification.read) ||
        filter === notification.type;
  
      const matchesSearch =
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase());
  
      return matchesFilter && matchesSearch;
    });
  
    const markAsRead = (id) => {
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: true } : notif))
      );
    };
  
    const markAsUnread = (id) => {
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, read: false } : notif))
      );
    };
  
    const deleteNotification = (id) => {
      setNotifications((prev) => prev.filter((notif) => notif.id !== id));
      setSelectedNotifications((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    };
  
    const toggleSelection = (id) => {
      setSelectedNotifications((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
        return newSet;
      });
    };
  
    const markAllAsRead = () => {
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    };
  
    const deleteSelected = () => {
      setNotifications((prev) =>
        prev.filter((notif) => !selectedNotifications.has(notif.id))
      );
      setSelectedNotifications(new Set());
    };
  
    const unreadCount = notifications.filter((n) => !n.read).length;
  
    return (
      <div className="min-h-screen">
        <div className="">
           <BreadCrumb title="Notifications" parent={"Home"} child="Notifications" />
         
  
          <div className="mb-6 mt-5 bg-white rounded-2xl shadow-lg p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>
  
              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                {["all", "unread", "read", "message", "alert", "info"].map(
                  (filterOption) => (
                    <button
                      key={filterOption}
                      onClick={() => setFilter(filterOption)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        filter === filterOption
                          ? "bg-teal-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {filterOption.charAt(0).toUpperCase() +
                        filterOption.slice(1)}
                    </button>
                  )
                )}
              </div>
  
              {/* Actions */}
              <div className="flex items-center gap-2">
                {selectedNotifications.size > 0 && (
                  <button
                    onClick={deleteSelected}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete ({selectedNotifications.size})
                  </button>
                )}
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg  transition-colors duration-200"
                >
                  <Check className="w-4 h-4" />
                  Mark All Read
                </button>
              </div>
            </div>
          </div>
  
          <div className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl shadow-lg">
                <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">
                  No notifications found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const IconComponent = getTypeIcon(notification.type);
                const isSelected = selectedNotifications.has(notification.id);
  
                return (
                  <div
                    key={notification.id}
                    className={`bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-l-4 ${
                      notification.priority === "high"
                        ? "border-red-500"
                        : notification.priority === "low"
                        ? "border-gray-300"
                        : "border-teal-500"
                    } ${!notification.read ? "ring-2 ring-teal-100" : ""}`}
                  >
                    <div className="p-6">
                      <div className="flex items-start gap-4">
                        {/* Selection Checkbox */}
                        <div className="flex-shrink-0 mt-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(notification.id)}
                            className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                        </div>
  
                        {/* Avatar or Icon */}
                        <div className="flex-shrink-0">
                          {notification.avatar ? (
                            <img
                              src={notification.avatar}
                              alt="Avatar"
                              className="w-12 h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div
                              className={`w-12 h-12 rounded-full flex items-center justify-center ${getTypeColor(
                                notification.type,
                                notification.priority
                              )}`}
                            >
                              <IconComponent className="w-6 h-6" />
                            </div>
                          )}
                        </div>
  
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3
                                className={`text-lg font-semibold ${
                                  !notification.read
                                    ? "text-gray-900"
                                    : "text-gray-700"
                                }`}
                              >
                                {notification.title}
                                {!notification.read && (
                                  <span className="inline-block w-2 h-2 bg-teal-500 rounded-full ml-2"></span>
                                )}
                              </h3>
                              <p className="text-gray-600 mt-1 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {notification.time}
                                </div>
                                {notification.priority === "high" && (
                                  <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                                    High Priority
                                  </span>
                                )}
                              </div>
                            </div>
  
                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  notification.read
                                    ? markAsUnread(notification.id)
                                    : markAsRead(notification.id)
                                }
                                className="p-2 text-gray-400 hover:text-teal-500 hover:bg-teal-50 rounded-lg transition-colors duration-200"
                                title={
                                  notification.read
                                    ? "Mark as unread"
                                    : "Mark as read"
                                }
                              >
                                {notification.read ? (
                                  <EyeOff className="w-5 h-5" />
                                ) : (
                                  <Eye className="w-5 h-5" />
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  deleteNotification(notification.id)
                                }
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                                title="Delete notification"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    );
  }
  