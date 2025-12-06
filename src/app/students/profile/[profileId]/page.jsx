// StudentProfile.jsx
"use client";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { ArrowLeft, MapPin, Clock, Users, TrendingUp } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { Spin, message } from "antd";

export default function StudentProfile({ student }) {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [studentData, setStudentData] = useState(null);

  // Mock students data (same as in other components)
  const mockStudents = [
    {
      id: 1,
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      country: "United States",
      timezone: "America/New_York",
      password: "encrypted_password_1",
      phone: "+1 234 567 8901",
      group: "A",
      level: "intermediate",
      status: "Active",
      enrollmentDate: "2023-09-15",
      avatar: "https://i.pravatar.cc/150?img=1",
    },
    {
      id: 2,
      name: "Ahmed Al-Mansouri",
      email: "ahmed.mansouri@email.com",
      country: "UAE",
      timezone: "Asia/Dubai",
      password: "encrypted_password_2",
      phone: "+971 50 123 4567",
      group: "B",
      level: "hard",
      status: "Active",
      enrollmentDate: "2023-09-12",
      avatar: "https://i.pravatar.cc/150?img=2",
    },
    {
      id: 3,
      name: "Fatima Hassan",
      email: "fatima.hassan@email.com",
      country: "Egypt",
      timezone: "Africa/Cairo",
      password: "encrypted_password_3",
      phone: "+20 100 123 4567",
      group: "C",
      level: "beginner",
      status: "Inactive",
      enrollmentDate: "2023-09-20",
      avatar: "https://i.pravatar.cc/150?img=3",
    },
    {
      id: 4,
      name: "Alex Rodriguez",
      email: "alex.rodriguez@email.com",
      country: "Spain",
      timezone: "Europe/Madrid",
      password: "encrypted_password_4",
      phone: "+34 612 345 678",
      group: "A",
      level: "hard",
      status: "Active",
      enrollmentDate: "2022-09-10",
      avatar: "https://i.pravatar.cc/150?img=4",
    },
    {
      id: 5,
      name: "Yuki Tanaka",
      email: "yuki.tanaka@email.com",
      country: "Japan",
      timezone: "Asia/Tokyo",
      password: "encrypted_password_5",
      phone: "+81 90 1234 5678",
      group: "B",
      level: "intermediate",
      status: "Active",
      enrollmentDate: "2023-09-18",
      avatar: "https://i.pravatar.cc/150?img=5",
    },
    {
      id: 6,
      name: "Sophie Wilson",
      email: "sophie.wilson@email.com",
      country: "United Kingdom",
      timezone: "Europe/London",
      password: "encrypted_password_6",
      phone: "+44 7700 900123",
      group: "C",
      level: "beginner",
      status: "Active",
      enrollmentDate: "2023-10-01",
      avatar: "https://i.pravatar.cc/150?img=6",
    },
  ];

  useEffect(() => {
    const loadStudentData = async () => {
      try {
        setLoading(true);

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        let data;
        if (student) {
          data = student;
        } else if (params?.profileId) {
          // In real app: const response = await fetch(`/api/students/${params.id}`);
          // const data = await response.json();
          data = mockStudents.find((s) => s.id === parseInt(params.profileId));
        } else {
          // Default to first student if no ID provided
          data = mockStudents[0];
        }

        if (data) {
          setStudentData(data);
        } else {
          message.error("Student not found");
          router.push("/students");
        }
      } catch (error) {
        console.error("Error loading student:", error);
        message.error("Failed to load student data");
      } finally {
        setLoading(false);
      }
    };

    loadStudentData();
  }, [student, params?.profileId, router]);

  const Pill = ({ children, tone = "default" }) => {
    const tones = {
      default: "bg-gray-100 text-gray-700 border border-gray-200",
      success: "bg-[#02AAA0]/10 text-[#047a73] border border-[#02AAA0]/20",
      info: "bg-blue-50 text-blue-700 border border-blue-100",
      warning: "bg-yellow-50 text-yellow-700 border border-yellow-200",
      danger: "bg-red-50 text-red-700 border border-red-200",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]}`}
      >
        {children}
      </span>
    );
  };

  const getLevelColor = (level) => {
    if (level === "hard") return "danger";
    if (level === "intermediate") return "warning";
    if (level === "beginner") return "success";
    return "default";
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getEnrollmentDuration = (enrollmentDate) => {
    const start = new Date(enrollmentDate);
    const now = new Date();
    const diffTime = Math.abs(now - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffMonths = Math.floor(diffDays / 30);

    if (diffMonths > 0) {
      return `${diffMonths} month${diffMonths > 1 ? "s" : ""}`;
    }
    return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Student not found
          </h3>
          <button
            onClick={() => router.push("/students")}
            className="px-4 py-2 bg-[#02AAA0] text-white rounded-lg"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  const data = studentData;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="flex mb-4 items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
        >
          <ArrowLeft size={16} className="inline -mt-0.5 mr-1" />
          Back
        </button>
      </div>

      <BreadCrumb
        title={`Profile ${data?.name}`}
        parent={"Users"}
        child={"User Profile"}
      />

      <div className="mt-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <img
              src={data.avatar}
              alt={data.name}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-md"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  {data.name}
                </h1>
                <Pill tone={data.status === "Active" ? "success" : "danger"}>
                  {data.status}
                </Pill>
                <Pill>ID: {data.id}</Pill>
              </div>
              {(data.group || data.level) && (
                <p className="text-gray-500 mt-1">
                  {data.group && `"Group" ${data.group} • `}
                  {`${data.level.charAt(0).toUpperCase() + data.level.slice(1)}
                  Level`}
                </p>
              )}
              <div className="flex flex-wrap gap-2 mt-3">
                {data?.level && (
                  <Pill tone={getLevelColor(data.level)}>
                    {data.level.charAt(0).toUpperCase() + data.level.slice(1)}
                  </Pill>
                )}
                {data.group && <Pill tone="info">Group {data.group}</Pill>}
                <Pill>
                  Enrolled {getEnrollmentDuration(data.enrollmentDate)} ago
                </Pill>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => router.push(`/students/edit/${data?.id}`)}
                className="px-4 py-2 rounded-xl text-white"
                style={{ backgroundColor: "#02AAA0" }}
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <MapPin size={16} className="text-gray-500" />
                <div className="text-xs text-gray-500">Location</div>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {data.country}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {getTimezoneDisplay(data.timezone)}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-gray-500" />
                <div className="text-xs text-gray-500">Group</div>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                Group {data.group}
              </div>
              <div className="text-xs text-gray-500 mt-1">Learning group</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={16} className="text-gray-500" />
                <div className="text-xs text-gray-500">Level</div>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {data.level.charAt(0).toUpperCase() + data.level.slice(1)}
              </div>
              <div className="text-xs text-gray-500 mt-1">Current level</div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock size={16} className="text-gray-500" />
                <div className="text-xs text-gray-500">Enrolled</div>
              </div>
              <div className="text-lg font-semibold text-gray-900">
                {getEnrollmentDuration(data.enrollmentDate)}
              </div>
              <div className="text-xs text-gray-500 mt-1">ago</div>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Student Information */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Student Information
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Full Name
                    </label>
                    <div className="text-gray-900 font-medium">{data.name}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Email Address
                    </label>
                    <div className="text-gray-900">{data.email}</div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Phone Number
                    </label>
                    <div className="text-gray-900">{data.phone}</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Country
                    </label>
                    <div className="text-gray-900 font-medium">
                      {data.country}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Timezone
                    </label>
                    <div className="text-gray-900">
                      {getTimezoneDisplay(data.timezone)}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-500">
                      Enrollment Date
                    </label>
                    <div className="text-gray-900">
                      {formatDate(data.enrollmentDate)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic Progress */}
            {(data.group || data.level) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Academic Progress
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {data.group && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm font-medium text-gray-500 mb-2">
                        Current Group
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        Group {data.group}
                      </div>
                      <div className="text-sm text-gray-600">
                        Learning with peers
                      </div>
                    </div>
                  )}

                  {data.level && (
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <div className="text-sm font-medium text-gray-500 mb-2">
                        Skill Level
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-1">
                        {data.level.charAt(0).toUpperCase() +
                          data.level.slice(1)}
                      </div>
                      <div className="text-sm text-gray-600">
                        {data.level === "beginner" && "Building foundation"}
                        {data.level === "intermediate" && "Developing skills"}
                        {data.level === "hard" && "Advanced proficiency"}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Email</span>
                  <a
                    className="text-gray-900 hover:underline"
                    href={`mailto:${data.email}`}
                  >
                    {data.email}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Phone</span>
                  <a className="text-gray-900" href={`tel:${data.phone}`}>
                    {data.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Country</span>
                  <span className="text-gray-900">{data.country}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Timezone</span>
                  <span className="text-gray-900">
                    {getTimezoneDisplay(data.timezone)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Status & Actions
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status</span>
                  <Pill tone={data.status === "Active" ? "success" : "danger"}>
                    {data.status}
                  </Pill>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Student ID</span>
                  <span className="text-gray-900 font-medium">#{data.id}</span>
                </div>

                <div className="pt-3 border-t border-gray-100">
                  <button
                    onClick={() => router.push(`/students/edit/${data.id}`)}
                    className="w-full px-4 py-2 bg-[#02AAA0] text-white rounded-xl hover:bg-[#029a92] transition-colors"
                  >
                    Edit Student
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
          <button
            onClick={() => router.push("/students")}
            className="px-4 py-2 rounded-xl border text-gray-700 hover:bg-gray-50"
          >
            Back to Students
          </button>
          <button
            onClick={() => router.push(`/students/edit/${data.id}`)}
            className="px-4 py-2 rounded-xl text-white"
            style={{ backgroundColor: "#02AAA0" }}
          >
            Edit Profile
          </button>
        </div>
      </div>
    </div>
  );
}
