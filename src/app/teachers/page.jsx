"use client";
import React, { useMemo, useState } from "react";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  SearchOutlined,
  CalendarOutlined,
  MailOutlined,
  PhoneOutlined,
  UserOutlined,
  BookOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { Tooltip } from "antd";
import { useRouter } from "next/navigation";
// If you already have teachers data in "@/utils/data", you can import it.
// import { teachers as seedTeachers } from "@/utils/data";

// Mock data (remove if you import from your utils)
const seedTeachers = [
  {
    id: 101,
    name: "Dr. Lina Ahmed",
    email: "lina.ahmed@academy.com",
    phone: "+20 111 222 3333",
    department: "Computer Science",
    status: "Active",
    joined: "2022-08-10",
    rating: 4.8,
    avatar: "https://i.pravatar.cc/100?img=12",
    courses: ["Algorithms", "Data Structures", "Web Dev"],
    advisees: 24,
  },
  {
    id: 102,
    name: "Mr. Adam Brown",
    email: "adam.brown@academy.com",
    phone: "+20 100 444 5555",
    department: "Mathematics",
    status: "Active",
    joined: "2023-01-15",
    rating: 4.6,
    avatar: "https://i.pravatar.cc/100?img=14",
    courses: ["Calculus", "Linear Algebra"],
    advisees: 18,
  },
  {
    id: 103,
    name: "Ms. Sarah Johnson",
    email: "sarah.johnson@academy.com",
    phone: "+20 122 666 7777",
    department: "English",
    status: "Inactive",
    joined: "2021-09-01",
    rating: 4.2,
    avatar: "https://i.pravatar.cc/100?img=21",
    courses: ["Literature", "Composition"],
    advisees: 10,
  },
  {
    id: 104,
    name: "Prof. Michael Chen",
    email: "michael.chen@academy.com",
    phone: "+20 109 123 9876",
    department: "Physics",
    status: "Active",
    joined: "2020-09-12",
    rating: 4.9,
    avatar: "https://i.pravatar.cc/100?img=5",
    courses: ["Quantum Mechanics", "Thermodynamics"],
    advisees: 30,
  },
  {
    id: 105,
    name: "Mrs. Emma Davis",
    email: "emma.davis@academy.com",
    phone: "+20 101 555 2222",
    department: "Biology",
    status: "Active",
    joined: "2023-05-20",
    rating: 4.5,
    avatar: "https://i.pravatar.cc/100?img=7",
    courses: ["Genetics", "Biochemistry"],
    advisees: 16,
  },
];

export default function TeachersPage() {
  const router = useRouter();

  // STATE
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");
  const [viewMode, setViewMode] = useState("table"); // "table" | "grid"
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [teachers, setTeachers] = useState(seedTeachers);

  // DERIVED
  const departments = useMemo(
    () => Array.from(new Set(teachers.map((t) => t.department))),
    [teachers]
  );

  const filtered = teachers.filter((t) => {
    const s = searchTerm.toLowerCase();
    const matchesSearch =
      t.name.toLowerCase().includes(s) ||
      t.email.toLowerCase().includes(s) ||
      t.department.toLowerCase().includes(s);

    const matchesStatus =
      statusFilter === "all"
        ? true
        : t.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesDept = deptFilter === "all" ? true : t.department === deptFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  // HELPERS
  const getRatingBadge = (rating) => {
    if (rating >= 4.8) return "text-green-700 bg-green-50";
    if (rating >= 4.5) return "text-blue-700 bg-blue-50";
    if (rating >= 4.0) return "text-yellow-700 bg-yellow-50";
    return "text-red-700 bg-red-50";
  };

  const stats = [
    {
      title: "Total Teachers",
      value: teachers.length,
      icon: UserOutlined,
      color: "bg-blue-500",
      change: "+5%",
    },
    {
      title: "Active Teachers",
      value: teachers.filter((t) => t.status === "Active").length,
      icon: BookOutlined,
      color: "bg-green-500",
      change: "+3%",
    },
    {
      title: "Avg Rating",
      value: (teachers.reduce((s, t) => s + t.rating, 0) / teachers.length).toFixed(1),
      icon: TrophyOutlined,
      color: "bg-purple-500",
      change: "+0.1",
    },
    {
      title: "Avg Advisees",
      value:
        Math.round(
          teachers.reduce((s, t) => s + t.advisees, 0) / teachers.length
        ) || 0,
      icon: CalendarOutlined,
      color: "bg-orange-500",
      change: "+2%",
    },
  ];

  const handleDelete = (id) => {
    setTeachers((prev) => prev.filter((t) => t.id !== id));
    setSelectedRowKeys((prev) => prev.filter((key) => key !== id));
    // Optional: toast/notification
  };

  const handleBulkDelete = () => {
    setTeachers((prev) => prev.filter((t) => !selectedRowKeys.includes(t.id)));
    setSelectedRowKeys([]);
  };

  // UI
  return (
    <div className="min-h-screen">
      <BreadCrumb title="Instructors" parent="Dashboard" child="Instructors" />

      {/* Stats */}
      <div className="grid px-2 sm:px-4 mt-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((s, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{s.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                <p className="text-green-600 text-sm mt-2">{s.change} from last month</p>
              </div>
              <div className={`p-3 rounded-xl ${s.color}`}>
                <s.icon className="!text-white text-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Card */}
      <div className="bg-white mx-2 sm:mx-4 rounded-xl shadow-sm border border-gray-100">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Instructors Directory</h2>
              <p className="text-gray-600 mt-1">Manage and view all teacher information</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/teachers/add")}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center gap-2"
              >
                <PlusOutlined />
                Add Teacher
              </button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Instructors..."
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
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>

            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
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

        {/* Bulk Bar */}
        {/* {selectedRowKeys.length > 0 && (
          <div className="px-6 py-3 bg-blue-50 border-b border-blue-200 flex items-center justify-between">
            <span className="text-blue-800 font-medium">
              {selectedRowKeys.length} selected
            </span>
            <div className="flex gap-2">
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
              >
                Delete Selected
              </button>
            </div>
          </div>
        )} */}

        {/* Content */}
        <div className="p-6">
          {viewMode === "table" ? (
            /* TABLE VIEW */
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      {/* Checkbox header (optional) */}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Teacher
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Contact
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Department / Courses
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">
                      Rating / Advisees
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
                  {filtered.map((t) => {
                    const isSelected = selectedRowKeys.includes(t.id);
                    return (
                      <tr
                        key={t.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200"
                      >
                        <td className="py-4 px-4">
                          {/* <input
                            type="checkbox"
                            className="rounded border-gray-300"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedRowKeys((prev) => [...prev, t.id]);
                              } else {
                                setSelectedRowKeys((prev) =>
                                  prev.filter((id) => id !== t.id)
                                );
                              }
                            }}
                          /> */}
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={t.avatar}
                              alt={t.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-medium text-gray-900">
                                {t.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                ID: {t.id} • Joined{" "}
                                {new Date(t.joined).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <MailOutlined className="text-gray-400" />
                              <span className="text-gray-700">{t.email}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <PhoneOutlined className="text-gray-400" />
                              <span className="text-gray-700">{t.phone}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {t.department}
                            </div>
                            <div className="text-xs text-gray-500">
                              {t.courses.length} course
                              {t.courses.length > 1 ? "s" : ""}
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-2">
                            <span
                              className={`text-sm font-medium px-2 py-1 rounded ${getRatingBadge(
                                t.rating
                              )}`}
                            >
                              Rating: {t.rating}
                            </span>
                            <div className="text-sm text-gray-700">
                              Advisees:{" "}
                              <span className="font-medium">{t.advisees}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              t.status === "Active"
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Tooltip
                              title="Profile"
                              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            >
                              <button
                                onClick={() =>
                                  router.push(`/teachers/profile/${t.id}`)
                                }
                              >
                                <EyeOutlined />
                              </button>
                            </Tooltip>
                            <Tooltip
                              title="Edit"
                              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                            >
                              <button
                                onClick={() =>
                                  router.push(`/teachers/edit/${t.id}`)
                                }
                              >
                                <EditOutlined />
                              </button>
                            </Tooltip>
                            <button
                              onClick={() => handleDelete(t.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            >
                              <DeleteOutlined />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <UserOutlined className="text-4xl text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No Instructors found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filter criteria
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filtered.map((t) => (
                <div
                  key={t.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={t.avatar}
                        alt={t.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{t.name}</h3>
                        <p className="text-sm text-gray-500">{t.department}</p>
                      </div>
                    </div>
                    {/* <input
                      type="checkbox"
                      checked={selectedRowKeys.includes(t.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRowKeys((prev) => [...prev, t.id]);
                        } else {
                          setSelectedRowKeys((prev) =>
                            prev.filter((id) => id !== t.id)
                          );
                        }
                      }}
                      className="rounded border-gray-300"
                    /> */}
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Rating</span>
                      <span
                        className={`text-sm font-medium px-2 py-1 rounded ${getRatingBadge(
                          t.rating
                        )}`}
                      >
                        {t.rating}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Advisees</span>
                      <span className="text-sm font-medium text-gray-800">
                        {t.advisees}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Courses</span>
                      <span className="text-sm font-medium text-gray-800">
                        {t.courses.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        t.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.status}
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={() => router.push(`/teachers/profile/${t.id}`)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                      >
                        <EyeOutlined />
                      </button>
                      <button
                        onClick={() => router.push(`/teachers/edit/${t.id}`)}
                        className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200"
                      >
                        <EditOutlined />
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer (simple pagination placeholder) */}
        {filtered.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{" "}
              <span className="font-medium">
                {Math.min(10, filtered.length)}
              </span>{" "}
              of <span className="font-medium">{filtered.length}</span> results
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50" disabled>
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
  );
}
