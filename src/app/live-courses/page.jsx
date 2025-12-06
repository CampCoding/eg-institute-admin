"use client";

import React, { useMemo, useState } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { useRouter } from "next/navigation";
import { Trash, Pencil, Video, Users, Clock, Calendar } from "lucide-react";
import DeleteModal from "@/components/DeleteModal/DeleteModal";

// Mock data for live courses
const liveCourses = [
  {
    id: 1,
    title: "Advanced JavaScript Masterclass",
    description:
      "Live interactive sessions covering advanced JavaScript concepts, ES6+, and modern frameworks.",
    teacher: "Sarah Johnson",
    level: "Advanced",
    duration: "8 weeks",
    price: "$299",
    students: 45,
    maxStudents: 50,
    nextSession: "2024-01-15T10:00:00",
    meetingLink: "https://zoom.us/j/123456789",
    status: "Active",
    poster:
      "https://images.unsplash.com/photo-1627398242454-45a1465c2479?q=80&w=1400&auto=format&fit=crop",
    color: "from-blue-500 to-purple-600",
    sessions: 16,
    completedSessions: 6,
    schedule: "Mon, Wed, Fri - 10:00 AM",
    timezone: "EST",
  },
  {
    id: 2,
    title: "React Development Bootcamp",
    description:
      "Comprehensive live training on React.js with hands-on projects and real-time coding sessions.",
    teacher: "Mike Chen",
    level: "Intermediate",
    duration: "12 weeks",
    price: "$399",
    students: 32,
    maxStudents: 40,
    nextSession: "2024-01-16T14:00:00",
    meetingLink: "https://zoom.us/j/987654321",
    status: "Active",
    poster:
      "https://images.unsplash.com/photo-1633356122544-f134324a6cee?q=80&w=1400&auto=format&fit=crop",
    color: "from-cyan-500 to-blue-600",
    sessions: 24,
    completedSessions: 8,
    schedule: "Tue, Thu - 2:00 PM",
    timezone: "EST",
  },
  {
    id: 3,
    title: "Python for Data Science",
    description:
      "Live data science workshop with Python, covering pandas, numpy, and machine learning basics.",
    teacher: "Dr. Emily Davis",
    level: "Beginner",
    duration: "10 weeks",
    price: "$349",
    students: 28,
    maxStudents: 35,
    nextSession: "2024-01-17T16:00:00",
    meetingLink: "https://zoom.us/j/456789123",
    status: "Active",
    poster:
      "https://images.unsplash.com/photo-1526379095098-d400fd0bf935?q=80&w=1400&auto=format&fit=crop",
    color: "from-green-500 to-teal-600",
    sessions: 20,
    completedSessions: 12,
    schedule: "Sat, Sun - 4:00 PM",
    timezone: "EST",
  },
  {
    id: 4,
    title: "UI/UX Design Workshop",
    description:
      "Interactive design sessions focusing on user experience, prototyping, and design thinking.",
    teacher: "Alex Rivera",
    level: "Intermediate",
    duration: "6 weeks",
    price: "$249",
    students: 22,
    maxStudents: 25,
    nextSession: "2024-01-18T11:00:00",
    meetingLink: "https://zoom.us/j/789123456",
    status: "Active",
    poster:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=1400&auto=format&fit=crop",
    color: "from-pink-500 to-red-600",
    sessions: 12,
    completedSessions: 4,
    schedule: "Mon, Wed - 11:00 AM",
    timezone: "EST",
  },
  {
    id: 5,
    title: "Digital Marketing Strategy",
    description:
      "Live sessions on modern digital marketing, social media strategies, and analytics.",
    teacher: "Lisa Thompson",
    level: "Beginner",
    duration: "8 weeks",
    price: "$199",
    students: 38,
    maxStudents: 45,
    nextSession: "2024-01-19T13:00:00",
    meetingLink: "https://zoom.us/j/321654987",
    status: "Active",
    poster:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1400&auto=format&fit=crop",
    color: "from-orange-500 to-yellow-600",
    sessions: 16,
    completedSessions: 10,
    schedule: "Fri - 1:00 PM",
    timezone: "EST",
  },
  {
    id: 6,
    title: "Cybersecurity Fundamentals",
    description:
      "Live cybersecurity training covering threat analysis, network security, and ethical hacking.",
    teacher: "Robert Kim",
    level: "Advanced",
    duration: "14 weeks",
    price: "$449",
    students: 15,
    maxStudents: 20,
    nextSession: "2024-01-20T09:00:00",
    meetingLink: "https://zoom.us/j/654987321",
    status: "Active",
    poster:
      "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1400&auto=format&fit=crop",
    color: "from-red-500 to-purple-600",
    sessions: 28,
    completedSessions: 16,
    schedule: "Tue, Thu, Sat - 9:00 AM",
    timezone: "EST",
  },
];

export default function LiveCoursesPage() {
  const router = useRouter();

  const [data, setData] = useState(liveCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  const filtered = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (c) =>
        c?.title?.toLowerCase().includes(q) ||
        c?.description?.toLowerCase().includes(q) ||
        c?.teacher?.toLowerCase().includes(q) ||
        c?.level?.toLowerCase().includes(q) ||
        c?.status?.toLowerCase().includes(q)
    );
  }, [data, searchTerm]);

  function handleDelete() {
    if (!selectedCourse) return;
    setData((prev) =>
      prev.filter((c) => String(c.id) !== String(selectedCourse.id))
    );
    setOpenDeleteModal(false);
    setSelectedCourse(null);
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

  const getProgressPercentage = (completed, total) => {
    return Math.round((completed / total) * 100);
  };

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
                {data.reduce((sum, c) => sum + c.students, 0)}
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
              <p className="text-sm text-slate-600">Live Sessions</p>
              <p className="text-xl font-semibold">
                {data.reduce((sum, c) => sum + c.sessions, 0)}
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

            {/* Media - No Video, Just Image */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={c.poster}
                alt={c.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
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
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                  {c.level}
                </span>
                <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                  {c.duration}
                </span>
                <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                  {c.students}/{c.maxStudents} students
                </span>
              </div>

              {/* Progress Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-black/20 p-3">
                <div className="flex items-center justify-between text-white text-xs mb-1">
                  <span>Progress</span>
                  <span>
                    {getProgressPercentage(c.completedSessions, c.sessions)}%
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-1.5">
                  <div
                    className="bg-white h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${getProgressPercentage(
                        c.completedSessions,
                        c.sessions
                      )}%`,
                    }}
                  ></div>
                </div>
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

              {/* Next Session Info */}
              <div className="mt-3 p-2 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span className="text-blue-800 font-medium">
                    Next Session:
                  </span>
                  <span className="text-blue-700">
                    {formatNextSession(c.nextSession)}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-blue-600 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>{c.schedule}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <span
                    title="Sessions"
                    className="inline-flex items-center gap-1"
                  >
                    <Video className="h-4 w-4" />
                    {c.completedSessions}/{c.sessions}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <svg viewBox="0 0 24 24" className="h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5Z"
                      />
                    </svg>
                    {c.teacher}
                  </span>
                </div>
                <span className="font-semibold text-[var(--text-color)]">
                  {c.price}
                </span>
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
      />
    </div>
  );
}
