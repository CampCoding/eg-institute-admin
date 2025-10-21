"use client";
import React, { useState } from "react";
import {
  CalendarFold,
  CalendarClock,
  Clock,
  UserRound,
  Eye,
  Trash2,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  EyeClosed,
  EyeOff,
} from "lucide-react";
import { reservations } from "@/utils/data";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";



export default function ProfileReservation() {
  const [filter, setFilter] = useState("all"); // all | upcoming | completed | canceled
  const [query, setQuery] = useState("");
  const [showNotifi , setShowNotifi] = useState(false);

  const statusStyles = {
    upcoming: {
      ring: "ring-teal-300",
      left: "before:bg-teal-400",
      dot: "bg-teal-500",
      pill: "bg-teal-50 text-teal-700 border-teal-200",
      icon: <CalendarClock className="w-4 h-4" />,
      label: "Upcoming",
      color:"border-teal-200"
    },
    completed: {
      ring: "ring-emerald-300",
      left: "before:bg-emerald-500",
      dot: "bg-emerald-600",
      color:"border-emerald-200",
      pill: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: <CheckCircle2 className="w-4 h-4" />,
      label: "Completed",
    },
    canceled: {
      ring: "ring-rose-300",
      left: "before:bg-rose-500",
      dot: "bg-rose-600",
      color:"border-rose-200",
      pill: "bg-rose-50 text-rose-700 border-rose-200",
      icon: <XCircle className="w-4 h-4" />,
      label: "Canceled",
    },
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "upcoming", label: "Upcoming" },
    { key: "completed", label: "Completed" },
    { key: "canceled", label: "Canceled" },
  ];


  const filtered = reservations
    .filter((r) => (filter === "all" ? true : r.status === filter))
    .filter((r) => {
      const q = query.trim().toLowerCase();
      if (!q) return true;
      return (
        r.title.toLowerCase().includes(q) ||
        r.teacher.name.toLowerCase().includes(q) ||
        (r.note || "").toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.start) - new Date(a.start));

  return (
    <div className="min-h-screen">
    
      <BreadCrumb title={"Reservations Page"} parent={"Home"} child={"Reservations"}/>
      
      <div className="mb-4 flex mt-5 flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        

        {/* Controls */}
        <div className="flex flex-wrap justify-center items-center gap-3">
          <div className="relative">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search reservations…"
              className="w-64 max-w-[75vw] rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500"
            />
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">
              ⌘K
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={[
                  "px-3 py-1.5 rounded-full text-sm font-medium border transition",
                  filter === f.key
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-white text-gray-700 border-gray-200 hover:border-teal-300",
                ].join(" ")}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-4">
        {filtered.map((r) => {
          const s = statusStyles[r.status];
          return (
            <div
              key={r.id}
              className={[
                "relative bg-white flex-wrap sm:flex-nowrap rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-all",
                "p-4 md:p-6",
               `border-l-4  ${s.color}` ,
                s.left,
              ].join(" ")}
            >
              <div className="flex flex-wrap sm:flex-nowrap items-start gap-4">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-teal-600 focus:ring-teal-500"
                />

                {/* Avatar */}
                <div className="h-10 w-10 rounded-full bg-teal-50 flex-wrap sm:flex-nowrap text-teal-700 flex items-center justify-center ring-1 ring-teal-100 overflow-hidden">
                  {r.teacher.avatar ? (
                    <img
                      src={r.teacher.avatar}
                      alt={r.teacher.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="w-5 h-5" />
                  )}
                </div>

                {/* Content */}
                <div className="sm:!flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-base md:text-lg font-semibold text-gray-900">
                      {r.title}
                    </h3>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border"
                      title={s.label + " status"}
                      >
                      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                      <span className={s.pill}></span>
                    </span>
                    {/* Actual pill (separate so we can style) */}
                    <span className={`ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${s.pill}`}>
                      {s.icon}
                      {s.label}
                    </span>
                  </div>

                  <div className="mt-1 text-sm text-gray-700">
                    with <span className="font-medium text-teal-700">{r.teacher.name}</span>
                  </div>

                  {/* Meta */}
                  <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-500">
                    <div className="inline-flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      <span>{new Date(r.start).toLocaleString()}</span>
                    </div>           
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 ml-auto text-gray-500">
                  <button
                  onClick={() => setShowNotifi(prev => !prev)}
                    className="p-2 rounded-full hover:bg-gray-100"
                    title="View"
                  >
                    {showNotifi ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    className="p-2 rounded-full hover:bg-gray-100"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
            No reservations match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
