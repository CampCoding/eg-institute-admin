"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { courses } from "@/utils/data";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Play,
  Search,
  Clock3,
  ListChecks,
  ArrowLeft,
  Plus,
  Pencil,
  Eye,
  Trash,
  Loader2,
  EyeOff, // 👈 for status icon
} from "lucide-react";
import { Tooltip } from "antd";
import DeleteModal from "@/components/DeleteModal/DeleteModal";
import axios from "axios";
import { BASE_URL } from "../../../../utils/base_url";
import toast from "react-hot-toast";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setUnit } from "../../../../utils/Store/UnitsSlice";

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

  const [rowData, setRowData] = useState({});
  const [course, setcourse] = useState(null);
  const [expanded, setExpanded] = useState({});
  const [completed, setCompleted] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true); // main loading flag
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [allUnits, setAllUnits] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState({});
  const dispatch = useDispatch();

  // 👇 status modal state
  const [openStatusModal, setOpenStatusModal] = useState(null); // holds unit object or null
  const [openStatusLoading, setOpenStatusLoading] = useState(false);

  // Fetch selected course info
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("AccessToken");

    setLoading(true);
    axios
      .get(BASE_URL + "/courses/select_courses.php", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res?.data?.status === "success") {
          const filtered = res?.data?.message?.find(
            (item) => String(item?.course_id) === String(id)
          );
          setSelectedCourse(filtered || {});
        }
      })
      .catch((e) => console.log(e))
      .finally(() => setLoading(false));
  }, [id]);

  // Fetch units of this course
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("AccessToken");
    const data_send = {
      course_id: id,
    };

    setLoading(true);
    axios
      .post(BASE_URL + "/units/select_course_units.php", data_send, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res?.data?.status === "success") {
          setAllUnits(res?.data?.message || []);
        }
      })
      .catch((e) => console.log(e))
      .finally(() => setLoading(false));
  }, [id]);
  console.log(setAllUnits);

  // Local demo course meta (progress calculation etc.)
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const found = courses?.find((c) => String(c?.id) === String(id)) ?? null;

    setcourse(found);
    setLoading(false);

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

  const filteredUnits = useMemo(() => {
    if (!allUnits) return [];
    const q = search.trim().toLowerCase();
    if (!q) return allUnits;

    // add real filtering later if you want
    return allUnits.map((unit) => ({
      ...unit,
    }));
  }, [allUnits, search]);

  const totalLessons = flatLessons.length || 0;
  const completedCount = useMemo(
    () => Object.values(completed).filter(Boolean).length,
    [completed]
  );
  const progress =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const toggleUnit = (unitId) =>
    setExpanded((s) => ({ ...s, [unitId]: !s[unitId] }));

  const toggleComplete = (lessonId) =>
    setCompleted((s) => ({ ...s, [lessonId]: !s[lessonId] }));

  function handleSubmit() {
    console.log("Delete");
  }

  // 👇 STATUS CHANGE HANDLER (with refetch)
  async function handleChangeStatus() {
    if (!openStatusModal?.unit_id) return;

    try {
      setOpenStatusLoading(true);
      const token = localStorage.getItem("AccessToken");

      const res = await axios.post(
        BASE_URL + `/units/toggle_unit.php`,
        { unit_id: openStatusModal.unit_id },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res?.data?.status === "success") {
        toast.success(res?.data?.message || "Unit status updated");

        // refetch units after toggle
        const unitsRes = await axios.post(
          BASE_URL + "/units/select_course_units.php",
          { course_id: id },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (unitsRes?.data?.status === "success") {
          setAllUnits(unitsRes?.data?.message || []);
        }

        setOpenStatusModal(null);
      } else {
        toast.error(res?.data?.message || "Something went wrong");
      }
    } catch (e) {
      console.log(e);
      toast.error("Failed to update unit status");
    } finally {
      setOpenStatusLoading(false);
    }
  }

  // 👇 HANDLE LOADING HERE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-600">
          <Loader2 className="h-6 w-6 animate-spin" />
          <p className="text-sm">Loading course units...</p>
        </div>
      </div>
    );
  }
  // 👆 END LOADING HANDLER
  console.log(selectedCourse);

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
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)] !text-white px-3 py-2 text-sm hover:opacity-90"
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
              {selectedCourse?.video ? (
                <video
                  src={selectedCourse?.video}
                  poster={selectedCourse?.image}
                  className="h-full w-full object-cover"
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={
                    selectedCourse?.image ||
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
                {selectedCourse?.course_name}
              </h1>
              <p className="text-sm text-slate-600 line-clamp-2">
                {selectedCourse?.course_descreption}
              </p>
              <div className="mt-1 flex items-center gap-4 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1">
                  <ListChecks size={16} />
                  {selectedCourse?.lessons} lessons
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock3 size={16} />
                  {fmtMinutes(selectedCourse?.lessons * 15)}
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
                  (allUnits || []).map((u) => [u.unit_id, true])
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
              console.log(unit);
              const open = !!expanded[unit.unit_id];

              return (
                <section
                  key={unit.unit_id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
                >
                  {/* Section header */}
                  <button
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-slate-50"
                    aria-expanded={open}
                  >
                    <div className="flex items-center gap-3">
                      <div className="grid place-items-center size-8 rounded-lg bg-slate-100 text-slate-700">
                        {unit?.unit_id}
                      </div>
                      <div className="text-left">
                        <div>
                          <Link
                            href={`/courses/units/${id}/unit-detail/${unit?.unit_id}`}
                            onClick={() => {
                              dispatch(setUnit(unit));
                            }}
                            className="font-medium text-slate-900"
                          >
                            {unit?.unit_title}
                          </Link>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3 items-center">
                      {/* Status toggle */}
                      <Tooltip
                        title={
                          unit?.hidden == "1"
                            ? "Show this unit"
                            : "Hide this unit"
                        }
                      >
                        <button
                          type="button"
                          onClick={() => setOpenStatusModal(unit)}
                          className="p-1 rounded-md hover:bg-slate-100"
                        >
                          {unit?.hidden == "1" ? (
                            <EyeOff size={15} />
                          ) : (
                            <Eye size={15} />
                          )}
                        </button>
                      </Tooltip>

                      <Tooltip
                        title="Edit"
                        onClick={() =>
                          router.push(
                            `/courses/units/${id}/edit-unit/${unit?.unit_id}`
                          )
                        }
                      >
                        <Pencil size={15} />
                      </Tooltip>
                      <Tooltip
                        onClick={() => {
                          setOpenDeleteModal(true);
                          setRowData(unit);
                        }}
                        title="Delete"
                      >
                        <Trash size={15} />
                      </Tooltip>

                      <div onClick={() => toggleUnit(unit.unit_id)}>
                        {open ? <ChevronUp /> : <ChevronDown />}
                      </div>
                    </div>
                  </button>

                  {/* Lessons list */}
                  {open && (
                    <ul className="divide-y divide-slate-200">
                      {(unit.videos || []).map((video, i) => {
                        const lessonId = `${unit.unit_id}-lesson-${i + 1}`;
                        const done = !!completed[lessonId];

                        return (
                          <li
                            key={lessonId}
                            className="flex items-center justify-between gap-3 px-4 py-3"
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
                                  <span>{fmtMinutes(15)}</span>
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
              <div className="font-medium">{selectedCourse?.level}</div>
            </div>
            <div className="rounded-xl border border-slate-200 p-3">
              <div className="text-xs text-slate-500">Duration</div>
              <div className="font-medium">{selectedCourse?.Duration}</div>
            </div>
          </div>

          <div className="mt-4">
            <button
              onClick={() =>
                router.push(`/courses/${selectedCourse?.course_id}`)
              }
              className="w-full rounded-xl bg-[var(--primary-color)] !text-white px-4 py-2 text-sm font-medium hover:opacity-90"
            >
              Go to course? overview
            </button>
          </div>
        </aside>
      </div>

      {/* Status Modal */}
      {openStatusModal && (
        <div className="fixed inset-0 !z-[9999999999] flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
            <h3 className="text-lg font-semibold">
              {openStatusModal?.hidden == "1"
                ? "Show this unit?"
                : "Hide this unit?"}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {openStatusModal?.hidden == "1"
                ? "This unit is currently hidden. Do you want to make it visible to students?"
                : "This unit is currently visible. Do you want to hide it from students?"}
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpenStatusModal(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
                disabled={openStatusLoading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleChangeStatus}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)] px-4 py-2 text-sm !text-white hover:opacity-90 disabled:opacity-70"
                disabled={openStatusLoading}
              >
                {openStatusLoading && (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteModal
        open={openDeleteModal}
        title={"Delete This Unit"}
        description={`Do you want to delete this ${rowData?.unit_title}?`}
        setOpen={setOpenDeleteModal}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
