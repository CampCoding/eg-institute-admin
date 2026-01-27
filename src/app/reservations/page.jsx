"use client";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  CalendarClock,
  Clock,
  UserRound,
  Eye,
  EyeOff,
  Trash2,
  Loader2,
  Check,
  X,
  CircleCheck,
  AlertCircle,
  XCircle,
  Users,
  Search,
  BookOpen,
} from "lucide-react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import {
  useGetAllReservation,
  useGetAllReserved,
} from "../../utils/Api/reservation/GetAllReservation";
import useDeleteReservation from "../../utils/Api/reservation/deleteReservation";
import toast from "react-hot-toast";
import AddReservationModal from "./AddModel";
import { Popconfirm, Tag, Tooltip, Badge } from "antd";
import useChangeReservationStatus from "../../utils/Api/reservation/ChangeStatus";

function normalizeMeeting(m) {
  const id = m.meeting_resrvations_id;
  const start =
    m.meeting_date && m.meeting_time
      ? new Date(`${m.meeting_date}T${m.meeting_time}`)
      : null;

  return {
    id,
    start,
    status: m.status ?? "N/A",
    note: m.note ?? "",
    meetingType: m.meeting_type ?? "N/A",
    courseId: m.course_id ?? null,
    studentId: m.student_id ?? null,
    student: m.student_name ?? null,
    title: m.course_id ? m.course_name : "Reservation",
    teacher: { name: "—", avatar: null },
  };
}

const STATUS_STYLES = {
  pending: {
    dot: "bg-yellow-500",
    pill: "bg-yellow-50 text-yellow-800 border-yellow-200",
    icon: <CalendarClock className="w-4 h-4" />,
    label: "Pending",
    color: "border-l-yellow-400",
    text: "text-yellow-700",
    badgeColor: "gold",
  },
  accepted: {
    dot: "bg-emerald-600",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <Check className="w-4 h-4" />,
    label: "Accepted",
    color: "border-l-emerald-400",
    text: "text-emerald-700",
    badgeColor: "green",
  },
  rejected: {
    dot: "bg-rose-600",
    pill: "bg-rose-50 text-rose-700 border-rose-200",
    icon: <XCircle className="w-4 h-4" />,
    label: "Rejected",
    color: "border-l-rose-400",
    text: "text-rose-700",
    badgeColor: "red",
  },
  completed: {
    dot: "bg-blue-600",
    pill: "bg-blue-50 text-blue-700 border-blue-200",
    icon: <CircleCheck className="w-4 h-4" />,
    label: "Completed",
    color: "border-l-blue-400",
    text: "text-blue-700",
    badgeColor: "blue",
  },
};

export default function ProfileReservation() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("reserved");
  const [openId, setOpenId] = useState(null);
  const [open, setOpen] = useState(false);
  const [changingId, setChangingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const qReservations = useGetAllReservation();
  const qReserved = useGetAllReserved();

  const { mutateAsync: deleteReservation, isPending: isDeleting } =
    useDeleteReservation();
  const { mutateAsync: changeStatus, isPending: isChangingStatus } =
    useChangeReservationStatus();

  useEffect(() => {
    setQuery("");
    setFilter("all");
  }, [tab]);

  const reservationsList = useMemo(() => {
    const arr = Array.isArray(qReservations.data?.message)
      ? qReservations.data?.message
      : [];
    return arr.map(normalizeMeeting);
  }, [qReservations.data?.message]);

  const reservedList = useMemo(() => {
    const arr = Array.isArray(qReserved.data?.message)
      ? qReserved.data?.message
      : [];

    // ✅ في Reserved، نعرض فقط: pending, accepted, completed
    // rejected يختفي (لأنه رجع للـ reservations)
    return arr
      .map(normalizeMeeting)
      .filter(
        (item) =>
          item.status === "pending" ||
          item.status === "accepted" ||
          item.status === "completed"
      );
  }, [qReserved?.data?.message]);

  const reservations = reservationsList ?? [];
  const reserved = reservedList ?? [];

  // ✅ Filters للـ Reserved (بدون rejected)
  const reservedStatuses = ["pending", "accepted", "completed"];
  const reservedFilters = reservedStatuses.map((f) => ({
    key: f,
    label: f.charAt(0).toUpperCase() + f.slice(1),
  }));

  // ✅ Filters للـ Reservations (كل الحالات)
  const qReservationsfilters = [...new Set(reservations.map((q) => q.status))];
  const reservationsFilters = qReservationsfilters.map((f) => ({
    key: f,
    label: f.charAt(0).toUpperCase() + f.slice(1),
  }));

  const FILTER = [{ key: "all", label: "All" }, ...reservationsFilters];
  const FILTERS = [{ key: "all", label: "All" }, ...reservedFilters];

  const baseList = tab === "reserved" ? reservedList : reservationsList;
  const hasBaseData = baseList.length > 0;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return baseList
      .filter((r) => (filter === "all" ? true : r.status === filter))
      .filter((r) => {
        if (!q) return true;
        const title = (r.title || "").toLowerCase();
        const note = (r.note || "").toLowerCase();
        const type = (r.meetingType || "").toLowerCase();
        const student = (r.student || "").toLowerCase();
        return (
          title.includes(q) ||
          note.includes(q) ||
          type.includes(q) ||
          student.includes(q)
        );
      })
      .slice()
      .sort(
        (a, b) => (b.start?.getTime?.() || 0) - (a.start?.getTime?.() || 0)
      );
  }, [baseList, filter, query]);

  const isLoading = qReservations.isLoading || qReserved.isLoading;
  const isError = qReservations.isError || qReserved.isError;
  const errorMsg =
    qReservations.error?.message ||
    qReserved.error?.message ||
    "Something went wrong";

  const toggleOpen = useCallback((id) => {
    setOpenId((cur) => (cur === id ? null : id));
  }, []);

  const onConfirmDelete = async (id) => {
    if (!id) return;
    setDeletingId(id);

    try {
      const res = await deleteReservation({ id });

      if (res?.status === "success") {
        toast.success(res?.message || "Reservation deleted successfully!");
      } else {
        toast.error(res?.message || "Failed to delete reservation");
      }
    } catch (e) {
      toast.error("Delete failed");
      console.error(e);
    } finally {
      setDeletingId(null);
    }
  };

  const onConfirmChange = async (id, status) => {
    if (!id) return;
    setChangingId(String(id));

    const payload = {
      reservation_id: id,
      status: status,
    };

    try {
      const res = await changeStatus({ payload });

      if (res?.status === "success") {
        const statusMessages = {
          accepted: "Reservation accepted successfully! ✅",
          rejected: "Reservation rejected. It's now available again. ❌",
          completed: "Reservation marked as completed! 🎉",
        };

        toast.success(
          statusMessages[status] ||
            res?.message ||
            "Status changed successfully!"
        );

        // ✅ Refetch both queries to get fresh data
        await Promise.all([qReservations.refetch(), qReserved.refetch()]);
      } else {
        toast.error(res?.message || "Failed to change reservation status");
      }
    } catch (error) {
      toast.error("Status change failed");
      console.error(error);
    } finally {
      setChangingId(null);
    }
  };
  // ✅ حساب الإحصائيات
  const stats = useMemo(() => {
    return {
      pending: reserved.filter((r) => r.status === "pending").length,
      accepted: reserved.filter((r) => r.status === "accepted").length,
      completed: reserved.filter((r) => r.status === "completed").length,
      total: reserved.length,
    };
  }, [reserved]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        <BreadCrumb
          title="Reservations Management"
          parent="Home"
          child="Reservations"
        />

        {isLoading && (
          <div className="mt-6 rounded-2xl border bg-white p-8 text-center shadow-sm">
            <Loader2 className="w-10 h-10 animate-spin text-teal-600 mx-auto mb-4" />
            <p className="text-gray-700 font-medium">Loading reservations...</p>
          </div>
        )}

        {isError && !isLoading && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 flex items-center gap-3 text-rose-700 shadow-sm">
            <AlertCircle className="w-6 h-6 flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-1">Error Loading Data</h3>
              <p className="text-sm">{errorMsg}</p>
            </div>
          </div>
        )}

        {!isLoading && !isError && (
          <>
            {/* ✅ Statistics Cards */}
            {tab === "reserved" && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-5 border border-yellow-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-yellow-700 text-xs font-semibold uppercase mb-1">
                        Pending
                      </p>
                      <p className="text-3xl font-bold text-yellow-900">
                        {stats.pending}
                      </p>
                    </div>
                    <CalendarClock className="w-10 h-10 text-yellow-600 opacity-50" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-5 border border-emerald-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-emerald-700 text-xs font-semibold uppercase mb-1">
                        Accepted
                      </p>
                      <p className="text-3xl font-bold text-emerald-900">
                        {stats.accepted}
                      </p>
                    </div>
                    <Check className="w-10 h-10 text-emerald-600 opacity-50" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-5 border border-blue-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-700 text-xs font-semibold uppercase mb-1">
                        Completed
                      </p>
                      <p className="text-3xl font-bold text-blue-900">
                        {stats.completed}
                      </p>
                    </div>
                    <CircleCheck className="w-10 h-10 text-blue-600 opacity-50" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-teal-50 to-cyan-100 rounded-2xl p-5 border border-teal-200 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-teal-700 text-xs font-semibold uppercase mb-1">
                        Total Reserved
                      </p>
                      <p className="text-3xl font-bold text-teal-900">
                        {stats.total}
                      </p>
                    </div>
                    <Users className="w-10 h-10 text-teal-600 opacity-50" />
                  </div>
                </div>
              </div>
            )}

            {/* Tabs + Controls */}
            <div className="mb-6 mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex flex-col lg:flex-row lg:justify-between gap-5">
                {/* Tabs */}
                <div className="inline-flex rounded-xl bg-gray-100 p-1.5 shadow-inner">
                  <button
                    onClick={() => setTab("reserved")}
                    className={[
                      "px-6 py-2.5 text-sm font-bold rounded-lg transition-all relative",
                      tab === "reserved"
                        ? "bg-white shadow-md text-teal-700"
                        : "text-gray-600 hover:text-gray-900",
                    ].join(" ")}
                  >
                    Reserved{" "}
                    <Badge
                      count={reservedList.length}
                      showZero
                      className="ml-2"
                      style={{
                        backgroundColor:
                          tab === "reserved" ? "#14b8a6" : "#6b7280",
                      }}
                    />
                  </button>

                  <button
                    onClick={() => setTab("reservations")}
                    className={[
                      "px-6 py-2.5 text-sm font-bold rounded-lg transition-all",
                      tab === "reservations"
                        ? "bg-white shadow-md text-teal-700"
                        : "text-gray-600 hover:text-gray-900",
                    ].join(" ")}
                  >
                    Reservations{" "}
                    <Badge
                      count={reservationsList.length}
                      showZero
                      className="ml-2"
                      style={{
                        backgroundColor:
                          tab === "reservations" ? "#14b8a6" : "#6b7280",
                      }}
                    />
                  </button>
                </div>

                {/* Add Button */}
                {tab === "reservations" && (
                  <button
                    onClick={() => setOpen(true)}
                    className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 !text-white rounded-xl hover:from-teal-700 hover:to-cyan-700 transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg font-semibold"
                  >
                    <CalendarClock className="w-5 h-5" />
                    Add Reservation
                  </button>
                )}
              </div>

              {/* Search & Filters */}
              {hasBaseData && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 mt-5 pt-5 border-t border-gray-200">
                  <div className="relative flex-1 max-w-md">
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search reservations..."
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 pl-10 text-sm outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
                    />
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {(tab === "reservations" ? FILTER : FILTERS).map((f) => (
                      <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className={[
                          "px-4 py-2 rounded-xl text-xs font-bold border-2 transition-all",
                          filter === f.key
                            ? "bg-teal-600 !text-white border-teal-600 shadow-md scale-105"
                            : "bg-white text-gray-700 border-gray-200 hover:border-teal-300 hover:shadow-sm",
                        ].join(" ")}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* List */}
            <div className="space-y-4">
              {filtered.map((r) => {
                const s = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
                const isOpen = openId === r.id;
                const isProcessing =
                  changingId === String(r.id) || deletingId === r.id;

                return (
                  <div
                    key={r.id}
                    className={[
                      "relative bg-white group rounded-2xl border-l-2 shadow-sm hover:shadow-xl transition-all",
                      "p-6",
                      s.color,
                    ].join(" ")}
                  >
                    <div className="flex flex-wrap lg:flex-nowrap items-start gap-5">
                      {/* Avatar */}
                      <div
                        className={`h-14 w-14 flex-shrink-0 rounded-2xl ${s.dot} opacity-80 group-hover:opacity-100 transition-all text-white flex items-center justify-center shadow-lg`}
                      >
                        <UserRound className="w-7 h-7" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-bold text-gray-900">
                              {r.title}
                            </h3>

                            <Tag color={s.badgeColor}>
                              <div className="flex items-center gap-2">
                                {s.icon}
                                {s.label}
                              </div>
                            </Tag>

                            <span className="text-xs text-gray-400 font-mono">
                              #{r.id}
                            </span>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            <span>
                              {r.start
                                ? r.start.toLocaleString("en-US", {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })
                                : "No date"}
                            </span>
                          </div>

                          {r.studentId && (
                            <div className="flex items-center gap-2">
                              <UserRound className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span>
                                Student:{" "}
                                <span className="font-semibold text-gray-900">
                                  {r.student}
                                </span>
                              </span>
                            </div>
                          )}

                          <div className="text-xs">
                            Type:{" "}
                            <span className="font-medium text-gray-800">
                              {r.meetingType}
                            </span>
                          </div>
                        </div>

                        {isOpen && r.note && (
                          <div className="mt-4 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-cyan-50 p-4 text-sm text-gray-800 shadow-sm">
                            <p className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                              <BookOpen className="w-4 h-4" />
                              Note:
                            </p>
                            <p className="leading-relaxed">{r.note}</p>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Tooltip title={isOpen ? "Hide note" : "Show note"}>
                          <button
                            onClick={() => toggleOpen(r.id)}
                            className="p-2.5 rounded-xl hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
                          >
                            {isOpen ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </Tooltip>

                        {/* ✅ DELETE (only in reservations tab) */}
                        {tab === "reservations" && (
                          <Popconfirm
                            title="Delete Reservation"
                            description="Are you sure you want to delete this reservation permanently?"
                            onConfirm={() => onConfirmDelete(r.id)}
                            okText="Yes, Delete"
                            cancelText="Cancel"
                            okButtonProps={{
                              danger: true,
                              loading: deletingId === r.id,
                            }}
                          >
                            <Tooltip title="Delete">
                              <button
                                disabled={isProcessing}
                                className="p-2.5 rounded-xl hover:bg-red-50 transition-colors text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {deletingId === r.id ? (
                                  <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-5 h-5" />
                                )}
                              </button>
                            </Tooltip>
                          </Popconfirm>
                        )}

                        {/* ✅ STATUS CHANGE (only in reserved tab) */}
                        {tab === "reserved" && (
                          <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl p-1">
                            {/* Accept - only for pending */}
                            {r.status === "pending" && (
                              <Popconfirm
                                title="Accept Reservation"
                                description="Confirm this reservation as accepted?"
                                onConfirm={() =>
                                  onConfirmChange(r.id, "accepted")
                                }
                                okText="Yes, Accept"
                                cancelText="Cancel"
                                okButtonProps={{
                                  loading: changingId === String(r.id),
                                  className:
                                    "!bg-emerald-600 hover:!bg-emerald-700",
                                }}
                              >
                                <Tooltip title="Accept">
                                  <button
                                    disabled={isProcessing}
                                    className="p-2 rounded-lg hover:bg-emerald-50 transition-colors text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
                                  >
                                    <Check className="w-5 h-5" />
                                  </button>
                                </Tooltip>
                              </Popconfirm>
                            )}

                            {/* Reject - for pending & accepted */}
                            {r.status === "pending" && (
                              <Popconfirm
                                title="Reject Reservation"
                                description="This will make the slot available again. Are you sure?"
                                onConfirm={() =>
                                  onConfirmChange(r.id, "rejected")
                                }
                                okText="Yes, Reject"
                                cancelText="Cancel"
                                okButtonProps={{
                                  danger: true,
                                  loading: changingId === String(r.id),
                                }}
                              >
                                <Tooltip title="Reject">
                                  <button
                                    disabled={isProcessing}
                                    className="p-2 rounded-lg hover:bg-red-50 transition-colors text-red-600 hover:text-red-700 disabled:opacity-50"
                                  >
                                    <X className="w-5 h-5" />
                                  </button>
                                </Tooltip>
                              </Popconfirm>
                            )}

                            {/* Complete - only for accepted */}
                            {r.status === "accepted" && (
                              <Popconfirm
                                title="Mark as Completed"
                                description="Mark this reservation as completed?"
                                onConfirm={() =>
                                  onConfirmChange(r.id, "completed")
                                }
                                okText="Yes, Complete"
                                cancelText="Cancel"
                                okButtonProps={{
                                  loading: changingId === String(r.id),
                                  className: "!bg-blue-600 hover:!bg-blue-700",
                                }}
                              >
                                <Tooltip title="Mark as Completed">
                                  <button
                                    disabled={isProcessing}
                                    className="p-2 rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 disabled:opacity-50"
                                  >
                                    <CircleCheck className="w-5 h-5" />
                                  </button>
                                </Tooltip>
                              </Popconfirm>
                            )}

                            {/* Completed - no actions */}
                            {r.status === "completed" && (
                              <div className="px-3 py-2 text-sm text-blue-600 font-semibold flex items-center gap-2">
                                <CircleCheck className="w-4 h-4" />
                                Completed
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filtered.length === 0 && (
                <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white p-16 text-center shadow-sm">
                  <div className="mx-auto w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <CalendarClock className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    No reservations found
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    {query || filter !== "all"
                      ? "Try adjusting your search or filters to find what you're looking for."
                      : `No ${
                          tab === "reserved" ? "reserved" : ""
                        } reservations available yet.`}
                  </p>
                </div>
              )}
            </div>

            <AddReservationModal
              open={open}
              onClose={() => {
                setOpen(false);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}
