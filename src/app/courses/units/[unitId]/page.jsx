"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
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
  EyeOff,
  BookOpen,
  FileText,
  Video,
  HelpCircle,
  GripVertical,
  MoreVertical,
} from "lucide-react";
import { Tooltip, Dropdown } from "antd";
import DeleteModal from "@/components/DeleteModal/DeleteModal";
import axios from "axios";
import { BASE_URL } from "../../../../utils/base_url";
import toast from "react-hot-toast";
import Link from "next/link";
import { useDispatch } from "react-redux";
import { setUnit } from "../../../../utils/Store/UnitsSlice";

const fmtMinutes = (mins = 0) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

export default function CourseUnitsPage() {
  const router = useRouter();
  const params = useParams();
  const id = useMemo(
    () => (Array.isArray(params?.unitId) ? params.unitId[0] : params?.unitId),
    [params]
  );

  const [rowData, setRowData] = useState({});
  const [expanded, setExpanded] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [allUnits, setAllUnits] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState({});
  const [openStatusModal, setOpenStatusModal] = useState(null);
  const [openStatusLoading, setOpenStatusLoading] = useState(false);
  const dispatch = useDispatch();

  // Fetch selected course info
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("AccessToken");

    setLoading(true);
    axios
      .get(BASE_URL + "/courses/select_courses.php", {
        headers: { Authorization: `Bearer ${token}` },
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

  // Fetch units
  useEffect(() => {
    if (!id) return;
    const token = localStorage.getItem("AccessToken");

    setLoading(true);
    axios
      .post(
        BASE_URL + "/units/select_course_units.php",
        { course_id: id },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then((res) => {
        if (res?.data?.status === "success") {
          setAllUnits(res?.data?.message || []);
        }
      })
      .catch((e) => console.log(e))
      .finally(() => setLoading(false));
  }, [id]);

  const filteredUnits = useMemo(() => {
    if (!allUnits) return [];
    const q = search.trim().toLowerCase();
    if (!q) return allUnits;
    return allUnits.filter((unit) =>
      unit?.unit_title?.toLowerCase().includes(q)
    );
  }, [allUnits, search]);

  const toggleUnit = (unitId) =>
    // setExpanded((s) => ({ ...s, [unitId]: !s[unitId] }));

    async function handleChangeStatus() {
      if (!openStatusModal?.unit_id) return;

      try {
        setOpenStatusLoading(true);
        const token = localStorage.getItem("AccessToken");

        const res = await axios.post(
          BASE_URL + `/units/toggle_unit.php`,
          { unit_id: openStatusModal.unit_id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (res?.data?.status === "success") {
          toast.success(res?.data?.message || "Unit status updated");

          const unitsRes = await axios.post(
            BASE_URL + "/units/select_course_units.php",
            { course_id: id },
            { headers: { Authorization: `Bearer ${token}` } }
          );

          if (unitsRes?.data?.status === "success") {
            setAllUnits(unitsRes?.data?.message || []);
          }

          setOpenStatusModal(null);
        } else {
          toast.error(res?.data?.message || "Something went wrong");
        }
      } catch (e) {
        toast.error("Failed to update unit status");
      } finally {
        setOpenStatusLoading(false);
      }
    };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading units...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-10">
      {/* Header Actions */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <button
          onClick={() => router.push(`/courses/units/${id}/add-unit`)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-200 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Unit</span>
        </button>
      </div>

      <BreadCrumb
        title={`Units - ${selectedCourse?.course_name || "Course"}`}
        parent="Courses"
        child="Units"
      />

      {/* Course Header Card */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="relative h-32 bg-gradient-to-r from-teal-600 to-cyan-600">
          {selectedCourse?.image && (
            <img
              src={selectedCourse.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-600/90 to-cyan-600/90" />
        </div>

        <div className="relative px-6 pb-6">
          <div className="flex flex-col sm:flex-row gap-4 -mt-10">
            {/* Course Image */}
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-white shadow-lg flex-shrink-0">
              <img
                src={
                  selectedCourse?.image ||
                  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=200"
                }
                alt=""
                className="w-full h-full object-cover"
              />
            </div>

            {/* Course Info */}
            <div className="flex-1 pt-4 sm:pt-8">
              <h1 className="text-xl font-bold text-gray-900 !mt-2">
                {selectedCourse?.course_name}
              </h1>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {selectedCourse?.course_descreption}
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                <span className="flex items-center gap-1.5 bg-teal-50 text-teal-700 px-3 py-1.5 rounded-lg">
                  <ListChecks className="w-4 h-4" />
                  {selectedCourse?.lessons || 0} lessons
                </span>
                <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1.5 rounded-lg">
                  <Clock3 className="w-4 h-4" />
                  {fmtMinutes((selectedCourse?.lessons || 0) * 15)}
                </span>
                <span className="flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg">
                  <BookOpen className="w-4 h-4" />
                  {allUnits?.length || 0} units
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Toolbar */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search units..."
            className="w-full pl-10 pr-4 py-3 bg-white rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-teal-500 transition-all"
          />
        </div>
      </div>

      {/* Units List */}
      <div className="mt-6 space-y-4">
        {filteredUnits.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900">
              No units found
            </h3>
            <p className="text-gray-500 mt-1">
              {search
                ? "Try adjusting your search"
                : "Add your first unit to get started"}
            </p>
            {!search && (
              <button
                onClick={() => router.push(`/courses/units/${id}/add-unit`)}
                className="mt-4 inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-2.5 rounded-xl font-medium hover:bg-teal-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Unit
              </button>
            )}
          </div>
        ) : (
          filteredUnits.map((unit, index) => {
            const isOpen = !!expanded[unit.unit_id];
            const isHidden = unit?.hidden === "1" || unit?.hidden === 1;

            return (
              <div
                key={unit.unit_id}
                className={`bg-white rounded-2xl border overflow-hidden transition-all ${
                  isHidden ? "border-rose-200 bg-rose-50/30" : "border-gray-100"
                }`}
              >
                {/* Unit Header */}
                <div
                  className={`p-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isHidden ? "hover:bg-rose-50" : ""
                  }`}
                  onClick={() =>
                    router.push(
                      `/courses/units/${id}/unit-detail/${unit?.unit_id}`
                    )
                  }
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
                        isHidden
                          ? "bg-rose-100 text-rose-700"
                          : "bg-teal-100 text-teal-700"
                      }`}
                    >
                      {index + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/courses/units/${id}/unit-detail/${unit?.unit_id}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(setUnit(unit));
                          }}
                          className="font-semibold text-gray-900 hover:text-teal-600 transition-colors truncate"
                        >
                          {unit?.unit_title}
                        </Link>
                        {isHidden && (
                          <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Video className="w-3.5 h-3.5" />
                          {unit?.videos?.length || 0} videos
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {unit?.pdfs?.length || 0} PDFs
                        </span>
                        <span className="flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          {unit?.quizzes?.length || 0} quizzes
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div
                    className="flex items-center gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Tooltip title={isHidden ? "Show" : "Hide"}>
                      <button
                        onClick={() => setOpenStatusModal(unit)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {isHidden ? (
                          <Eye className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    </Tooltip>

                    <Tooltip title="Edit">
                      <button
                        onClick={() =>
                          router.push(
                            `/courses/units/${id}/edit-unit/${unit?.unit_id}`
                          )
                        }
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Pencil className="w-4 h-4 text-gray-500" />
                      </button>
                    </Tooltip>

                    <Tooltip title="Delete">
                      <button
                        onClick={() => {
                          setOpenDeleteModal(true);
                          setRowData(unit);
                        }}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <Trash className="w-4 h-4 text-rose-500" />
                      </button>
                    </Tooltip>

                    {/* <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button> */}
                  </div>
                </div>

                {/* Expanded Content */}
                {isOpen && (
                  <div className="border-t border-gray-100 bg-gray-50/50 p-4">
                    <div className="grid sm:grid-cols-3 gap-3">
                      {/* Videos */}
                      <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-blue-600" />
                            <span className="font-medium text-gray-900">
                              Videos
                            </span>
                          </div>
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                            {unit?.videos?.length || 0}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            router.push(
                              `/courses/units/${id}/unit-detail/${unit?.unit_id}/add-video`
                            )
                          }
                          className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Video
                        </button>
                      </div>

                      {/* PDFs */}
                      <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4 text-rose-600" />
                            <span className="font-medium text-gray-900">
                              PDFs
                            </span>
                          </div>
                          <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                            {unit?.pdfs?.length || 0}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            router.push(
                              `/courses/units/${id}/unit-detail/${unit?.unit_id}/add-pdf`
                            )
                          }
                          className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-600 hover:border-rose-300 hover:text-rose-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add PDF
                        </button>
                      </div>

                      {/* Quizzes */}
                      <div className="bg-white rounded-xl border border-gray-100 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="w-4 h-4 text-purple-600" />
                            <span className="font-medium text-gray-900">
                              Quizzes
                            </span>
                          </div>
                          <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                            {unit?.quizzes?.length || 0}
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            router.push(
                              `/courses/units/${id}/unit-detail/${unit?.unit_id}/add-quiz`
                            )
                          }
                          className="w-full flex items-center justify-center gap-2 py-2 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-600 hover:border-purple-300 hover:text-purple-600 transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          Add Quiz
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Status Modal */}
      {openStatusModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden">
            <div
              className={`p-6 text-center ${
                openStatusModal?.hidden === "1"
                  ? "bg-emerald-50"
                  : "bg-amber-50"
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${
                  openStatusModal?.hidden === "1"
                    ? "bg-emerald-100"
                    : "bg-amber-100"
                }`}
              >
                {openStatusModal?.hidden === "1" ? (
                  <Eye className="w-8 h-8 text-emerald-600" />
                ) : (
                  <EyeOff className="w-8 h-8 text-amber-600" />
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900">
                {openStatusModal?.hidden === "1"
                  ? "Show this unit?"
                  : "Hide this unit?"}
              </h3>
              <p className="text-gray-600 mt-2">
                {openStatusModal?.hidden === "1"
                  ? "This unit will be visible to students."
                  : "This unit will be hidden from students."}
              </p>
              <p className="text-sm font-medium text-gray-500 mt-1">
                "{openStatusModal?.unit_title}"
              </p>
            </div>

            <div className="p-6 flex gap-3">
              <button
                onClick={() => setOpenStatusModal(null)}
                disabled={openStatusLoading}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeStatus}
                disabled={openStatusLoading}
                className={`flex-1 px-4 py-3 rounded-xl font-medium text-white transition-all disabled:opacity-50 flex items-center justify-center gap-2 ${
                  openStatusModal?.hidden === "1"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-amber-600 hover:bg-amber-700"
                }`}
              >
                {openStatusLoading && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <DeleteModal
        open={openDeleteModal}
        title="Delete Unit"
        description={`Are you sure you want to delete "${rowData?.unit_title}"?`}
        setOpen={setOpenDeleteModal}
        handleSubmit={() => {}}
      />
    </div>
  );
}
