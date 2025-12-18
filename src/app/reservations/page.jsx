"use client";
import React, { useMemo, useState, useCallback, useEffect } from "react";
import {
  CalendarClock,
  Clock,
  UserRound,
  Eye,
  EyeOff,
  Trash2,
  XCircle,
  Loader2,
  SquarePen,
  Space,
  Check,
  X,
  CircleCheck,
} from "lucide-react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import {
  useGetAllReservation,
  useGetAllReserved,
} from "../../utils/Api/reservation/GetAllReservation";
import useDeleteReservation from "../../utils/Api/reservation/deleteReservation";
import toast from "react-hot-toast";
import AddReservationModal from "./AddModel";
import { set } from "react-hook-form";
import { Dropdown } from "antd";
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
    color: "border-yellow-400",
    text: "text-yellow-700",
  },

  accepted: {
    dot: "bg-emerald-600",
    pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <Check className="w-4 h-4" />,
    label: "Accepted",
    color: "border-green-200",
    text: "text-emerald-700",
  },

  rejected: {
    dot: "bg-rose-600",
    pill: "bg-rose-50 text-rose-700 border-rose-200",
    icon: <X className="w-4 h-4" />,
    label: "Rejected",
    color: "border-rose-500",
    text: "text-rose-700",
  },

  completed: {
    dot: "bg-green-600",
    pill: "bg-green-50 text-green-700 border-green-200",
    icon: <CircleCheck className="w-4 h-4" />,
    label: "Completed",
    color: "border-green-500",
    text: "text-green-700",
  },
};

export default function ProfileReservation() {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("reserved"); // reserved | reservations
  const [openId, setOpenId] = useState(null);

  const [open, setOpen] = useState(false);
  const [changingId, setChangingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const qReservations = useGetAllReservation();
  const qReserved = useGetAllReserved();
  console.log(qReservations.data);
  

  const { mutateAsync, isPending } = useDeleteReservation();
  const { mutateAsync: changeReservationStatus, isPending: isPendingChange } =
    useChangeReservationStatus();

  useEffect(() => {
    setQuery("");
    setFilter("all");
  }, [tab]);
  useEffect(() => {
    console.log("changingId changed:", changingId);
  }, [changingId]);

  // ✅ لو API بيرجع Array مباشرة
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
    return arr.map(normalizeMeeting);
  }, [qReserved?.data?.message]);
  const reservations = reservationsList ?? [];
  const reserved = reservedList ?? [];
  const qReservationsfilters =
    reservations.map((q) => {
      return q.status;
    }) ?? [];
  const qReservedfilters =
    reserved.map((q) => {
      return q.status;
    }) ?? [];

  const uniqueReservationsFilters = Array.from(
    new Set([...(qReservationsfilters ?? [])])
  );
  const uniqueReservedFilters = Array.from(
    new Set([...(qReservedfilters ?? [])])
  );
  const reservedFilters = uniqueReservedFilters.map((f) => {
    return {
      key: f,
      label: f,
    };
  });
  const reservationsFilters = uniqueReservationsFilters.map((f) => {
    return {
      key: f,
      label: f,
    };
  });

  const FILTER = [{ key: "all", label: "All" }, ...reservationsFilters];
  const FILTERS = [{ key: "all", label: "All" }, ...reservedFilters];

  const baseList = tab === "reserved" ? reservedList : reservationsList;
  const hasBaseData = baseList.length > 0; // داتا التاب الحالية قبل الفلترة
  const hasAnyData = reservedList.length + reservationsList.length > 0;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    return baseList
      .filter((r) => (filter === "all" ? true : r.status === filter))
      .filter((r) => {
        if (!q) return true;
        const title = (r.title || "").toLowerCase();
        const note = (r.note || "").toLowerCase();
        const type = (r.meetingType || "").toLowerCase();
        const course = String(r.courseId ?? "").toLowerCase();
        return (
          title.includes(q) ||
          note.includes(q) ||
          type.includes(q) ||
          course.includes(q)
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
      const res = await mutateAsync({ id });

      if (res?.status === "success") {
        toast.success(res?.message || "Reservation deleted successfully!");
      } else {
        toast.error(res?.message || "Failed to delete reservation");
      }
    } catch (e) {
      toast.error("Delete failed");
      console.log(e);
    }
  };

  const onConfirmChange = async (id, status) => {
    if (!id) return;
    const _id = String(id);
    setChangingId(_id);
    const payload = {
      reservation_id: id,
      status: status,
    };
    console.log(payload);

    try {
      const res = await changeReservationStatus({ payload });
      console.log(res);
      if (res?.status === "success") {
        toast.success(
          res?.message || "Reservation status changed successfully!"
        );
      } else {
        toast.error(res?.message || "Failed to change reservation status");
      }
    } catch (error) {}
  };

  return (
    <div className="min-h-screen">
      <BreadCrumb
        title="Reservations Page"
        parent="Home"
        child="Reservations"
      />

      {isLoading && (
        <div className="mt-6 rounded-2xl border bg-white p-6 text-gray-700">
          Loading...
        </div>
      )}

      {isError && !isLoading && (
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
          {errorMsg}
        </div>
      )}

      {!isLoading && !isError && (
        <>
          {/* Tabs + Controls */}
          <div className="mb-4 mt-5 flex flex-col gap-4">
            <div className="flex justify-center flex-wrap sm:justify-between gap-5   items-center">
              <div className="inline-flex rounded-full bg-gray-100 p-1">
                <button
                  onClick={() => setTab("reserved")}
                  className={[
                    "px-4 py-1.5 text-sm font-medium rounded-full transition",
                    tab === "reserved"
                      ? "bg-white shadow-sm text-teal-700"
                      : "text-gray-600 hover:text-gray-900",
                  ].join(" ")}
                >
                  Reserved ({reservedList.length})
                </button>

                <button
                  onClick={() => setTab("reservations")}
                  className={[
                    "px-4 py-1.5 text-sm font-medium rounded-full transition",
                    tab === "reservations"
                      ? "bg-white shadow-sm text-teal-700"
                      : "text-gray-600 hover:text-gray-900",
                  ].join(" ")}
                >
                  Reservations ({reservationsList.length})
                </button>
              </div>
              {tab === "reservations" && (
                <div className=" flex place-self-start md:justify-center ">
                  <button
                    onClick={() => setOpen(true)}
                    className=" px-4 py-2 bg-teal-600 !whitespace-nowrap !text-white rounded-lg hover:bg-teal-700 transition-colors duration-200 flex items-center gap-2"
                  >
                    Add Reservation
                  </button>
                </div>
              )}
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-wrap justify-center items-center gap-3">
                {hasBaseData && (
                  <>
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search (note/type/course)…"
                      className="w-72 max-w-[80vw] rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
                      disabled={!hasBaseData} // اختياري: اقفل البحث لو فاضي
                    />
                    {tab === "reservations" && (
                      <div className="flex flex-wrap gap-2">
                        {FILTER.map((f) => (
                          <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={[
                              "px-3 py-1.5 rounded-full text-sm font-medium border transition",
                              filter === f.key
                                ? "bg-teal-600 !text-white border-teal-600"
                                : "bg-white text-gray-700 border-gray-200 hover:border-teal-300",
                            ].join(" ")}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {tab === "reserved" && (
                      <div className="flex flex-wrap gap-2">
                        {FILTERS.map((f) => (
                          <button
                            key={f.key}
                            onClick={() => setFilter(f.key)}
                            className={[
                              "px-3 py-1.5 rounded-full text-sm font-medium border transition",
                              filter === f.key
                                ? "bg-teal-600 !text-white border-teal-600"
                                : "bg-white text-gray-700 border-gray-200 hover:border-teal-300",
                            ].join(" ")}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* List */}
          <div className="space-y-4">
            {filtered.map((r) => {
              const s = STATUS_STYLES[r.status] || STATUS_STYLES.pending;
              const isOpen = openId === r.id;
              const items = [
                {
                  key: "completed",
                  disabled: r.status === "completed",
                  label: (
                    <span className="text-green-700 flex items-center gap-2">
                      <CircleCheck className="w-4 h-4" />
                      Completed
                    </span>
                  ),
                },
                {
                  key: "accepted",
                  disabled: r.status === "accepted",
                  label: (
                    <span className="text-emerald-700 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Accepted
                    </span>
                  ),
                },
                {
                  key: "rejected",
                  disabled: r.status === "rejected",
                  label: (
                    <span className="text-rose-700 flex items-center gap-2">
                      <X className="w-4 h-4" />
                      Rejected
                    </span>
                  ),
                },
              ];

              return (
                <div
                  key={r.id}
                  className={[
                    "relative bg-white flex-wrap sm:flex-nowrap group rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all",
                    "p-4 md:p-6",
                    `border-l-4 ${s.color}`,
                  ].join(" ")}
                >
                  <div className="flex flex-wrap sm:flex-nowrap items-start gap-4">
                    <div
                      className={`h-10 w-10 rounded-full ${s.dot} opacity-50 group-hover:opacity-100 transition-all text-white flex items-center justify-center ring-1 ring-teal-100 overflow-hidden`}
                    >
                      <UserRound className="w-5 h-5" />
                    </div>

                    <div className="sm:!flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">
                          {r.title}{" "}
                          <span className="text-xs text-gray-400">#{r.id}</span>
                        </h3>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${s.pill}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${s.dot}`}
                          />
                          {s.icon}
                          {s.label}
                        </span>

                        <span className="text-xs text-gray-500">
                          • {r.meetingType}
                        </span>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                        <div className="inline-flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>
                            {r.start ? r.start.toLocaleString() : "No date"}
                          </span>
                        </div>
                        {r.studentId && (
                          <div className="text-sm">
                            Student:{" "}
                            <span className="font-medium">{r.student}</span>
                          </div>
                        )}
                      </div>

                      {isOpen && (
                        <div className="mt-3 rounded-xl border bg-gray-50 p-3 text-sm text-gray-700">
                          {r.note || "No note."}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 ml-auto text-gray-500">
                      <button
                        onClick={() => toggleOpen(r.id)}
                        className="p-2 rounded-full hover:bg-gray-100"
                        title="View note"
                      >
                        {isOpen ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>

                      {tab === "reservations" && (
                        <button
                          className="p-2 rounded-full hover:bg-gray-100"
                          title="Delete"
                          onClick={async () => {
                            onConfirmDelete(r.id);
                          }}
                        >
                          {deletingId === r.id ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      )}
                      {tab === "reservations" && r.status !== "rejected" && (
                        <Dropdown
                          menu={{
                            items,
                            onClick: ({ key }) => {
                              onConfirmChange(r.id, String(key));
                            },
                          }}
                          trigger={["click"]}
                          placement="bottomRight"
                        >
                          <a onClick={(e) => e.preventDefault()}>
                            {isPendingChange && changingId === String(r.id) ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <SquarePen className="w-5 h-5" />
                            )}
                          </a>
                        </Dropdown>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {filtered.length === 0 && (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
                No items match your filters.
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
  );
}
