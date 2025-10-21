"use client";
import React, { useState, useMemo, useEffect } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import {
  CalendarDays,
  Clock,
  ChevronLeft,
  ChevronRight,
  Users,
  Plus,
  Search,
} from "lucide-react";

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
    day: "Monday",
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
    day: "Monday",
    date: "2025-08-11",
    time: "2:00 PM",
    type: "checkout",
    title: "Check Out - Room Cleaning",
    status: "maintenance",
  },
  {
    id: 3,
    day: "Tuesday",
    date: "2025-08-12",
    time: "11:00 AM",
    type: "checkout",
    title: "Check Out - Equipment Setup",
    status: "maintenance",
  },
  {
    id: 4,
    day: "Wednesday",
    date: "2025-08-13",
    time: "10:00 AM",
    type: "session",
    title: "IELTS Preparation",
    instructor: "Dr. Ahmed Ali",
    room: "Room B2",
    students: 15,
    maxStudents: 15,
    status: "full",
  },
  {
    id: 5,
    day: "Wednesday",
    date: "2025-08-13",
    time: "12:00 PM",
    type: "checkout",
    title: "Check Out - Maintenance",
    status: "maintenance",
  },
  {
    id: 6,
    day: "Thursday",
    date: "2025-08-14",
    time: "8:00 AM",
    type: "checkout",
    title: "Check Out - Weekly Cleaning",
    status: "maintenance",
  },
  {
    id: 7,
    day: "Friday",
    date: "2025-08-15",
    time: "1:00 PM",
    type: "session",
    title: "Business English",
    instructor: "Ms. Fatima Hassan",
    room: "Room C1",
    students: 6,
    maxStudents: 10,
    status: "confirmed",
  },
  {
    id: 8,
    day: "Saturday",
    date: "2025-08-16",
    time: "11:00 AM",
    type: "session",
    title: "Kids English Club",
    instructor: "Ms. Mona Ahmed",
    room: "Kids Room",
    students: 12,
    maxStudents: 12,
    status: "full",
  },
  {
    id: 9,
    day: "Sunday",
    date: "2025-08-10",
    time: "1:00 PM",
    type: "session",
    title: "Grammar Workshop",
    instructor: "Mr. Omar Khalil",
    room: "Room A2",
    students: 5,
    maxStudents: 8,
    status: "confirmed",
  },
];

export default function SchedulingPage() {
  const [currentWeek, setCurrentWeek] = useState(0);
  const [reservations, setReservations] = useState(seedReservations);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [viewMode, setViewMode] = useState("week");
  const [activeReservation, setActiveReservation] = useState(null); // NEW

  // Generate week dates
  const getWeekDates = (weekOffset = 0) => {
    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay() + weekOffset * 7)
    );

    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      week.push({
        day: date.toLocaleDateString("en-US", { weekday: "long" }),
        date: date.toISOString().split("T")[0],
        shortDay: date.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: String(date.getDate()).padStart(2, "0"),
        monthNumber: String(date.getMonth() + 1).padStart(2, "0"),
      });
    }
    return week;
  };

  const weekDates = useMemo(() => getWeekDates(currentWeek), [currentWeek]);

  const getWeekRange = () => {
    const firstDate = new Date(weekDates[0].date);
    const lastDate = new Date(weekDates[6].date);
    return `${firstDate.getDate()} ${firstDate.toLocaleDateString("en-US", { month: "short" })} ${firstDate.getFullYear()} - ${lastDate.getDate()} ${lastDate.toLocaleDateString("en-US", { month: "short" })} ${lastDate.getFullYear()}`;
  };

  const getReservationForSlot = (day, time) => {
    return reservations.find((r) => r.day === day && r.time === time);
  };

  const getReservationCount = (day) => {
    return reservations.filter((r) => r.day === day).length;
  };

  const handleSlotClick = (day, time, date) => {
    const existing = getReservationForSlot(day, time);
    if (!existing) {
      setSelectedSlot({ day, time, date });
      alert(`Create new session for ${day} at ${time}`);
    }
  };

  const handleDeleteReservation = (id) => {
    setReservations((prev) => prev.filter((r) => r.id !== id));
    setActiveReservation(null);
  };

  const handleUpdateReservation = (id, updates) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
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
      const isFullyBooked = reservation.students >= reservation.maxStudents;
      const ratio = Math.min(
        100,
        Math.round((reservation.students / reservation.maxStudents) * 100)
      );
      return (
        <div
          className={`p-2 rounded-lg text-xs font-medium h-12 flex flex-col justify-center text-center leading-tight cursor-pointer transition-colors ${
            isFullyBooked
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-orange-400 text-white hover:bg-orange-500"
          }`}
          title={`${reservation.title} • ${reservation.students}/${reservation.maxStudents}`}
        >
          <div className="truncate font-semibold">{reservation.title}</div>
          <div className="flex items-center gap-2 justify-center">
            <div className="text-xs opacity-90 truncate">
              {reservation.students}/{reservation.maxStudents} students
            </div>
            <div className="h-1.5 w-20 bg-white/40 rounded overflow-hidden">
              <div className="h-full bg-white/90" style={{ width: `${ratio}%` }} />
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  const navigateWeek = (direction) => {
    setCurrentWeek((prev) => prev + direction);
  };

  return (
    <div className="min-h-screen">
      <div className="">
        <BreadCrumb title={"Class Scheduling"} parent={"Home"} child={"Scheduling"} />

        {/* Top Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                    .reduce((sum, r) => sum + r.students, 0)}
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
            {/* Navigation Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentWeek(0)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                Today
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigateWeek(-1)}
                  className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={() => navigateWeek(1)}
                  className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="text-lg font-semibold text-gray-900">{getWeekRange()}</div>
            </div>

            {/* View Controls + Search (optional) */}
            <div className="flex items-center gap-3">
              <div className="flex bg-white border border-gray-200 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("month")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === "month"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode("week")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === "week"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode("day")}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === "day"
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Day
                </button>
              </div>

              {/* Example search input (not wired) */}
              <div className="relative hidden sm:block">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  placeholder="Search (todo)"
                  className="pl-9 pr-3 py-2 rounded-lg border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="!max-w-3xl overflow-x-auto md:!max-w-full rounded-2xl shadow-lg border border-gray-100 md:overflow-hidden">
          {/* Header Row */}
          <div className="grid grid-cols-8 bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
            <div className="font-semibold p-1 flex justify-center items-center text-gray-700 border-r border-gray-200 bg-gray-100">
              Time
            </div>
            {weekDates.map((dayInfo, index) => (
              <div
                key={dayInfo.date}
                className={`text-center p-1 flex flex-col justify-center items-center border-r border-gray-200 last:border-r-0 ${
                  index === new Date().getDay() ? "bg-indigo-50" : ""
                }`}
              >
                <div className="font-semibold text-gray-900">
                  {dayInfo.shortDay} {dayInfo.dayNumber}/{dayInfo.monthNumber}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getReservationCount(dayInfo.day)} Reservation
                  {getReservationCount(dayInfo.day) !== 1 ? "s" : ""}
                </div>
              </div>
            ))}
          </div>

          {/* Time Slots Grid */}
          <div className="divide-y divide-gray-100">
            {timeSlots.map((time) => (
              <div key={time} className="grid grid-cols-8 min-h-[60px]">
                {/* Time Column */}
                <div className="p-4 bg-gray-50 justify-center border-r border-gray-200 flex items-center">
                  <div className="text-sm font-medium text-gray-700">{time}</div>
                </div>

                {/* Day Columns */}
                {weekDates.map((dayInfo) => {
                  const reservation = getReservationForSlot(dayInfo.day, time);
                  const isToday = dayInfo.date === new Date().toISOString().split("T")[0];

                  return (
                    <div
                      key={`${dayInfo.day}-${time}`}
                      className={`p-2 border-r border-gray-200 last:border-r-0 hover:bg-gray-50 transition-colors cursor-pointer ${
                        isToday ? "bg-indigo-25" : ""
                      }`}
                      onClick={() => handleSlotClick(dayInfo.day, time, dayInfo.date)}
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
                        null
                        // <div className="h-12 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        //   <Plus size={16} className="text-gray-400" />
                        // </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 bg-white rounded-xl p-4 shadow border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-400 rounded"></div>
              <span className="text-sm text-gray-600">Available Session</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Full Session</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-slate-500 rounded"></div>
              <span className="text-sm text-gray-600">Maintenance/Check Out</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-dashed border-gray-300 rounded"></div>
              <span className="text-sm text-gray-600">Available Time Slot</span>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {activeReservation && (
        <ReservationModal
          reservation={activeReservation}
          onClose={() => setActiveReservation(null)}
          onDelete={() => handleDeleteReservation(activeReservation.id)}
          onUpdate={(updates) => handleUpdateReservation(activeReservation.id, updates)}
        />
      )}
    </div>
  );
}

function ReservationModal({ reservation, onClose, onDelete, onUpdate }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isSession = reservation.type === "session";
  const isFull = isSession && reservation.students >= (reservation.maxStudents || 0);

  const capacityPct = isSession
    ? Math.min(100, Math.round((reservation.students / (reservation.maxStudents || 1)) * 100))
    : 0;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />

      {/* modal */}
      <div
        role="dialog"
        aria-modal="true"
        className="absolute inset-0 flex items-center justify-center p-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl border border-gray-100">
          {/* header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">
              {reservation.title || (reservation.type === "checkout" ? "Maintenance / Check Out" : "Reservation")}
            </h3>
            <button
              onClick={onClose}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg hover:bg-gray-100"
              aria-label="Close"
            >
              ✕
            </button>
          </div>

          {/* body */}
          <div className="p-4 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <Info label="Date" value={reservation.date} />
              <Info label="Time" value={reservation.time} />
              {reservation.room && <Info label="Room" value={reservation.room} />}
              {reservation.instructor && <Info label="Instructor" value={reservation.instructor} />}
              <Info label="Type" value={reservation.type} />
              <Info label="Status" value={reservation.status || "—"} />
              {isSession && (
                <>
                  <Info label="Students" value={`${reservation.students}/${reservation.maxStudents}`} />
                  <div>
                    <div className="text-gray-500">Capacity</div>
                    <div className="mt-0.5 w-full h-2 bg-gray-200 rounded">
                      <div
                        className={`h-2 rounded ${isFull ? "bg-red-500" : "bg-orange-400"}`}
                        style={{ width: `${capacityPct}%` }}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* {isSession && (
              <div className="mt-2 flex items-center gap-2">
               
                <button
                  onClick={() => onUpdate({ status: isFull ? "confirmed" : "full" })}
                  className="ml-auto px-3 py-2 rounded-lg border text-sm hover:bg-gray-50"
                >
                  {isFull ? "Mark Not Full" : "Mark Full"}
                </button>
              </div>
            )} */}
          </div>

          {/* footer */}
          <div className="p-4 border-t flex items-center justify-between">
            <button
              onClick={onDelete}
              className="px-4 py-2 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 text-sm"
            >
              Delete
            </button>
            <div className="flex items-center gap-2">
              <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-gray-50">
                Close
              </button>
             
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-gray-500">{label}</div>
      <div className="mt-0.5 text-gray-900 font-medium">{value}</div>
    </div>
  );
}

