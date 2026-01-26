"use client";
import React, { useState } from "react";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  MoreOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  StarOutlined,
  BookOutlined,
  TrophyOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { Tooltip, message, Popconfirm } from "antd";
import { useRouter } from "next/navigation";
import useGetAllStudents from "../../utils/Api/GetAllStudents";
import { Loader2, Trash2 } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "../../utils/base_url";
import toast from "react-hot-toast";

export default function StudentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [groupFilter, setGroupFilter] = useState("all");
  const [levelFilter, setLevelFilter] = useState("all");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [viewMode, setViewMode] = useState("table"); // table or grid
  const [deletingStudents, setDeletingStudents] = useState(new Set()); // Track which students are being deleted

  const { data, isLoading, isError, refetch } = useGetAllStudents();
  console.log({ data, isLoading, isError });

  // Get token from localStorage
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("AccessToken") || localStorage.getItem("token")
      : null;

  const students = data?.message?.map((student) => {
    return {
      id: student?.student_id,
      name: student?.student_name,
      email: student?.student_email,
      country: student?.country,
      timezone: student?.time_zone,
      password: student?.password,
      phone: student?.phone,
      group: student?.student_group || "-",
      level: student?.level || "Not subscribe",
      status: student?.student_status === 0 ? "Inactive" : "Active",
      enrollmentDate: "2023-09-15",
      avatar: student?.image || "https://i.pravatar.cc/100?img=1",
    };
  });
  console.log(students);

  const filteredStudents = students?.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.country.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : student.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesGroup =
      groupFilter === "all" ? true : student.group === groupFilter;

    const matchesLevel =
      levelFilter === "all" ? true : student.level === levelFilter;

    return matchesSearch && matchesStatus && matchesGroup && matchesLevel;
  });

  // Updated handleDelete function with API call
  const handleDelete = async (studentId) => {
    if (!token) {
      toast.error("Authentication token not found. Please login again.");
      return;
    }

    // Add student to deleting set to show loading state
    setDeletingStudents((prev) => new Set([...prev, studentId]));

    try {
      const response = await axios.post(
        `${BASE_URL}/students/delete_student.php`,
        {
          student_id: studentId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 10000, // 10 seconds timeout
        }
      );

      console.log("Delete response:", response.data);

      if (response?.data?.status === "success") {
        toast.success("Student deleted successfully!");

        // Refetch the data to update the list
        refetch();
      } else {
        toast.error(response?.data?.message || "Failed to delete student");
      }
    } catch (error) {
      console.error("Error deleting student:", error);

      if (error.response) {
        // Server responded with error status
        const errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        toast.error(errorMessage);
      } else if (error.request) {
        // Request made but no response received
        toast.error(
          "Network error: Unable to connect to server. Please check your internet connection."
        );
      } else {
        // Something else happened
        toast.error("An unexpected error occurred while deleting the student.");
      }
    } finally {
      // Remove student from deleting set
      setDeletingStudents((prev) => {
        const newSet = new Set(prev);
        newSet.delete(studentId);
        return newSet;
      });
    }
  };

  // Updated handleBulkAction function
  const handleBulkAction = async (action) => {
    if (action === "delete" && selectedRowKeys.length > 0) {
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
        return;
      }

      try {
        // Add all selected students to deleting set
        setDeletingStudents((prev) => new Set([...prev, ...selectedRowKeys]));

        // Delete students one by one (you could also create a bulk delete API)
        const deletePromises = selectedRowKeys.map((studentId) =>
          axios.post(
            `${BASE_URL}/admin/students/delete_student.php`,
            { student_id: studentId },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          )
        );

        const results = await Promise.allSettled(deletePromises);

        const successCount = results.filter(
          (result) =>
            result.status === "fulfilled" &&
            result.value?.data?.status === "success"
        ).length;

        const failCount = results.length - successCount;

        if (successCount > 0) {
          toast.success(`${successCount} student(s) deleted successfully!`);
          refetch(); // Refresh the data
          setSelectedRowKeys([]); // Clear selection
        }

        if (failCount > 0) {
          toast.warning(`${failCount} student(s) could not be deleted.`);
        }
      } catch (error) {
        console.error("Error in bulk delete:", error);
        toast.error("An error occurred during bulk deletion.");
      } finally {
        // Clear deleting states
        setDeletingStudents(new Set());
      }
    }
  };

  const getLevelColor = (level) => {
    if (level === "advanced") return "text-red-600 bg-red-50";
    if (level === "intermediate") return "text-yellow-600 bg-yellow-50";
    if (level === "beginner") return "text-green-600 bg-green-50";
    if (level === "Not subscribe") return "text-gray-600 bg-gray-100";
    return "text-gray-600 bg-gray-50";
  };

  const getTimezoneDisplay = (timezone) => {
    const timezoneMap = {
      "America/New_York": "UTC-5",
      "Asia/Dubai": "UTC+4",
      "Africa/Cairo": "UTC+2",
      "Europe/Madrid": "UTC+1",
      "Asia/Tokyo": "UTC+9",
      "Europe/London": "UTC+0",
    };
    return timezoneMap[timezone] || timezone;
  };

  // Statistics
  const stats = [
    {
      title: "Total Students",
      value: students?.length || 0,
      icon: UserOutlined,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Active Students",
      value: students?.filter((s) => s.status === "Active").length || 0,
      icon: BookOutlined,
      color: "bg-green-500",
      change: "+8%",
    },
    {
      title: "Countries",
      value: new Set(students?.map((s) => s.country)).size || 0,
      icon: GlobalOutlined,
      color: "bg-purple-500",
      change: "+2",
    },
    {
      title: "This Month",
      value:
        students?.filter((s) => {
          const enrollDate = new Date(s?.enrollmentDate);
          const currentDate = new Date();
          return (
            enrollDate.getMonth() === currentDate.getMonth() &&
            enrollDate.getFullYear() === currentDate.getFullYear()
          );
        }).length || 0,
      icon: CalendarOutlined,
      color: "bg-orange-500",
      change: "+3",
    },
  ];

  const uniqueGroups = [...new Set(students?.map((s) => s.group))];
  const uniqueLevels = [...new Set(students?.map((s) => s.level))];

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="inline-flex items-center gap-2 text-slate-600">
          <Loader2 className="animate-spin" /> Loading Students.....
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <UserOutlined className="text-4xl" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Error loading students
          </h3>
          <p className="text-gray-600 mb-4">
            There was an error fetching the students data.
          </p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="">
        {/* Breadcrumb */}
        <BreadCrumb title="User Management" parent="Dashboard" child="Users" />

        {/* Statistics Cards */}
        <div className="grid px-2 sm:px-4 mt-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats?.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {stat.value}
                  </p>
                  <p className="text-green-600 text-sm mt-2">
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <stat.icon className="!text-white text-xl" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white mx-2 sm:mx-4 rounded-xl shadow-sm border border-gray-100">
          {/* Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Students Directory
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage and view all student information
                </p>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                {/* Bulk Actions */}
                {selectedRowKeys.length > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">
                      {selectedRowKeys.length} selected
                    </span>
                    <Popconfirm
                      title="Delete selected students"
                      description="Are you sure you want to delete the selected students? This action cannot be undone."
                      onConfirm={() => handleBulkAction("delete")}
                      okText="Yes, Delete"
                      cancelText="Cancel"
                      okButtonProps={{ danger: true }}
                    >
                      <button className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2">
                        <Trash2 className="w-4 h-4" />
                        Delete Selected
                      </button>
                    </Popconfirm>
                  </div>
                )}
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2">
                  <DownloadOutlined />
                  Export
                </button>
                <button
                  onClick={() => router.push(`/students/add`)}
                  className="px-4 py-2 bg-teal-600 !whitespace-nowrap text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <PlusOutlined />
                  Add Student
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="lg:col-span-2">
                <div className="relative">
                  <SearchOutlined className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>

              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Groups</option>
                {uniqueGroups?.map((group) => (
                  <option key={group} value={group}>
                    Group {group}
                  </option>
                ))}
              </select>

              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Levels</option>
                {uniqueLevels?.map((level) => (
                  <option key={level} value={level}>
                    {level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                    viewMode === "table"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                    viewMode === "grid"
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {viewMode === "table" ? (
              /* Table View */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRowKeys(
                                filteredStudents?.map((s) => s.id) || []
                              );
                            } else {
                              setSelectedRowKeys([]);
                            }
                          }}
                          checked={
                            selectedRowKeys.length ===
                              filteredStudents?.length &&
                            filteredStudents?.length > 0
                          }
                        />
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Student
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Contact
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Location
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Academic
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents?.map((student) => (
                      <tr
                        key={student.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="py-4 px-4">
                          <input
                            type="checkbox"
                            checked={selectedRowKeys.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRowKeys((prev) => [
                                  ...prev,
                                  student.id,
                                ]);
                              } else {
                                setSelectedRowKeys((prev) =>
                                  prev.filter((id) => id !== student.id)
                                );
                              }
                            }}
                          />
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-medium text-gray-900">
                                {student.name}
                              </div>
                              <div className="text-sm text-gray-500">
                                ID: {student.id}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <MailOutlined className="text-gray-400" />
                              <span className="text-gray-700">
                                {student.email}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <PhoneOutlined className="text-gray-400" />
                              <span className="text-gray-700">
                                {student.phone}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {student.country}
                            </div>
                            <div className="text-xs text-gray-500">
                              {getTimezoneDisplay(student.timezone)}
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-gray-900">
                                Group {student.group}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-sm font-medium px-2 py-1 rounded ${getLevelColor(
                                  student.level
                                )}`}
                              >
                                {student.level.charAt(0).toUpperCase() +
                                  student.level.slice(1)}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              student.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {student.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Popconfirm
                              title="Delete Student"
                              description="Are you sure you want to delete this student? This action cannot be undone."
                              onConfirm={() => handleDelete(student.id)}
                              okText="Yes, Delete"
                              cancelText="Cancel"
                              okButtonProps={{ danger: true }}
                            >
                              <button
                                disabled={deletingStudents.has(student.id)}
                                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingStudents.has(student.id) ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <DeleteOutlined />
                                )}
                              </button>
                            </Popconfirm>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredStudents?.map((student) => (
                  <div
                    key={student.id}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedRowKeys.includes(student.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRowKeys((prev) => [
                                ...prev,
                                student.id,
                              ]);
                            } else {
                              setSelectedRowKeys((prev) =>
                                prev.filter((id) => id !== student.id)
                              );
                            }
                          }}
                        />
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {student.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Group {student.group}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Country</span>
                        <span className="text-sm font-medium text-gray-900">
                          {student.country}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Level</span>
                        <span
                          className={`text-sm font-medium px-2 py-1 rounded ${getLevelColor(
                            student.level
                          )}`}
                        >
                          {student.level.charAt(0).toUpperCase() +
                            student.level.slice(1)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Enrolled</span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(
                            student.enrollmentDate
                          ).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          student.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {student.status}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() =>
                            router.push(`/students/profile/${student?.id}`)
                          }
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                        >
                          <EyeOutlined />
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/students/edit/${student?.id}`)
                          }
                          className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                        >
                          <EditOutlined />
                        </button>
                        <Popconfirm
                          title="Delete Student"
                          description="Are you sure you want to delete this student? This action cannot be undone."
                          onConfirm={() => handleDelete(student.id)}
                          okText="Yes, Delete"
                          cancelText="Cancel"
                          okButtonProps={{ danger: true }}
                        >
                          <button
                            disabled={deletingStudents.has(student.id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingStudents.has(student.id) ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <DeleteOutlined />
                            )}
                          </button>
                        </Popconfirm>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredStudents?.length === 0 && (
              <div className="text-center py-12">
                <UserOutlined className="text-4xl text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No students found
                </h3>
                <p className="text-gray-600">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredStudents?.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to{" "}
                <span className="font-medium">
                  {Math.min(10, filteredStudents?.length)}
                </span>{" "}
                of{" "}
                <span className="font-medium">{filteredStudents?.length}</span>{" "}
                results
              </div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                  disabled
                >
                  Previous
                </button>
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">
                  1
                </button>
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
