"use client";

import React, { useEffect, useMemo, useState } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { useRouter } from "next/navigation";
import {
  Trash,
  Pencil,
  EyeOff,
  Eye,
  Info,
  Search,
  Plus,
  BookOpen,
  Clock,
  GraduationCap,
  Layers,
  Filter,
  Grid3X3,
  List,
} from "lucide-react";
import { Modal, Spin } from "antd";
import toast from "react-hot-toast";
import { useGetAllCourses } from "../../utils/Api/Courses/GetAllCourses";
import { Toggle } from "../../utils/Api/Toggle";
import { useQueryClient } from "@tanstack/react-query";

export default function CoursesPage() {
  const router = useRouter();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [filterStatus, setFilterStatus] = useState("all"); // all | active | hidden

  const { isLoading, data } = useGetAllCourses();

  const filtered = useMemo(() => {
    let result = data?.message || [];
    const q = (searchTerm || "").trim().toLowerCase();

    // Filter by search
    if (q) {
      result = result.filter(
        (c) =>
          c?.course_name?.toLowerCase().includes(q) ||
          c?.course_descreption?.toLowerCase().includes(q) ||
          c?.level?.toLowerCase().includes(q)
      );
    }

    // Filter by status
    if (filterStatus === "active") {
      result = result.filter((c) => c?.hidden !== "1" && c?.hidden !== 1);
    } else if (filterStatus === "hidden") {
      result = result.filter((c) => c?.hidden === "1" || c?.hidden === 1);
    }

    return result;
  }, [data?.message, searchTerm, filterStatus]);

  const handleDelete = async () => {
    if (!selectedCourse) return;
    setDeleteLoading(true);

    try {
      const res = await Toggle({
        payload: { course_id: selectedCourse?.course_id },
        url: "courses/toggle_course.php",
        queryClient,
        key: "courses",
      });
      if (res.status === "success") {
        toast.success(res.message);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      toast.error("Something went wrong");
    } finally {
      setDeleteLoading(false);
      setOpenDeleteModal(false);
    }
  };

  const isSelectedHidden =
    selectedCourse &&
    (selectedCourse.hidden === "1" || selectedCourse.hidden === 1);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading courses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      <BreadCrumb title="All Courses" child="Courses" parent="Home" />

      {/* Header Actions */}
      <div className="mt-6 flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search courses..."
              className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Filter Status */}
          <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 p-1">
            {[
              { value: "all", label: "All" },
              { value: "active", label: "Active" },
              { value: "hidden", label: "Hidden" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setFilterStatus(f.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  filterStatus === f.value
                    ? "bg-teal-600 text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Toggle & Add Button */}
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid"
                  ? "bg-teal-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Grid3X3 className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list"
                  ? "bg-teal-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>

          {/* Add Course Button */}
          <button
            onClick={() => router.push("/courses/add")}
            className="flex items-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-5 py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-teal-200 transition-all"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden sm:inline">Add Course</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Courses",
            value: data?.message?.length || 0,
            icon: BookOpen,
            color: "bg-blue-50 text-blue-600",
          },
          {
            label: "Active",
            value:
              data?.message?.filter((c) => c?.hidden !== "1" && c?.hidden !== 1)
                ?.length || 0,
            icon: Eye,
            color: "bg-emerald-50 text-emerald-600",
          },
          {
            label: "Hidden",
            value:
              data?.message?.filter((c) => c?.hidden === "1" || c?.hidden === 1)
                ?.length || 0,
            icon: EyeOff,
            color: "bg-amber-50 text-amber-600",
          },
          {
            label: "Search Results",
            value: filtered?.length || 0,
            icon: Filter,
            color: "bg-purple-50 text-purple-600",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4"
          >
            <div className={`p-3 rounded-xl ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              <p className="text-sm text-gray-500">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Courses Grid/List */}
      {filtered?.length === 0 ? (
        <div className="mt-10 text-center py-16 bg-white rounded-2xl border border-gray-200">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900">
            No courses found
          </h3>
          <p className="text-gray-500 mt-1">
            Try adjusting your search or filter
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid mt-6 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {filtered?.map((c) => (
            <CourseCard
              key={c.course_id}
              course={c}
              router={router}
              onToggleStatus={() => {
                setSelectedCourse(c);
                setOpenDeleteModal(true);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {filtered?.map((c) => (
            <CourseListItem
              key={c.course_id}
              course={c}
              router={router}
              onToggleStatus={() => {
                setSelectedCourse(c);
                setOpenDeleteModal(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Status Toggle Modal */}
      <Modal
        open={openDeleteModal}
        onCancel={() => !deleteLoading && setOpenDeleteModal(false)}
        footer={null}
        centered
        closable={!deleteLoading}
        className="custom-modal"
      >
        <div className="text-center py-4">
          <div
            className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
              isSelectedHidden ? "bg-emerald-100" : "bg-amber-100"
            }`}
          >
            {isSelectedHidden ? (
              <Eye className="w-8 h-8 text-emerald-600" />
            ) : (
              <EyeOff className="w-8 h-8 text-amber-600" />
            )}
          </div>

          <h3 className="text-xl font-bold text-gray-900">
            {isSelectedHidden ? "Show Course" : "Hide Course"}
          </h3>
          <p className="text-gray-600 mt-2">
            {isSelectedHidden
              ? "This course will be visible to students."
              : "This course will be hidden from students."}
          </p>
          <p className="text-sm text-gray-500 mt-1 font-medium">
            "{selectedCourse?.course_name}"
          </p>

          <div className="flex gap-3 mt-6">
            <button
              onClick={() => setOpenDeleteModal(false)}
              disabled={deleteLoading}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteLoading}
              className={`flex-1 px-4 py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50 ${
                isSelectedHidden
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-amber-600 hover:bg-amber-700"
              }`}
            >
              {deleteLoading
                ? "Processing..."
                : isSelectedHidden
                  ? "Show Course"
                  : "Hide Course"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Course Card Component
function CourseCard({ course, router, onToggleStatus }) {
  const isHidden = course?.hidden === "1" || course?.hidden === 1;

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      {/* Media */}
      <div className="relative h-48 overflow-hidden">
        {course.video ? (
          <video
            src={course?.video}
            poster={course?.image}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <img
            src={
              course?.image ||
              "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600"
            }
            alt={course?.course_name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <span className="text-xs font-medium rounded-full bg-white/95 backdrop-blur px-3 py-1 text-gray-700">
            {course?.level}
          </span>
          {course?.Duration && (
            <span className="text-xs font-medium rounded-full bg-white/95 backdrop-blur px-3 py-1 text-gray-700 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {course?.Duration}
            </span>
          )}
        </div>

        {isHidden && (
          <div className="absolute top-3 right-3">
            <span className="text-xs font-medium rounded-full bg-rose-500 text-white px-3 py-1 flex items-center gap-1">
              <EyeOff className="w-3 h-3" />
              Hidden
            </span>
          </div>
        )}

        {/* Price Badge */}
        {course?.price && (
          <div className="absolute bottom-3 right-3">
            <span className="text-sm font-bold rounded-xl bg-white/95 backdrop-blur px-3 py-1.5 text-teal-600">
              {course?.price}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        <h2 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-teal-600 transition-colors">
          {course?.course_name}
        </h2>
        <p className="mt-2 text-gray-600 text-sm line-clamp-2">
          {course?.course_descreption}
        </p>

        {/* Meta */}
        <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4" />
            {course?.lessons || 0} lessons
          </span>
          {course?.units_count && (
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              {course?.units_count} units
            </span>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex items-center gap-2">
          <button
            onClick={() => router.push(`/courses/units/${course.course_id}`)}
            className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-teal-200 transition-all"
          >
            View Units
          </button>

          <button
            onClick={() => router.push(`/courses/details/${course.course_id}`)}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Details"
          >
            <Info className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={() => router.push(`/courses/edit/${course?.course_id}`)}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            title="Edit"
          >
            <Pencil className="w-5 h-5 text-gray-600" />
          </button>

          <button
            onClick={onToggleStatus}
            className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
            title={isHidden ? "Show" : "Hide"}
          >
            {isHidden ? (
              <Eye className="w-5 h-5 text-emerald-600" />
            ) : (
              <EyeOff className="w-5 h-5 text-amber-600" />
            )}
          </button>
        </div>
      </div>
    </article>
  );
}

// Course List Item Component
function CourseListItem({ course, router, onToggleStatus }) {
  const isHidden = course?.hidden === "1" || course?.hidden === 1;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-4 hover:shadow-lg transition-all">
      {/* Image */}
      <div className="relative w-full sm:w-48 h-32 rounded-xl overflow-hidden flex-shrink-0">
        <img
          src={
            course?.image ||
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600"
          }
          alt={course?.course_name}
          className="w-full h-full object-cover"
        />
        {isHidden && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="text-xs font-medium text-white bg-rose-500 px-2 py-1 rounded-full">
              Hidden
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-bold text-gray-900 line-clamp-1">
              {course?.course_name}
            </h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {course?.course_descreption}
            </p>
          </div>
          {course?.price && (
            <span className="text-lg font-bold text-teal-600 flex-shrink-0">
              {course?.price}
            </span>
          )}
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
            <GraduationCap className="w-4 h-4" />
            {course?.level}
          </span>
          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
            <Clock className="w-4 h-4" />
            {course?.Duration}
          </span>
          <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-lg">
            <Layers className="w-4 h-4" />
            {course?.lessons} lessons
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex sm:flex-col gap-2 flex-shrink-0">
        <button
          onClick={() => router.push(`/courses/units/${course.course_id}`)}
          className="flex-1 sm:flex-none bg-teal-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-700 transition-colors"
        >
          Units
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/courses/edit/${course?.course_id}`)}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleStatus}
            className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50"
          >
            {isHidden ? (
              <Eye className="w-4 h-4 text-emerald-600" />
            ) : (
              <EyeOff className="w-4 h-4 text-amber-600" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
