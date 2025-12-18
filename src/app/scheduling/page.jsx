"use client";
import React, { useState, useMemo, useEffect } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { CalendarDays, Clock, Users } from "lucide-react";
import { useGetAllPublicSchedule } from "../../utils/Api/public_Sc/GetPublicSc";

const timeSlots = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
  "6:00 PM",
];

const seedReservations = [
  {
    id: 1,
    date: "2025-08-11",
    time: "10:00 AM",
    type: "session",
    title: "English Conversation",
    instructor: "Ms. Sarah Johnson",
    room: "Room A1",
    students: 8,
    maxStudents: 12,
    status: "confirmed",
  },
  {
    id: 2,
    date: "2025-08-11",
    time: "2:00 PM",
    type: "checkout",
    title: "Check Out - Room Cleaning",
    status: "maintenance",
  },
];

// ---------- Date helpers (NO toISOString bugs) ----------
const parseISODate = (s) => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d); // local midnight
};

const formatLocalYMD = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

// fallback week start (Sunday)
const getLocalWeekStartYMD = (weekOffset = 0) => {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dayOfWeek = base.getDay(); // 0=Sun
  const start = new Date(base);
  start.setDate(base.getDate() - dayOfWeek + weekOffset * 7);
  return formatLocalYMD(start);
};

// "13:36:00" -> "1:00 PM" (floors to hour to match your grid)
const timeHHMMSS_toSlot = (hhmmss) => {
  if (!hhmmss) return null;
  const [hhStr] = hhmmss.split(":");
  let h = Number(hhStr);
  if (Number.isNaN(h)) return null;

  const isPM = h >= 12;
  const displayH = ((h + 11) % 12) + 1; // 0->12
  return `${displayH}:00 ${isPM ? "PM" : "AM"}`;
};

export default function SchedulingPage() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [localReservations, setLocalReservations] = useState(seedReservations);
  const [viewMode, setViewMode] = useState("week");
  const [activeReservation, setActiveReservation] = useState(null);
  const [creatingSlot, setCreatingSlot] = useState(null);

  const { data, isLoading } = useGetAllPublicSchedule();

  // API -> reservations (optional: you can remove this block لو مش عايز تعرض داتا الـ API)
  const apiReservations = useMemo(() => {
    const lessons = data?.group_lessons || [];
    if (!Array.isArray(lessons)) return [];

    return lessons
      .map((l) => {
        const time = timeHHMMSS_toSlot(l?.start_time);
        if (!l?.session_date || !time) return null;

        return {
          id: String(l.schedule_id),
          date: String(l.session_date),
          time,
          type: "session",
          title: l?.course_name || "Session",
          instructor: l?.group_name || "—",
          room: "—",
          students: 0,
          maxStudents: 0,
          status: l?.session_status || "confirmed",
          image: l?.image,
        };
      })
      .filter(Boolean);
  }, [data?.group_lessons]);

  const reservations = useMemo(
    () => [...apiReservations, ...localReservations],
    [apiReservations, localReservations]
  );

  // week dates built from API week_start (or fallback local)
  const getWeekDates = (weekStartStr, weekOffset = 0) => {
    const startStr = weekStartStr || getLocalWeekStartYMD(0);
    const start = parseISODate(startStr);
    if (!start) return [];

    const startOfWeek = new Date(start);
    startOfWeek.setDate(startOfWeek.getDate() + weekOffset * 7);

    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);

      week.push({
        date: formatLocalYMD(date), // ✅ no UTC shift
        day: date.toLocaleDateString("en-US", { weekday: "long" }),
        shortDay: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: String(date.getDate()).padStart(2, "0"),
        monthNumber: String(date.getMonth() + 1).padStart(2, "0"),
      });
    }
    return week;
  };

  const weekDates = useMemo(
    () => getWeekDates(data?.week_start, currentWeek),
    [data?.week_start, currentWeek]
  );

  const getWeekRange = () => {
    const first =
      parseISODate(data?.week_start) ||
      (weekDates[0] ? parseISODate(weekDates[0].date) : null);
    const last =
      parseISODate(data?.week_end) ||
      (weekDates[6] ? parseISODate(weekDates[6].date) : null);
    if (!first || !last) return "";

    return `${first.getDate()} ${first.toLocaleDateString("en-US", {
      month: "short",
    })} ${first.getFullYear()} - ${last.getDate()} ${last.toLocaleDateString(
      "en-US",
      { month: "short" }
    )} ${last.getFullYear()}`;
  };

  const getReservationForSlot = (date, time) => {
    return reservations.find((r) => r.date === date && r.time === time);
  };

  const getReservationCount = (date) => {
    return reservations.filter((r) => r.date === date).length;
  };

  const handleSlotClick = (dayInfo, time) => {
    const existing = getReservationForSlot(dayInfo.date, time);
    if (!existing) setCreatingSlot({ date: dayInfo.date, time });
  };

  const handleDeleteReservation = (id) => {
    setLocalReservations((prev) => prev.filter((r) => r.id !== id));
    setActiveReservation(null);
  };

  const handleUpdateReservation = (id, updates) => {
    setLocalReservations((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...updates } : r))
    );
  };

  const handleCreateReservation = (slot, payload) => {
    setLocalReservations((prev) => {
      const lastId = prev.length ? Number(prev[prev.length - 1].id) : 0;
      const nextId = Number.isFinite(lastId) ? lastId + 1 : prev.length + 1;
      return [
        ...prev,
        {
          id: nextId,
          date: slot.date,
          time: slot.time,
          type: "session",
          status: "confirmed",
          ...payload,
        },
      ];
    });
  };

  const getSlotContent = (reservation) => {
    if (!reservation) return null;

    if (reservation.type === "checkout") {
      return (
        <div className="bg-slate-500 text-white p-2 rounded-lg text-xs font-medium h-12 flex flex-col items-center justify-center text-center leading-tight cursor-pointer hover:bg-slate-600 transition-colors">
          Check Out
          <span className="text-slate-200">Maintenance</span>
        </div>
      );
    }

    if (reservation.type === "session") {
      const max = reservation.maxStudents || 0;
      const students = reservation.students || 0;
      const isFullyBooked = max > 0 && students >= max;

      const ratio = Math.min(100, Math.round((students / (max || 1)) * 100));

      return (
        <div
          className={`p-2 rounded-lg text-xs font-medium h-12 flex flex-col justify-center text-center leading-tight cursor-pointer transition-colors ${
            isFullyBooked
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-orange-400 text-white hover:bg-orange-500"
          }`}
          title={`${reservation.title} • ${students}/${max || "—"}`}
        >
          <div className="truncate font-semibold">{reservation.title}</div>

          <div className="flex items-center gap-2 justify-center">
            <div className="text-xs opacity-90 truncate">
              {max ? `${students}/${max} students` : "Session"}
            </div>

            {!!max && (
              <div className="h-1.5 w-20 bg-white/40 rounded overflow-hidden">
                <div
                  className="h-full bg-white/90"
                  style={{ width: `${ratio}%` }}
                />
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  const todayStr = data?.today || formatLocalYMD(new Date());

  return (
    <div className="min-h-screen">
      <BreadCrumb
        title={"Class Scheduling"}
        parent={"Home"}
        child={"Scheduling"}
      />

      {/* Top Stats */}
      <div className="mt-6 md:max-w-full grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <CalendarDays size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {reservations.filter((r) => r.type === "session").length}
              </p>
              <p className="text-sm text-gray-600">Active Sessions</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Users size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {reservations
                  .filter((r) => r.type === "session")
                  .reduce((sum, r) => sum + (r.students || 0), 0)}
              </p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {reservations.filter((r) => r.type === "checkout").length}
              </p>
              <p className="text-sm text-gray-600">Maintenance Slots</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header Controls */}
      <div className="mt-8 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-lg font-semibold text-gray-900">
              {getWeekRange()}
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Grid (mobile horizontal scroll) */}
      <div className="w-full rounded-2xl shadow-lg border border-gray-100 overflow-x-auto md:overflow-x-visible [-webkit-overflow-scrolling:touch]">
        {/* w-max + min-w-full + padding right -> last cell never clipped */}
        <div className="w-max min-w-full pr-4 md:pr-0">
          {/* Header Row */}
          <div className="grid grid-cols-[90px_repeat(7,140px)] bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="font-semibold p-1 flex justify-center items-center text-gray-700 border-r border-gray-200 bg-gray-100">
              Time
            </div>

            {weekDates.map((dayInfo) => {
              const isTodayHeader = dayInfo.date === todayStr;
              return (
                <div
                  key={dayInfo.date}
                  className={`text-center p-1 flex flex-col justify-center items-center border-r border-gray-200 last:border-r-0 ${
                    isTodayHeader ? "bg-indigo-50" : ""
                  }`}
                >
                  <div className="font-semibold text-gray-900">
                    {dayInfo.shortDay} {dayInfo.dayNumber}/{dayInfo.monthNumber}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {getReservationCount(dayInfo.date)} Reservation
                    {getReservationCount(dayInfo.date) !== 1 ? "s" : ""}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Time Slots Grid */}
          <div className="divide-y divide-gray-100">
            {timeSlots.map((time) => (
              <div
                key={time}
                className="grid grid-cols-[90px_repeat(7,140px)] min-h-[60px]"
              >
                {/* Time Column */}
                <div className="p-4 bg-gray-50 justify-center border-r border-gray-200 flex items-center">
                  <div className="text-sm font-medium text-gray-700">
                    {time}
                  </div>
                </div>

                {/* Day Columns */}
                {weekDates.map((dayInfo) => {
                  const reservation = getReservationForSlot(dayInfo.date, time);
                  const isToday = dayInfo.date === todayStr;

                  return (
                    <div
                      key={`${dayInfo.date}-${time}`}
                      className={`p-2 border-r border-gray-200 last:border-r-0 hover:bg-gray-50 transition-colors cursor-pointer ${
                        isToday ? "bg-indigo-50/30" : ""
                      }`}
                      onClick={() => handleSlotClick(dayInfo, time)}
                    >
                      {reservation ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveReservation(reservation);
                          }}
                          className="block w-full text-left"
                        >
                          {getSlotContent(reservation)}
                        </button>
                      ) : (
                        <div className="h-12 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                          <span className="text-xs text-gray-400">
                            + Add Session
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6 bg-white rounded-xl p-4 shadow border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-400 rounded" />
            <span className="text-sm text-gray-600">Available Session</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span className="text-sm text-gray-600">Full Session</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-slate-500 rounded" />
            <span className="text-sm text-gray-600">Maintenance/Check Out</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-dashed border-gray-300 rounded" />
            <span className="text-sm text-gray-600">Available Time Slot</span>
          </div>
        </div>
      </div>

      {/* View Reservation Modal */}
      {activeReservation && (
        <ReservationModal
          reservation={activeReservation}
          onClose={() => setActiveReservation(null)}
          onDelete={() => handleDeleteReservation(activeReservation.id)}
          onUpdate={(updates) =>
            handleUpdateReservation(activeReservation.id, updates)
          }
        />
      )}

      {/* Create Session Modal */}
      {creatingSlot && (
        <CreateSessionModal
          slot={creatingSlot}
          onClose={() => setCreatingSlot(null)}
          onCreate={(payload) => {
            handleCreateReservation(creatingSlot, payload);
            setCreatingSlot(null);
          }}
        />
      )}
    </div>
  );
}

/* -------------------- Modals -------------------- */

function ReservationModal({ reservation, onClose, onDelete, onUpdate }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isSession = reservation.type === "session";
  const isFull =
    isSession && reservation.students >= (reservation.maxStudents || 0);

  const capacityPct = isSession
    ? Math.min(
        100,
        Math.round(
          (reservation.students / (reservation.maxStudents || 1)) * 100
        )
      )
    : 0;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-0 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-100">
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {reservation.title ||
                (reservation.type === "checkout"
                  ? "Maintenance / Check Out"
                  : "Reservation")}
            </h3>
            <button
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <Info label="Date" value={reservation.date} />
              <Info label="Time" value={reservation.time} />
              {reservation.room && (
                <Info label="Room" value={reservation.room} />
              )}
              {reservation.instructor && (
                <Info label="Instructor" value={reservation.instructor} />
              )}
              <Info label="Type" value={reservation.type} />
              <Info label="Status" value={reservation.status || "—"} />
              {isSession && (
                <>
                  <Info
                    label="Students"
                    value={`${reservation.students}/${reservation.maxStudents}`}
                  />
                  <div>
                    <div className="text-gray-500">Capacity</div>
                    <div className="mt-0.5 w-full h-2 bg-gray-200 rounded">
                      <div
                        className={`h-2 rounded ${
                          isFull ? "bg-red-500" : "bg-orange-400"
                        }`}
                        style={{ width: `${capacityPct}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <button
              onClick={onDelete}
              className="px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm"
            >
              Delete
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateSessionModal({ slot, onClose, onCreate }) {
  const [title, setTitle] = useState("");
  const [instructor, setInstructor] = useState("");
  const [room, setRoom] = useState("");
  const [maxStudents, setMaxStudents] = useState(12);
  const [students, setStudents] = useState(0);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onCreate({
      title: title.trim(),
      instructor: instructor.trim() || "—",
      room: room.trim() || "—",
      students: Number(students) || 0,
      maxStudents: Number(maxStudents) || 1,
    });
  };

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-0 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-100"
        >
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              Create New Session
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          <div className="p-4 space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <Info label="Date" value={slot.date} />
              <Info label="Time" value={slot.time} />
            </div>

            <div className="space-y-2">
              <label className="block text-gray-600 text-sm">
                Session Title <span className="text-red-500">*</span>
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g. English Conversation"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block text-gray-600 text-sm">Instructor</label>
              <input
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g. Ms. Sarah Johnson"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-gray-600 text-sm">Room</label>
              <input
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="e.g. Room A1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="block text-gray-600 text-sm">
                  Max Students
                </label>
                <input
                  type="number"
                  min={1}
                  value={maxStudents}
                  onChange={(e) => setMaxStudents(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-gray-600 text-sm">
                  Current Students
                </label>
                <input
                  type="number"
                  min={0}
                  value={students}
                  onChange={(e) => setStudents(Number(e.target.value))}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border-t flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm hover:bg-indigo-700"
            >
              Create Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-gray-500 text-xs">{label}</div>
      <div className="mt-0.5 text-gray-900 font-medium text-sm">{value}</div>
    </div>
  );
}
