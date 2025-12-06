"use client";
import React, { useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  User,
  GraduationCap,
  CheckCircle2,
  XCircle,
  Filter,
  Search,
} from "lucide-react";

const ACCENT = "#02AAA0";

// Demo data (replace with API data)
const DEMO_APPTS = [
  {
    id: "apt_001",
    date: "2025-08-11",
    start: "10:00",
    end: "10:30",
    instructorName: "Mariam Fathi",
    teacherName: "Omar Nasser",
    status: "confirmed", // confirmed | pending | cancelled | completed
    type: "online", // online | offline
    meetingUrl: "https://example.com/meet/egy-101",
  },
  {
    id: "apt_002",
    date: "2025-08-11",
    start: "12:00",
    end: "13:00",
    instructorName: "Sara Al-Masri",
    teacherName: "Lina Ahmed",
    status: "pending",
    type: "offline",
    location: "Room B2",
  },
  {
    id: "apt_003",
    date: "2025-08-10",
    start: "15:30",
    end: "16:15",
    instructorName: "Youssef Kamal",
    teacherName: "Omar Ali",
    status: "completed",
    type: "online",
    meetingUrl: "https://example.com/meet/msa-int",
  },
  {
    id: "apt_004",
    date: "2025-08-09",
    start: "09:00",
    end: "09:45",
    instructorName: "Mariam Fathi",
    teacherName: "Hana Saeed",
    status: "cancelled",
    type: "offline",
    location: "Room A1",
  },
];

const statusTone = (s) => {
  const map = {
    confirmed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    completed: "bg-sky-50 text-sky-700 ring-sky-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    cancelled: "bg-rose-50 text-rose-700 ring-rose-200",
    default: "bg-slate-50 text-slate-700 ring-slate-200",
  };
  return map[s] || map.default;
};

const typeTone = (t) =>
  t === "online"
    ? "bg-blue-50 text-blue-700 ring-blue-200"
    : "bg-slate-50 text-slate-700 ring-slate-200";

function minutesBetween(dateStr, startHHMM, endHHMM) {
  const [sh, sm] = startHHMM.split(":").map(Number);
  const [eh, em] = endHHMM.split(":").map(Number);
  const start = new Date(`${dateStr}T${startHHMM}:00`);
  const end = new Date(`${dateStr}T${endHHMM}:00`);
  return Math.max(0, Math.round((end - start) / 60000));
}

function Badge({ children, className = "" }) {
  return (
    <span className={`text-[11px] px-2.5 py-1 rounded-full ring-1 ${className}`}>
      {children}
    </span>
  );
}

export default function ReportsAppointements({ appointments = DEMO_APPTS }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const filtered = useMemo(() => {
    let list = [...appointments];

    // search by names
    const term = q.trim().toLowerCase();
    if (term) {
      list = list.filter(
        (a) =>
          a.instructorName.toLowerCase().includes(term) ||
          a.teacherName.toLowerCase().includes(term)
      );
    }

    // status filter
    if (status !== "all") list = list.filter((a) => a.status === status);

    // type filter
    if (type !== "all") list = list.filter((a) => a.type === type);

    // date range
    if (from) list = list.filter((a) => a.date >= from);
    if (to) list = list.filter((a) => a.date <= to);

    // sort by date then start time ascending
    list.sort((a, b) => {
      if (a.date === b.date) return a.start.localeCompare(b.start);
      return a.date.localeCompare(b.date);
    });

    return list;
  }, [appointments, q, status, type, from, to]);

  return (
    <div className="min-h-screen mt-5">
      {/* Controls */}
      <div className="mb-4  rounded-2xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2 text-slate-600">
          <Filter size={16} />
          <span className="text-sm font-medium">Filter Appointments</span>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by instructor or teacher…"
              className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
            />
          </div>

          {/* Status */}
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 bg-white outline-none focus:ring-2 ring-[var(--primary-color)]"
          >
            <option value="all">All statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Type */}
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 bg-white outline-none focus:ring-2 ring-[var(--primary-color)]"
          >
            <option value="all">All types</option>
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>

          {/* Date range */}
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
            />
            <input
              type="date"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
            />
          </div>
        </div>

        <div className="mt-3 text-xs text-slate-500">
          Showing <span className="font-medium text-slate-900">{filtered.length}</span> results
        </div>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No appointments found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((a) => {
            const mins = minutesBetween(a.date, a.start, a.end);
            return (
              <article
                key={a.id}
                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {/* Header strip */}
                <div className="relative h-14 bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-500">
                  <div className="absolute inset-0 bg-black/5" />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2 text-white drop-shadow">
                    <Calendar size={16} />
                    <div className="font-medium">
                      {new Date(`${a.date}T00:00:00`).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })}
                    </div>
                  </div>

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <Badge className={statusTone(a.status)}>
                      {a.status.charAt(0).toUpperCase() + a.status.slice(1)}
                    </Badge>
                    <Badge className={typeTone(a.type)}>
                      {a.type === "online" ? "Online" : "Offline"}
                    </Badge>
                  </div>
                </div>

                {/* Body */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-800">
                      <GraduationCap size={16} />
                      <span className="text-sm">
                        <span className="text-slate-500">Instructor:</span>{" "}
                        <span className="font-medium">{a.instructorName}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-slate-800">
                    <User size={16} />
                    <span className="text-sm">
                      <span className="text-slate-500">Student:</span>{" "}
                      <span className="font-medium">{a.teacherName}</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                    <div className="flex items-center gap-2 text-slate-700">
                      <Clock size={16} />
                      <span className="text-sm">
                        {a.start}–{a.end}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{mins} min</span>
                  </div>

                  {/* Type-specific section */}
                  {a.type === "online" ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-700">
                        <Video size={16} />
                        <span className="text-sm">Online</span>
                      </div>
                 
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-700">
                        <MapPin size={16} />
                        <span className="text-sm">
                          {"Onfline"}
                        </span>
                      </div>
                     
                    </div>
                  )}

                  {/* Status hint */}
                  {a.status === "completed" && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <CheckCircle2 size={14} className="text-emerald-600" />
                      Session completed
                    </div>
                  )}
                  {a.status === "cancelled" && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <XCircle size={14} className="text-rose-600" />
                      Reservation was cancelled
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
