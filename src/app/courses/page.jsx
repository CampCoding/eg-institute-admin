"use client";


import React, { useEffect, useMemo, useState } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { courses as seedCourses } from "@/utils/data";
import { useRouter } from "next/navigation";
import { Trash, Pencil } from "lucide-react";
import DeleteModal from "@/components/DeleteModal/DeleteModal";
import axios from "axios";
import { BASE_URL } from "@/utils/base_url";
import { Spin } from "antd";

export default function CoursesPage() {
  const router = useRouter();
  const [allCoursesLoading , setAllCoursesLoading] = useState(false);
  const [allCoursesData , setAllCoursesData] = useState([]);

  // Start from provided dataset (no localStorage merge)
  const [data, setData] = useState(seedCourses);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);

  function handleGetAllCourses() {
    const token = localStorage.getItem("AccessToken");
    try{  
     setAllCoursesLoading(true);
     axios.get(BASE_URL+"/courses/select_live_courses.php",{
        headers : {
          "Authorization" :`Bearer ${token}`
        }
     })
     .then(res => {
      if(res?.data?.status == "success") {
        setAllCoursesData(res?.data?.message);
      }
     }).catch(e => console.log(e))
     .finally(() => setAllCoursesLoading(false))
    }catch(err) {
      console.log(err)
    }
  }

  useEffect(() => {
    handleGetAllCourses();
  } , [])

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
    if (!selectedCourse) return;
    setData((prev) => prev.filter((c) => String(c.id) !== String(selectedCourse.id)));
    setOpenDeleteModal(false);
    setSelectedCourse(null);
  }

  useEffect(() => {
    console.log(filtered)
  } , [filtered])

  if(allCoursesLoading){
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin size="large" spinning/>
      </div>
    )
  }

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
            key={c.id}
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
              {/* <div className={`absolute inset-0 bg-gradient-to-r ${c?.color} opacity-25`} /> */}

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
              </div>
            </div>

            {/* Body */}
            <div className="p-4">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight line-clamp-1">
                {c?.course_name}
              </h2>
              <p className="mt-1 text-slate-600 text-sm line-clamp-2">{c?.course_descreption}</p>

              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                <div className="flex items-center gap-3">
                  <span title="Lessons" className="inline-flex items-center gap-1">
                    <svg viewBox="0 0 24 24" className="h-4 w-4">
                      <path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z" />
                    </svg>
                    {c?.lessons} lessons
                  </span>
                  {/* <span className="inline-flex items-center gap-1">
                    <svg viewBox="0 0 24 24" className="h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5Z"
                      />
                    </svg>
                    {c.teacher}
                  </span> */}
                </div>
                <span className="font-semibold text-[var(--text-color)]">{c?.price}</span>
              </div>

              {/* Actions */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => router.push(`/courses/details/${c.id}`)}
                  className="flex-1 rounded-xl bg-[var(--primary-color)] text-white py-2 text-sm font-medium hover:opacity-90"
                >
                  Details
                </button>

                {/* {Array.isArray(c.units) && c.units.length > 0 && (
                  <button
                    onClick={() => router.push(`/courses/units/${c.id}`)}
                    className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium hover:bg-slate-50"
                  >
                    Units
                  </button>
                )} */}

                {/* Edit icon */}
                <button
                  onClick={() => router.push(`/courses/edit/${c.id}`)}
                  className="size-10 rounded-xl border border-slate-200 grid place-items-center hover:bg-slate-50"
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
                  className="size-10 rounded-xl border border-slate-200 grid place-items-center hover:bg-slate-50"
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

      <DeleteModal
        handleSubmit={handleDelete}
        title="Delete this course"
        description={
          selectedCourse
            ? `Do you want to delete "${selectedCourse.title}"?`
            : "Delete this course?"
        }
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
      />
    </div>
  );
}
