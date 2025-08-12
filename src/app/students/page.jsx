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
} from "@ant-design/icons";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { Tooltip } from "antd";
import { useRouter } from "next/navigation";



export default function StudentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [viewMode, setViewMode] = useState("table"); // table or grid

  const [students, setStudents] = useState([
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 234 567 8901",
      class: "Grade 10A",
      status: "Active",
      enrollmentDate: "2023-09-15",
      gpa: 3.8,
      avatar: "https://i.pravatar.cc/100?img=1",
      subjects: ["Mathematics", "Physics", "Chemistry"],
      attendance: 95,
      awards: 3,
    },
    {
      id: 2,
      name: "Michael Chen",
      email: "michael.chen@email.com",
      phone: "+1 234 567 8902",
      class: "Grade 11B",
      status: "Active",
      enrollmentDate: "2023-09-12",
      gpa: 3.9,
      avatar: "https://i.pravatar.cc/100?img=2",
      subjects: ["Computer Science", "Mathematics", "English"],
      attendance: 92,
      awards: 5,
    },
    {
      id: 3,
      name: "Emma Davis",
      email: "emma.davis@email.com",
      phone: "+1 234 567 8903",
      class: "Grade 9C",
      status: "Inactive",
      enrollmentDate: "2023-09-20",
      gpa: 3.6,
      avatar: "https://i.pravatar.cc/100?img=3",
      subjects: ["Biology", "Chemistry", "English"],
      attendance: 88,
      awards: 2,
    },
    {
      id: 4,
      name: "Alex Rodriguez",
      email: "alex.rodriguez@email.com",
      phone: "+1 234 567 8904",
      class: "Grade 12A",
      status: "Active",
      enrollmentDate: "2022-09-10",
      gpa: 4.0,
      avatar: "https://i.pravatar.cc/100?img=4",
      subjects: ["Advanced Math", "Physics", "Computer Science"],
      attendance: 98,
      awards: 8,
    },
    {
      id: 5,
      name: "Sophie Wilson",
      email: "sophie.wilson@email.com",
      phone: "+1 234 567 8905",
      class: "Grade 10B",
      status: "Active",
      enrollmentDate: "2023-09-18",
      gpa: 3.7,
      avatar: "https://i.pravatar.cc/100?img=5",
      subjects: ["Literature", "History", "Art"],
      attendance: 94,
      awards: 1,
    },
  ]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.class.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all"
        ? true
        : student.status.toLowerCase() === statusFilter.toLowerCase();

    const matchesClass =
      classFilter === "all"
        ? true
        : student.class === classFilter;

    return matchesSearch && matchesStatus && matchesClass;
  });

  const handleDelete = (id) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    alert("Student deleted successfully");
  };

  const handleBulkAction = (action) => {
    if (action === 'delete') {
      setStudents((prev) => prev.filter((s) => !selectedRowKeys.includes(s.id)));
      setSelectedRowKeys([]);
      alert("Selected students deleted successfully");
    }
  };

  const getGradeColor = (gpa) => {
    if (gpa >= 3.8) return "text-green-600 bg-green-50";
    if (gpa >= 3.5) return "text-blue-600 bg-blue-50";
    if (gpa >= 3.0) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getAttendanceColor = (attendance) => {
    if (attendance >= 95) return "text-green-600";
    if (attendance >= 90) return "text-blue-600";
    if (attendance >= 85) return "text-yellow-600";
    return "text-red-600";
  };

  // Statistics
  const stats = [
    {
      title: "Total Students",
      value: students.length,
      icon: UserOutlined,
      color: "bg-blue-500",
      change: "+12%",
    },
    {
      title: "Active Students",
      value: students.filter(s => s.status === "Active").length,
      icon: BookOutlined,
      color: "bg-green-500",
      change: "+8%",
    },
    {
      title: "Average GPA",
      value: (students.reduce((sum, s) => sum + s.gpa, 0) / students.length).toFixed(1),
      icon: TrophyOutlined,
      color: "bg-purple-500",
      change: "+0.2",
    },
    {
      title: "Avg Attendance",
      value: Math.round(students.reduce((sum, s) => sum + s.attendance, 0) / students.length) + "%",
      icon: CalendarOutlined,
      color: "bg-orange-500",
      change: "+3%",
    },
  ];

  const uniqueClasses = [...new Set(students.map(s => s.class))];

  return (
    <div className="min-h-screen">
      <div className="">
        {/* Breadcrumb */}
        <BreadCrumb title="User Management" parent="Dashboard" child="Users" />

        {/* Statistics Cards */}
        <div className="grid px-2 sm:px-4 mt-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-green-600 text-sm mt-2">{stat.change} from last month</p>
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
                <h2 className="text-xl font-semibold text-gray-900">Students Directory</h2>
                <p className="text-gray-600 mt-1">Manage and view all student information</p>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center gap-2">
                  <DownloadOutlined />
                  Export
                </button>
                <button
                onClick={() => router.push(`/students/add`)}
                className="px-4 py-2 bg-teal-600 !whitespace-nowrap text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center gap-2">
                  <PlusOutlined />
                  Add Student
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="p-6 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
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
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Classes</option>
                {uniqueClasses.map(cls => (
                  <option key={cls} value={cls}>{cls}</option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                    viewMode === "table" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode("grid")}
                  className={`px-3 py-2 rounded-lg transition-colors duration-200 ${
                    viewMode === "grid" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Grid
                </button>
              </div>
            </div>
          </div>

          {/* Bulk Actions */}
          {/* {selectedRowKeys.length > 0 && (
            <div className="px-6 py-3 bg-blue-50 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <span className="text-blue-800 font-medium">
                  {selectedRowKeys.length} student{selectedRowKeys.length > 1 ? 's' : ''} selected
                </span>
                <div className="flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm">
                    Bulk Edit
                  </button>
                  <button 
                    onClick={() => handleBulkAction('delete')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            </div>
          )} */}

          {/* Content */}
          <div className="p-6">
            {viewMode === "table" ? (
              /* Table View */
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {/* <th className="text-left py-3 px-2">
                        <input
                          type="checkbox"
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedRowKeys(filteredStudents.map(s => s.id));
                            } else {
                              setSelectedRowKeys([]);
                            }
                          }}
                          className="rounded border-gray-300"
                        />
                      </th> */}
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Student</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Contact</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Academic</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Performance</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200">
      
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={student.avatar}
                              alt={student.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                            <div>
                              <div className="font-medium text-gray-900">{student.name}</div>
                              <div className="text-sm text-gray-500">ID: {student.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm">
                              <MailOutlined className="text-gray-400" />
                              <span className="text-gray-700">{student.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <PhoneOutlined className="text-gray-400" />
                              <span className="text-gray-700">{student.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.class}</div>
                            <div className="text-xs text-gray-500">{student.subjects.length} subjects</div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium px-2 py-1 rounded ${getGradeColor(student.gpa)}`}>
                                GPA: {student.gpa}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <span className={`font-medium ${getAttendanceColor(student.attendance)}`}>
                                {student.attendance}% attendance
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex gap-2">
                            <Tooltip 
                            onClick={() => router.push(`/students/profile/${student?.id}`)}
                            title="Profile" className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                              <EyeOutlined />
                            </Tooltip>
                            <Tooltip title="Edit" 
                            onClick={() => router.push(`/students/edit/${student?.id}`)}
                            className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                              <EditOutlined />
                            </Tooltip>
                            <button 
                              onClick={() => handleDelete(student.id)}
                              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                            >
                              <DeleteOutlined />
                            </button>
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
                {filteredStudents.map((student) => (
                  <div key={student.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={student.avatar}
                          alt={student.name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-gray-900">{student.name}</h3>
                          <p className="text-sm text-gray-500">{student.class}</p>
                        </div>
                      </div>
                      {/* <input
                        type="checkbox"
                        checked={selectedRowKeys.includes(student.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRowKeys([...selectedRowKeys, student.id]);
                          } else {
                            setSelectedRowKeys(selectedRowKeys.filter(id => id !== student.id));
                          }
                        }}
                        className="rounded border-gray-300"
                      /> */}
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">GPA</span>
                        <span className={`text-sm font-medium px-2 py-1 rounded ${getGradeColor(student.gpa)}`}>
                          {student.gpa}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Attendance</span>
                        <span className={`text-sm font-medium ${getAttendanceColor(student.attendance)}`}>
                          {student.attendance}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Awards</span>
                        <span className="text-sm font-medium text-yellow-600 flex items-center gap-1">
                          <TrophyOutlined className="text-xs" />
                          {student.awards}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        student.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {student.status}
                      </span>
                      <div className="flex gap-1">
                        <button className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200">
                          <EyeOutlined />
                        </button>
                        <button className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors duration-200">
                          <EditOutlined />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id)}
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

            {filteredStudents.length === 0 && (
              <div className="text-center py-12">
                <UserOutlined className="text-4xl text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                <p className="text-gray-600">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredStudents.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1</span> to <span className="font-medium">{Math.min(10, filteredStudents.length)}</span> of{' '}
                <span className="font-medium">{filteredStudents.length}</span> results
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50" disabled>
                  Previous
                </button>
                <button className="px-3 py-2 bg-blue-600 text-white rounded-lg">1</button>
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