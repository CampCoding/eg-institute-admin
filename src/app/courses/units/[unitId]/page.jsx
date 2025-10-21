"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { courses } from "@/utils/data";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Lock,
  Play,
  Search,
  Clock3,
  ListChecks,
  ArrowLeft,
  CirclePlus,
  Plus,
  Pencil,
  Eye,
  Trash,
} from "lucide-react";
import { Tooltip } from "antd";
import DeleteModal from "@/components/DeleteModal/DeleteModal";

/** Utility: format total minutes like 125 -> "2h 5m" */
const fmtMinutes = (mins = 0) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

export default function courseUnitsPage() {
  const router = useRouter();
  const params = useParams();
  const id = useMemo(
    () => (Array.isArray(params?.unitId) ? params.unitId[0] : params?.unitId),
    [params]
  );
  const [rowData , setRowData] = useState({});
  const [course, setcourse] = useState(null);
  const [expanded, setExpanded] = useState({}); // unitId -> boolean
  const [completed, setCompleted] = useState({}); // lessonId -> boolean
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openDeleteModal , setOpenDeleteModal] = useState(false);
  // Load course? once id changes
  useEffect(() => {
    setLoading(true);
    const found = courses?.find((c) => String(c?.id) === String(id)) ?? null;

    setcourse(found);
    setLoading(false);

    // expand first unit by default
    if (found?.units?.[0]?.unitId) {
      setExpanded({ [found.units[0].unitId]: true });
    }
  }, [id]);

  const flatLessons = useMemo(() => {
    if (!course?.units) return [];
    return course?.units.flatMap((unit) =>
      (unit.videos || []).map((v, i) => ({
        ...unit,
        videoUrl: v,
        unitId: unit.unitId,
        lessonId: `lesson-${unit.unitId}-${i + 1}`,
        lessonTitle: `Lesson ${i + 1}: ${unit.name}`,
        pdfUrl: unit.pdfs?.[i] || "",
      }))
    );
  }, [course]);

  // Filter by search across lessons titles
  const filteredUnits = useMemo(() => {
    if (!course?.units) return [];
    const q = search.trim().toLowerCase();
    if (!q) return course?.units;
    return course?.units
      .map((unit) => ({
        ...unit,
        videos: unit.videos?.filter((video, i) =>
          video.toLowerCase().includes(q)
        ),
      }))
      .filter((unit) => unit.videos?.length);
  }, [course, search]);

  // Progress
  const totalLessons = flatLessons.length || 0;
  const completedCount = useMemo(
    () => Object.values(completed).filter(Boolean).length,
    [completed]
  );
  const progress =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Expand/collapse units
  const toggleUnit = (unitId) =>
    setExpanded((s) => ({ ...s, [unitId]: !s[unitId] }));

  // Mark lesson complete/incomplete
  const toggleComplete = (lessonId) =>
    setCompleted((s) => ({ ...s, [lessonId]: !s[lessonId] }));

  function handleSubmit() {
    console.log("Delete")
  }

  return (
    <div className="min-h-screen">
      <div className="flex mb-4 items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
        >
          <ArrowLeft size={16} className="inline -mt-0.5 mr-1" />
          Back
        </button>
        <button
          type="button"
          onClick={() => router.push(`/courses/units/${id}/add-unit`)}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)] text-white px-3 py-2 text-sm hover:opacity-90"
        >
          <Plus size={16} /> Add
        </button>
      </div>

      <BreadCrumb
        title={`Units of ${course?.title}` || "course Units"}
        parent="courses"
        child="Units"
      />

      {/* Header strip */}
      <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative h-16 w-28 overflow-hidden rounded-xl ring-1 ring-slate-200">
              {course?.video ? (
                <video
                  src={course?.video}
                  poster={course?.poster}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={
                    course?.poster ||
                    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop"
                  }
                  alt="poster"
                  className="h-full w-full object-cover"
                />
              )}
              <div
                className={`absolute inset-0 bg-gradient-to-r ${course?.color} opacity-20`}
              />
            </div>
            <div>
              <h1 className="text-lg font-semibold leading-tight line-clamp-2">
                {course?.title}
              </h1>
              <p className="text-sm text-slate-600 line-clamp-2">
                {course?.description}
              </p>
              <div className="mt-1 flex items-center gap-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <ListChecks size={16} />
                  {totalLessons} lessons
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 size={16} />
                  {fmtMinutes(totalLessons * 15)}{" "}
                  {/* assume 15 min per lesson */}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mt-4 flex flex-col lg:flex-row gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-200">
            <Search size={18} className="text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Units"
              className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setExpanded(
                Object.fromEntries(
                  (course?.units || []).map((u) => [u.unitId, true])
                )
              )
            }
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white hover:bg-slate-50"
          >
            Expand all
          </button>
          <button
            type="button"
            onClick={() => setExpanded({})}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white hover:bg-slate-50"
          >
            Collapse all
          </button>
        </div>
      </div>

      {/* Main grid */}
      <div className="mt-5 grid gap-6 lg:grid-cols-3">
        {/* Units */}
        <div className="lg:col-span-2 space-y-4">
          {filteredUnits.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-slate-600">
              No lessons match your search.
            </div>
          ) : (
            filteredUnits.map((unit) => {
              const open = !!expanded[unit.unitId];

              return (
                <section
                  key={unit.unitId}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
                >
                  {/* Section header */}
                  <button
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
                    aria-expanded={open}
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid place-items-center size-8 rounded-lg bg-slate-100 text-slate-700">
                        {unit.unitNumber}
                      </div>
                      <div className="text-left">
                        <h3 className="font-semibold">{unit.name}</h3>
                        <p className="text-xs text-slate-600">
                          {unit.lessonsCount} lessons
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      <Tooltip
                        title="Details"
                        onClick={() =>
                          router.push(
                            `/courses/units/${unit.unitId}/unit-detail/${id}`
                          )
                        }
                      >
                        <Eye size={15} />
                      </Tooltip>
                      <Tooltip
                        title="Edit"
                        onClick={() =>
                          router.push(`/courses/units/${id}/edit-unit/${id}`)
                        }
                      >
                        <Pencil size={15} />
                      </Tooltip>
                      <Tooltip 
                      onClick={() => {
                        setOpenDeleteModal(true)
                        setRowData(unit)
                      }}
                      title="Delete">
                        <Trash size={15} />
                      </Tooltip>

                      <div className="" onClick={() => toggleUnit(unit.unitId)}>
                        {open ? <ChevronUp /> : <ChevronDown />}
                      </div>
                    </div>
                  </button>

                  {/* Lessons list */}
                  {open && (
                    <ul className="divide-y divide-slate-200">
                      {unit.videos.map((video, i) => {
                        const lessonId = `${unit.unitId}-lesson-${i + 1}`;
                        const done = !!completed[lessonId];

                        return (
                          <li
                            key={lessonId}
                            className="flex items-center  justify-between gap-3 px-4 py-3"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <button
                                onClick={() => toggleComplete(lessonId)}
                                className={`grid place-items-center size-6 rounded-full border ${
                                  done
                                    ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                    : "bg-white border-slate-300 text-slate-400"
                                }`}
                                title={
                                  done ? "Mark incomplete" : "Mark complete"
                                }
                              >
                                <CheckCircle2 size={16} />
                              </button>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium truncate">
                                    {`Lesson ${i + 1}`}
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500 flex items-center gap-2">
                                  <Clock3 size={14} />
                                  <span>{fmtMinutes(15)}</span>{" "}
                                  {/* assumed 15 minutes per lesson */}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                onClick={() =>
                                  router.push(
                                    `/courses/${course?.id}?play=${lessonId}`
                                  )
                                }
                                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
                              >
                                <Play size={16} />
                                Play
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </section>
              );
            })
          )}
        </div>

        {/* Sidebar */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 h-max sticky top-20">
          <h4 className="font-semibold">About this course?</h4>
          <div className="mt-2 grid grid-cols-2 gap-3 text-sm text-slate-700">
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs text-slate-500">Level</div>
              <div className="font-medium">{course?.level}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs text-slate-500">Duration</div>
              <div className="font-medium">{course?.duration}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3 col-span-2">
              <div className="text-xs text-slate-500">Teacher</div>
              <div className="font-medium">{course?.teacher}</div>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() => router.push(`/courses/${course?.id}`)}
              className="w-full rounded-xl bg-[var(--primary-color)] text-white px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Go to course? overview
            </button>
          </div>
        </aside>
      </div>


      <DeleteModal open={openDeleteModal} title={"Delte This Unit"} description={`Do You Want to delete this ${rowData?.title}?`} setOpen={setOpenDeleteModal} handleSubmit={handleSubmit}/>
    </div>
  );
}
