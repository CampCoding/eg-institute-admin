"use client";

import React, { useEffect, useMemo, useState } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { courses as seedCourses } from "@/utils/data";
import { useRouter } from "next/navigation";
import { Trash, Pencil, EyeOff, Eye, Info } from "lucide-react";
import axios from "axios";
import { BASE_URL } from "@/utils/base_url";
import { Modal, Spin } from "antd";
import toast from "react-hot-toast";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

export default function CoursesPage() {
  const router = useRouter();
  const [allCoursesLoading, setAllCoursesLoading] = useState(false);
  const [allCoursesData, setAllCoursesData] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  // Start from provided dataset (not actually used after fetch)
  const [data, setData] = useState(seedCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  function handleGetAllCourses() {
    const token = localStorage.getItem("AccessToken");
    try {
      setAllCoursesLoading(true);
      axios
        .get(BASE_URL + "/courses/select_live_courses.php", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          if (res?.data?.status === "success") {
            setAllCoursesData(res?.data?.message || []);
          }
        })
        .catch((e) => console.log(e))
        .finally(() => setAllCoursesLoading(false));
    } catch (err) {
      console.log(err);
      setAllCoursesLoading(false);
    }
  }

  useEffect(() => {
    handleGetAllCourses();
  }, []);

  const filtered = useMemo(() => {
    const q = (searchTerm || "").trim().toLowerCase();
    if (!q) return allCoursesData;
    return allCoursesData?.filter(
      (c) =>
        c?.course_name?.toLowerCase().includes(q) ||
        c?.course_descreption?.toLowerCase().includes(q) ||
        c?.level?.toLowerCase().includes(q)
    );
  }, [allCoursesData, searchTerm]);

  function handleDelete() {
    const token = localStorage.getItem("AccessToken");
    setDeleteLoading(true);

    if (!selectedCourse) {
      setDeleteLoading(false);
      return;
    }

    const data_send = {
      course_id: selectedCourse?.course_id,
    };

    axios
      .post(BASE_URL + "/courses/toggle_course.php", data_send, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res?.data?.status === "success") {
          toast.success(res?.data?.message || "Status updated");
          setOpenDeleteModal(false);
          setSelectedCourse(null);
          // Refresh list to reflect new status
          handleGetAllCourses();
        } else {
          toast.error(res?.data?.message || "Failed to update status");
        }
      })
      .catch((e) => {
        console.log(e);
        toast.error("Something went wrong");
      })
      .finally(() => setDeleteLoading(false));
  }

  useEffect(() => {
    console.log(filtered);
  }, [filtered]);

  if (allCoursesLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" spinning />
      </div>
    );
  }

  // Helper: check if course is hidden ("1" or 1)
  const isSelectedHidden =
    selectedCourse &&
    (selectedCourse.hidden === "1" ||
      selectedCourse.hidden === 1 ||
      selectedCourse.hidden === true);

  return (
    <div className="min-h-screen">
      <BreadCrumb title="All Courses" child="Courses" parent="Home" />

      {/* Search */}
      <div className="mt-4 w-full">
        <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 max-w-full ring-1 ring-slate-200">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500">
            <path
              fill="currentColor"
              d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.71.71l.27.28v.79l5 5 1.5-1.5-5-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"
            />
          </svg>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search courses"
            className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid mt-5 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filtered?.map((c) => (
          <article
            key={c.course_id ?? c.id}
            className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Soft blob accent */}
            <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />
            <div className="pointer-events-none absolute -right-10 bottom-20 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />

            {/* Media */}
            <div className="relative h-44 overflow-hidden">
              {c.video ? (
                <video
                  src={c?.video}
                  poster={c?.image}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
              ) : (
                <img
                  src={
                    c?.image ||
                    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1400&auto=format&fit=crop"
                  }
                  alt={c?.course_name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                  {c?.level}
                </span>
                <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                  {c?.Duration}
                </span>
                {Array.isArray(c?.lessons) && c?.lessons?.length > 0 && (
                  <span
                    className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200"
                    title={`${c?.lessons?.length} units`}
                  >
                    {c?.lessons?.length} units
                  </span>
                )}
                {(c?.hidden === "1" || c?.hidden === 1) && (
                  <span className="text-[11px] rounded-full bg-red-100 text-red-700 px-2 py-1 ring-1 ring-red-200">
                    Hidden
                  </span>
                )}
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight line-clamp-1">
                {c?.course_name}
              </h2>
              <p className="mt-1 text-slate-600 text-sm line-clamp-2">
                {c?.course_descreption}
              </p>

              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <span
                    title="Lessons"
                    className="inline-flex items-center gap-1"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z"
                      />
                    </svg>
                    {c?.lessons} lessons
                  </span>
                </div>
                <span className="font-semibold text-[var(--text-color)]">
                  {c?.price}
                </span>
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() =>
                    router.push(`/courses/units/${c.course_id ?? c.id}`)
                  }
                  className="flex-1 rounded-xl bg-[var(--primary-color)] !text-white py-2 text-sm font-medium hover:opacity-90"
                >
                  Units
                </button>

                {/* Edit icon */}
                <button 
                title="Details"
                className="size-10 rounded-xl border border-slate-200 grid place-items-center hover:bg-slate-50"
                onClick={() => router.push(`/courses/details/${c.course_id ?? c.id}`)}>
                  <Info  size={18}/>
                </button>
                <button
                  onClick={() =>
                    router.push(`/courses/edit/${c?.course_id ?? c.id}`)
                  }
                  className="size-10 rounded-xl border border-slate-200 grid place-items-center hover:bg-slate-50"
                  aria-label="Edit course"
                  title="Edit"
                >
                  <Pencil size={18} />
                </button>

                {/* Delete / Toggle status icon */}
                <button
                  onClick={() => {
                    setSelectedCourse(c);
                    setOpenDeleteModal(true);
                  }}
                  className="size-10 rounded-xl border border-slate-200 grid place-items-center hover:bg-slate-50"
                  aria-label="Toggle course status"
                  title={
                    c?.hidden === "1" || c?.hidden === 1 ? "Show course" : "Hide course"
                  }
                >
                  {c?.hidden? <Eye size={18}/>:<EyeOff size={18} /> }
                </button>
              </div>
            </div>

            {/* Focus ring */}
            <span className="absolute pointer-events-none inset-0 ring-0 ring-[var(--primary-color)] rounded-2xl opacity-0 group-hover:opacity-100 group-hover:ring-4 transition-all duration-300" />
          </article>
        ))}
      </div>

      {/* Status Modal (Hide / Show) */}
      <Modal
        open={openDeleteModal}
        onCancel={() => {
          if (!deleteLoading) {
            setOpenDeleteModal(false);
            setSelectedCourse(null);
          }
        }}
        footer={null}
        centered
        closable={!deleteLoading}
      >
        <Box
          sx={{
            width: "100%",
          }}
          className="rounded-md shadow-lg max-w-md mx-auto bg-white"
        >
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            className="text-lg font-semibold text-center text-gray-800"
          >
            {isSelectedHidden ? "Show this course" : "Hide this course"}
          </Typography>
          <Typography
            id="modal-modal-description"
            sx={{ mt: 2 }}
            className="text-sm text-center font-bold text-gray-600"
          >
            Do you want to {isSelectedHidden ? "show" : "hide"} this course?
          </Typography>
          <div className="flex justify-center gap-4 mt-4">
            <Button
              onClick={handleDelete}
              variant="contained"
              disabled={deleteLoading}
              sx={{
                bgcolor: "#dc2626",
                color: "white",
                "&:hover": { bgcolor: "#b91c1c" },
              }}
            >
              {deleteLoading
                ? "Loading..."
                : isSelectedHidden
                ? "Show"
                : "Hide"}
            </Button>

            <Button
              onClick={() => {
                if (!deleteLoading) {
                  setOpenDeleteModal(false);
                  setSelectedCourse(null);
                }
              }}
              variant="outlined"
              sx={{
                borderColor: "#ef4444",
                color: "#dc2626",
                "&:hover": {
                  bgcolor: "#ef4444",
                  color: "white",
                  borderColor: "#ef4444",
                },
              }}
            >
              Cancel
            </Button>
          </div>
        </Box>
      </Modal>
    </div>
  );
}
