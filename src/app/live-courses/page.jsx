"use client";

import React, { useMemo, useState, useEffect } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { useRouter } from "next/navigation";
import { Trash, Pencil, Video, Users, Clock, Calendar } from "lucide-react";
import DeleteModal from "@/components/DeleteModal/DeleteModal";
import { message, Spin } from "antd";
import axios from "axios";
import { BASE_URL } from "../../utils/base_url";

export default function LiveCoursesPage() {
  const router = useRouter();

  // ✅ moved localStorage access to effect (browser-only)
  const [token, setToken] = useState(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setToken(localStorage.getItem("AccessToken"));
    }
  }, []);

  console.log(token, "token ");

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch courses from API
  useEffect(() => {
    if (token) fetchCourses();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/courses/select_live_courses.php`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data.status === "success") {
        // Transform API data to match UI structure
        const transformedData = response?.data?.message?.map((course) => ({
          id: course.course_id,
          title: course.course_name,
          description: course.course_descreption,
          overview: course.overview,
          type: course.type,
          level: capitalizeFirst(course.level),
          duration: course.Duration,
          lessons: parseInt(course.lessons) || 0,
          groupPrice: course.group_price,
          privatePrice: course.private_price,
          poster: course.image,
          video: course.video,
          advertisingVideo: course.advertising_video,
          willLearn: course.wiil_learn?.split("**CAMP**") || [],
          features: course.feature?.split("**CAMP**") || [],
          createdAt: course.created_at,
          hidden: course.hidden === "1",
          // Computed fields for UI
          status: course.hidden === "0" ? "Active" : "Inactive",
          price: `$${course.group_price}`,
          sessions: parseInt(course.lessons) || 0,
          // maxStudents: 50, // Default value, update if API provides this
          // students: 30, // Default value, update if API provides
          // teacher: "Instructor", // Default, update if API provides
          timezone: "EST",
          nextSession: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
          color: getRandomColor(),
        }));
        setData(transformedData);
      } else {
        message.error("Failed to fetch courses");
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
      message.error("Failed to fetch courses. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const capitalizeFirst = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const getRandomColor = () => {
    const colors = [
      "from-blue-500 to-purple-600",
      "from-cyan-500 to-blue-600",
      "from-green-500 to-teal-600",
      "from-pink-500 to-red-600",
      "from-orange-500 to-yellow-600",
      "from-red-500 to-purple-600",
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const filtered = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (c) =>
        c?.title?.toLowerCase().includes(q) ||
        c?.description?.toLowerCase().includes(q) ||
        // c?.teacher?.toLowerCase().includes(q) ||
        c?.level?.toLowerCase().includes(q) ||
        c?.status?.toLowerCase().includes(q)
    );
  }, [data, searchTerm]);

  async function handleDelete() {
    if (!selectedCourse) return;

    setDeleteLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/delete_course.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          course_id: selectedCourse.id,
        }),
      });

      const result = await response.json();

      if (result.status === "success") {
        setData((prev) =>
          prev.filter((c) => String(c.id) !== String(selectedCourse.id))
        );
        message.success("Course deleted successfully");
      } else {
        message.error(result.message || "Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      message.error("Failed to delete course. Please try again.");
    } finally {
      setDeleteLoading(false);
      setOpenDeleteModal(false);
      setSelectedCourse(null);
    }
  }

  const formatNextSession = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen">
        <BreadCrumb title="Live Courses" child="Live Courses" parent="Home" />
        <div className="flex items-center justify-center h-64">
          <Spin size="large" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <BreadCrumb title="Live Courses" child="Live Courses" parent="Home" />

      {/* Header Actions */}
      <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        {/* Search */}
        <div className="w-full sm:max-w-md">
          <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-200">
            <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500">
              <path
                fill="currentColor"
                d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.71.71l.27.28v.79l5 5 1.5-1.5-5-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"
              />
            </svg>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search live courses"
              className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Add Course Button */}
        <button
          onClick={() => router.push("/live-courses/add")}
          className="whitespace-nowrap rounded-xl bg-[var(--primary-color)] text-white px-4 py-2 text-sm font-medium hover:opacity-90 transition-all duration-200"
        >
          + Add Live Course
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Video className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Active Courses</p>
              <p className="text-xl font-semibold">
                {data.filter((c) => c.status === "Active").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Students</p>
              <p className="text-xl font-semibold">
                {data.reduce((sum, c) => sum + (c.students || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Total Lessons</p>
              <p className="text-xl font-semibold">
                {data.reduce((sum, c) => sum + (c.lessons || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid mt-6 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((c) => (
          <article
            key={c.id}
            className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Soft blob accent */}
            <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />
            <div className="pointer-events-none absolute -right-10 bottom-20 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />

            {/* Media */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={
                  c.poster ||
                  "https://via.placeholder.com/400x200?text=No+Image"
                }
                alt={c.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/400x200?text=No+Image";
                }}
              />
              <div
                className={`absolute inset-0 bg-gradient-to-r ${c.color} opacity-25`}
              />

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span
                  className={`text-[11px] rounded-full px-2 py-1 ring-1 font-medium ${
                    c.status === "Active"
                      ? "bg-green-100 text-green-700 ring-green-200"
                      : "bg-gray-100 text-gray-700 ring-gray-200"
                  }`}
                >
                  {c.status === "Active" ? "🟢 Live" : "⏸️ Paused"}
                </span>
              </div>

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
                <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                  {c.level}
                </span>
                <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                  {c.duration}
                </span>
                <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                  {c.lessons} lessons
                </span>
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight line-clamp-1">
                {c.title}
              </h2>
              <p className="mt-1 text-slate-600 text-sm line-clamp-2">
                {c.description}
              </p>

              {/* Price Info */}
              <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-800 font-medium">Group:</span>
                    <span className="text-blue-700">${c.groupPrice}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-blue-800 font-medium">Private:</span>
                    <span className="text-blue-700">${c.privatePrice}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <span
                    title="Lessons"
                    className="inline-flex items-center gap-1"
                  >
                    <Video className="h-4 w-4" />
                    {c.lessons} lessons
                  </span>
                  <span className="inline-flex items-center gap-1 capitalize">
                    {c.type}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={() => router.push(`/live-courses/meetings/${c.id}`)}
                  className="flex-1 rounded-xl bg-[var(--primary-color)] text-white py-2 text-sm font-medium hover:opacity-90 transition-all duration-200"
                >
                  Meetings
                </button>

                {/* Edit icon */}
                <button
                  onClick={() => router.push(`/live-courses/edit/${c.id}`)}
                  className="size-10 rounded-xl border border-slate-200 grid place-items-center hover:bg-slate-50 transition-all duration-200"
                  aria-label="Edit course"
                  title="Edit"
                >
                  <Pencil size={18} />
                </button>

                {/* Delete icon */}
                <button
                  onClick={() => {
                    setSelectedCourse(c);
                    setOpenDeleteModal(true);
                  }}
                  className="size-10 rounded-xl border border-slate-200 grid place-items-center hover:bg-slate-50 transition-all duration-200"
                  aria-label="Delete course"
                  title="Delete"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>

            {/* Focus ring */}
            <span className="absolute pointer-events-none inset-0 ring-0 ring-[var(--primary-color)] rounded-2xl opacity-0 group-hover:opacity-100 group-hover:ring-4 transition-all duration-300" />
          </article>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">
            No live courses found
          </h3>
          <p className="text-slate-600 mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Get started by creating your first live course"}
          </p>
          <button
            onClick={() => router.push("/live-courses/add")}
            className="rounded-xl bg-[var(--primary-color)] text-white px-6 py-3 text-sm font-medium hover:opacity-90 transition-all duration-200"
          >
            Create Live Course
          </button>
        </div>
      )}

      <DeleteModal
        handleSubmit={handleDelete}
        title="Delete this live course"
        description={
          selectedCourse
            ? `Do you want to delete "${selectedCourse.title}"? This will cancel all upcoming sessions.`
            : "Delete this live course?"
        }
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        loading={deleteLoading}
      />
    </div>
  );
}
