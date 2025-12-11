"use client";

import React, { useState } from "react";
import {
  CalendarClock,
  Clock,
  Eye,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  EyeOff,
  LayoutGrid,
  Rows3,
} from "lucide-react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import useGetAllSubscriptions from "../../utils/Api/Subscriptions/GetAllSubscriptions";
import usePostSubscription from "../../utils/Api/Subscriptions/ChangeSubscription";
import toast from "react-hot-toast";

export default function ProfileReservation() {
  const [filter, setFilter] = useState("all"); // all | accepted | pending | rejected
  const [query, setQuery] = useState("");
  const [viewMode, setViewMode] = useState("table");
  const [cancelEdit, setCancelEdit] = useState({
    id: null,
    value: "",
  });
  const [detailsId, setDetailsId] = useState(null);
  const [cancelModalFor, setCancelModalFor] = useState(null);

  const { data } = useGetAllSubscriptions();
  const { mutateAsync, isLoading } = usePostSubscription();

  // Map API → UI shape
  const subscriptions =
    data?.message?.map((s) => ({
      id: s?.subscription_id,
      title: s?.subscription_type,
      start: s?.subscription_start_date,
      status: s?.status, // accepted | pending | rejected
      cancel_reason: s?.cancel_reason,
      course_name: s?.course_name,
      student: s?.student_name,
    })) ?? [];

  const statusStyles = {
    accepted: {
      dot: "bg-emerald-600",
      pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
      label: "Accepted",
      accent: "from-emerald-50/80 via-white to-emerald-50/40",
    },
    pending: {
      dot: "bg-amber-600",
      pill: "bg-amber-50 text-amber-700 border-amber-200",
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
      label: "Pending",
      accent: "from-amber-50/80 via-white to-amber-50/40",
    },
    rejected: {
      dot: "bg-rose-600",
      pill: "bg-rose-50 text-rose-700 border-rose-200",
      icon: <XCircle className="w-3.5 h-3.5" />,
      label: "Rejected",
      accent: "from-rose-50/80 via-white to-rose-50/40",
    },
  };

  const uniqueStatuses = Array.from(
    new Set(subscriptions.map((s) => s.status).filter(Boolean))
  );

  const filters = [
    { id: "all", label: "All" },
    ...uniqueStatuses.map((st) => ({
      id: st,
      label: st.charAt(0).toUpperCase() + st.slice(1),
    })),
  ];

  const q = query.trim().toLowerCase();
  const hasDetailsOpen = detailsId !== null;

  const handleStatusChange = async (subscription, nextStatus) => {
    if (nextStatus === "canceled") return;

    const payload = {
      subscription_id: Number(subscription.id),
      status: nextStatus,
    };

    try {
      const response = await mutateAsync({ payload });
      if (response.status === "success") toast.success(response.message);
      else toast.error(response.message);
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const startCancelEdit = (subscription) => {
    setCancelEdit({
      id: subscription.id,
      value: "",
    });
    setCancelModalFor(subscription);
  };

  const confirmCancel = async (subscription) => {
    if (!cancelEdit.value.trim()) {
      toast.error("Please enter a cancellation reason.");
      return;
    }

    if (isLoading) return;

    const payload = {
      subscription_id: Number(subscription.id),
      status: "rejected",
      cancel_reason: cancelEdit.value.trim(),
    };

    try {
      const response = await mutateAsync({ payload });

      if (response.status === "success") {
        toast.success(response.message);
        setCancelEdit({ id: null, value: "" });
        setCancelModalFor(null);
      } else {
        toast.error(response.message || "Something went wrong.");
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const cancelCancelEdit = () => {
    setCancelEdit({ id: null, value: "" });
    setCancelModalFor(null);
  };

  const filtered = subscriptions
    .filter((r) => (filter === "all" ? true : r.status === filter))
    .filter((r) => {
      if (!q) return true;

      const title = r.title?.toLowerCase() ?? "";
      const status = r.status?.toLowerCase() ?? "";
      const reason = r.cancel_reason?.toLowerCase() ?? "";
      const student = r.student?.toLowerCase() ?? "";
      const course = r.course_name?.toLowerCase() ?? "";

      return (
        title.includes(q) ||
        status.includes(q) ||
        student.includes(q) ||
        course.includes(q) ||
        (reason && reason.includes(q))
      );
    })
    .sort((a, b) => {
      const aTime = new Date(a.start).getTime();
      const bTime = new Date(b.start).getTime();
      return bTime - aTime;
    });

  return (
    <div className="min-h-screen">
      <BreadCrumb
        title={"Subscriptions Page"}
        parent={"Home"}
        child={"Subscriptions"}
      />

      {/* Controls */}
      <div className="mb-4 mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center justify-center gap-3">
          {/* Search */}
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Subscriptions..."
              className="w-64 max-w-[75vw] rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
              ⌘K
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={[
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition",
                  filter === f.id
                    ? "bg-teal-600 !text-white border-teal-600 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:border-teal-300 hover:text-teal-700",
                ].join(" ")}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* View toggle */}
        <div className="flex items-center justify-center gap-2">
          <span className="mr-1 text-xs text-slate-500">View:</span>
          <button
            onClick={() => setViewMode("grid")}
            className={[
              "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition",
              viewMode === "grid"
                ? "bg-teal-600 !text-white border-teal-600 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:text-teal-700",
            ].join(" ")}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={[
              "inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-medium transition",
              viewMode === "table"
                ? "bg-teal-600 !text-white border-teal-600 shadow-sm"
                : "bg-white text-slate-700 border-slate-200 hover:border-teal-300 hover:text-teal-700",
            ].join(" ")}
          >
            <Rows3 className="w-4 h-4" />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* Empty state */}
      {filtered.length === 0 ? (
        <div className="flex justify-center items-center py-16">
          <div className="max-w-md w-full rounded-2xl border border-dashed border-gray-300 bg-white px-8 py-10 text-center text-gray-600">
            <p className="mb-1 text-sm font-medium text-gray-500">
              No subscriptions found
            </p>
            <p className="text-xs text-gray-400">
              Try changing the filters or search keyword.
            </p>
          </div>
        </div>
      ) : viewMode === "grid" ? (
        // GRID VIEW
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((r) => {
            const s = statusStyles[r.status] || statusStyles.pending;
            const dateLabel = r.start
              ? new Date(r.start).toLocaleDateString()
              : "No date";

            const isDetailsOpen = detailsId === r.id;
            const isPending = r.status === "pending";
            const showDecisionButtons = isPending;

            return (
              <div
                key={r.id}
                className={[
                  "group relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-br",
                  s.accent,
                  "shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5",
                  "before:absolute before:inset-y-0 before:left-0 before:w-1 before:bg-gradient-to-b",
                  "before:from-slate-200 before:via-slate-300 before:to-slate-200",
                ].join(" ")}
              >
                {/* Decorative blobs */}
                <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-white/60 blur-2xl" />
                <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-white/40 blur-2xl" />

                <div
                  className={[
                    "relative flex h-full flex-col p-4 md:p-5",
                    "bg-gradient-to-br from-white/70 via-white/60 to-white/30 backdrop-blur-sm",
                  ].join(" ")}
                >
                  {/* Top row */}
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${s.pill}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                        {s.icon}
                        <span>{s.label}</span>
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/5 px-2 py-1 text-[10px] font-medium text-slate-600">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{dateLabel}</span>
                    </span>
                  </div>

                  {/* Title + student + course */}
                  <div className="mb-2">
                    <h3 className="line-clamp-2 text-base font-semibold text-slate-900 md:text-lg">
                      {r.title || "Subscription"}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      ID:{" "}
                      <span className="font-mono text-[11px] text-slate-600">
                        {r.id}
                      </span>
                    </p>
                  </div>

                  <div className="mb-2 space-y-1">
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold">Student: </span>
                      {r.student || "-"}
                    </p>
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold">Course: </span>
                      {r.course_name || "-"}
                    </p>
                  </div>

                  {/* Meta */}
                  <div className="mt-3 space-y-1.5 text-sm text-slate-600">
                    <div className="inline-flex items-center gap-1.5 text-xs">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">
                        {r.start
                          ? new Date(r.start).toLocaleString()
                          : "No start date"}
                      </span>
                    </div>
                  </div>

                  {isDetailsOpen && r.cancel_reason && (
                    <div className="mt-1 inline-flex items-start gap-1.5 rounded-lg border border-rose-100 bg-rose-50/60 px-2 py-1 text-[15px] text-rose-500">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5" />
                      <span className="line-clamp-2">{r.cancel_reason}</span>
                    </div>
                  )}

                  {/* Footer actions */}
                  <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-500">
                    <div className="inline-flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                      <span className="text-[11px]">
                        Last update:{" "}
                        {r.start
                          ? new Date(r.start).toLocaleTimeString()
                          : "--"}
                      </span>
                    </div>

                    <div className="flex flex-wrap justify-end gap-1.5 text-xs">
                      {[
                        {
                          key: "details",
                          title: "View details",
                          onClick: () =>
                            setDetailsId((prev) =>
                              prev === r.id ? null : r.id
                            ),
                          className:
                            "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition",
                          icon:
                            detailsId === r.id ? (
                              <EyeOff className="w-3.5 h-3.5" />
                            ) : (
                              <Eye className="w-3.5 h-3.5" />
                            ),
                          label: "Details",
                        },
                        {
                          key: "Accept",
                          title: "Mark as Accepted",
                          onClick: () => handleStatusChange(r, "accepted"),
                          className: [
                            "items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 hover:border-emerald-200 transition",
                            showDecisionButtons ? "inline-flex" : "hidden",
                          ].join(" "),
                          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                          label: "Accept",
                        },
                        {
                          key: "Reject",
                          title: "Cancel subscription",
                          onClick: () => startCancelEdit(r),
                          className: [
                            "items-center justify-center rounded-full border border-rose-100 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-100 hover:border-rose-200 transition",
                            showDecisionButtons ? "inline-flex" : "hidden",
                          ].join(" "),
                          icon: <XCircle className="w-3.5 h-3.5" />,
                          label: "Reject",
                        },
                      ].map((btn) => (
                        <button
                          key={btn.key}
                          onClick={btn.onClick}
                          className={btn.className}
                          title={btn.title}
                        >
                          {btn.icon}
                          <span className="ml-1 hidden xl:inline">
                            {btn.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // TABLE VIEW
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Title / Student / Course
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Start
                </th>
                {hasDetailsOpen && (
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Cancel Reason
                  </th>
                )}
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r, index) => {
                const s = statusStyles[r.status] || statusStyles.pending;
                const isDetailsOpen = detailsId === r.id;
                const isPending = r.status === "pending";
                const showDecisionButtons = isPending;

                return (
                  <tr key={r.id} className="hover:bg-slate-50/70 align-top">
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {index + 1}
                    </td>

                    {/* Title + Student + Course في التيبول */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium text-slate-900">
                          {r.title || "Subscription"}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          ID: {r.id}
                        </span>
                        <span className="text-[11px] text-slate-600">
                          <span className="font-semibold">Student: </span>
                          {r.student || "-"}
                        </span>
                        <span className="text-[11px] text-slate-600">
                          <span className="font-semibold">Course: </span>
                          {r.course_name || "-"}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${s.pill}`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                        {s.icon}
                        <span>{s.label}</span>
                      </span>
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600">
                      {r.start
                        ? new Date(r.start).toLocaleString()
                        : "No start date"}
                    </td>

                    {hasDetailsOpen && (
                      <td className="px-4 py-3 text-xs text-slate-500 max-w-xs">
                        {isDetailsOpen ? (
                          r.cancel_reason ? (
                            <span className="line-clamp-2">
                              {r.cancel_reason}
                            </span>
                          ) : (
                            <span className="text-slate-300">
                              No cancel reason
                            </span>
                          )
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    )}

                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-1.5 text-xs">
                        {[
                          {
                            key: "details",
                            title: "View details",
                            onClick: () =>
                              setDetailsId((prev) =>
                                prev === r.id ? null : r.id
                              ),
                            className:
                              "inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:text-teal-600 hover:border-teal-200 hover:bg-teal-50 transition",
                            icon:
                              detailsId === r.id ? (
                                <EyeOff className="w-3.5 h-3.5" />
                              ) : (
                                <Eye className="w-3.5 h-3.5" />
                              ),
                            label: "Details",
                          },
                          {
                            key: "Accept",
                            title: "Mark as completed",
                            onClick: () => handleStatusChange(r, "accepted"),
                            className: [
                              "items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 px-2 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 hover:border-emerald-200 transition",
                              showDecisionButtons ? "inline-flex" : "hidden",
                            ].join(" "),
                            icon: <CheckCircle2 className="w-3.5 h-3.5" />,
                            label: "Accept",
                          },
                          {
                            key: "Reject",
                            title: "Cancel subscription",
                            onClick: () => startCancelEdit(r),
                            className: [
                              "items-center justify-center rounded-full border border-rose-100 bg-rose-50 px-2 py-1 text-[11px] font-medium text-rose-600 hover:bg-rose-100 hover:border-rose-200 transition",
                              showDecisionButtons ? "inline-flex" : "hidden",
                            ].join(" "),
                            icon: <XCircle className="w-3.5 h-3.5" />,
                            label: "Reject",
                          },
                        ].map((btn) => (
                          <button
                            key={btn.key}
                            onClick={btn.onClick}
                            className={btn.className}
                            title={btn.title}
                          >
                            {btn.icon}
                            <span className="ml-1 hidden xl:inline">
                              {btn.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Cancel Reason Modal */}
      {cancelModalFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Cancel subscription
                </h2>
                <p className="mt-0.5 text-[11px] text-slate-500">
                  {cancelModalFor.title} (ID: {cancelModalFor.id})
                </p>
              </div>
              <button
                onClick={cancelCancelEdit}
                disabled={isLoading}
                className={`inline-flex h-7 w-7 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-2">
              <label className="mb-1 block text-[11px] font-medium text-slate-700">
                Cancel reason
              </label>
              <input
                type="text"
                value={cancelEdit.value}
                onChange={(e) =>
                  setCancelEdit((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }))
                }
                disabled={isLoading}
                autoComplete="off"
                className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
                placeholder="Enter reason for canceling this subscription..."
              />
            </div>

            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={cancelCancelEdit}
                disabled={isLoading}
                className={`rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] text-slate-600 hover:bg-slate-50 ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => confirmCancel(cancelModalFor)}
                disabled={isLoading}
                className={`rounded-full border border-rose-500 bg-rose-500 px-4 py-1.5 text-[11px] font-medium !text-white hover:bg-rose-600 flex items-center justify-center gap-1 ${
                  isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              >
                {isLoading ? (
                  <>
                    <span className="inline-block h-3 w-3 animate-spin rounded-full border border-white border-t-transparent" />
                    <span>Saving...</span>
                  </>
                ) : (
                  "Save & Cancel"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
