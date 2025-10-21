"use client";

import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import {
  UserPlus,
  CreditCard,
  UserCheck,
  BookOpen,
  CheckCircle2,
  PencilLine,
  Search,
  ChevronRight,
} from "lucide-react";
import { general_data } from "@/utils/data";
import ReportUsers from "@/components/Reports/ReportUsers/ReportUsers";
import ReportCourses from "@/components/Reports/ReportCourses/ReportCourses";
import ReportsAppointements from "@/components/Reports/ReportsAppointements/ReportsAppointements";
import ReportIncomes from "@/components/Reports/ReportIncomes/ReportIncomes";
import ReportReservations from "@/components/Reports/ReportReservations/ReportReservations";
import ReportStudents from "@/components/Reports/ReportStudents/ReportStudents";
import ReportGeneral from "@/components/Reports/ReportGeneral/ReportGeneral";

const tabs = [
  { id: 2, title: "General" },
  { id: 3, title: "Users" },
  { id: 4, title: "Courses" },
  { id: 5, title: "Appointement" },
  { id: 6, title: "Income" },
  { id: 7, title: "Reservations" },
  { id: 8, title: "Students" },
];

const badgeTone = (tone = "slate") => {
  const map = {
    emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    blue: "bg-blue-50 text-blue-700 ring-blue-200",
    violet: "bg-violet-50 text-violet-700 ring-violet-200",
    teal: "bg-teal-50 text-teal-700 ring-teal-200",
    amber: "bg-amber-50 text-amber-700 ring-amber-200",
    pink: "bg-pink-50 text-pink-700 ring-pink-200",
    slate: "bg-slate-50 text-slate-700 ring-slate-200",
  };
  return map[tone] || map.slate;
};

const typeIcon = (type) => {
  switch (type) {
    case "STUDENT_REGISTERED":
      return UserPlus;
    case "PAYMENT_RECEIVED":
      return CreditCard;
    case "STUDENT_ASSIGNED_TEACHER":
      return UserCheck;
    case "COURSE_ENROLLED":
      return BookOpen;
    case "LESSON_COMPLETED":
      return CheckCircle2;
    case "TEACHER_CREATED_COURSE":
      return BookOpen;
    case "TEACHER_UPDATED_LESSON":
      return PencilLine;
    default:
      return BookOpen;
  }
};

const eventCategory = (type) => {
  switch (type) {
    case "PAYMENT_RECEIVED":
      return "Income";
    case "STUDENT_ASSIGNED_TEACHER":
      return "Appointement";
    case "STUDENT_REGISTERED":
      return "Students";
    case "COURSE_ENROLLED":
    case "LESSON_COMPLETED":
    case "TEACHER_CREATED_COURSE":
    case "TEACHER_UPDATED_LESSON":
      return "Courses";
    default:
      return "General";
  }
};

const tz = "Africa/Cairo";
const dateKey = (iso) =>
  new Date(iso).toLocaleDateString("en-CA", { timeZone: tz }); // YYYY-MM-DD
const fmtDate = (iso) =>
  new Date(iso).toLocaleString("ar-EG", {
    timeZone: tz,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

/** Build Users Report:
 *  - new users per day
 *  - split students/teachers
 *  - cumulative totals
 *  - teacher registrations inferred from first teacher appearance if no TEACHER_REGISTERED
 */
function useUsersReport(events) {
  return useMemo(() => {
    // 1) Collect explicit registrations
    const regs = [];
    const teacherRegIds = new Set();
    const studentRegIds = new Set();

    for (const e of events) {
      if (e.type === "STUDENT_REGISTERED" && e.actor?.id) {
        regs.push({ id: e.actor.id, role: "student", at: e.at });
        studentRegIds.add(e.actor.id);
      }
      if (e.type === "TEACHER_REGISTERED" && e.actor?.id) {
        regs.push({ id: e.actor.id, role: "teacher", at: e.at });
        teacherRegIds.add(e.actor.id);
      }
    }

    // 2) Infer teacher "first seen" if no explicit TEACHER_REGISTERED
    const firstSeenTeacher = new Map(); // id -> earliest ISO
    for (const e of events) {
      if (e.actor?.role === "teacher" && e.actor?.id) {
        const prev = firstSeenTeacher.get(e.actor.id);
        if (!prev || new Date(e.at) < new Date(prev)) {
          firstSeenTeacher.set(e.actor.id, e.at);
        }
      }
    }
    for (const [id, at] of firstSeenTeacher.entries()) {
      if (!teacherRegIds.has(id)) {
        regs.push({ id, role: "teacher", at });
        teacherRegIds.add(id);
      }
    }

    // 3) For safety, keep the earliest registration per user
    const firstReg = new Map(); // key: role|id -> at
    for (const r of regs) {
      const k = `${r.role}|${r.id}`;
      if (!firstReg.has(k) || new Date(r.at) < new Date(firstReg.get(k))) {
        firstReg.set(k, r.at);
      }
    }
    const cleanedRegs = Array.from(firstReg.entries()).map(([key, at]) => {
      const role = key.split("|")[0];
      return { role, at };
    });

    // 4) Group by date (Cairo)
    const daily = new Map(); // date -> { newStudents, newTeachers }
    for (const r of cleanedRegs) {
      const dk = dateKey(r.at);
      if (!daily.has(dk)) daily.set(dk, { newStudents: 0, newTeachers: 0 });
      if (r.role === "student") daily.get(dk).newStudents++;
      else if (r.role === "teacher") daily.get(dk).newTeachers++;
    }

    // 5) Build rows with cumulative totals
    const datesAsc = Array.from(daily.keys()).sort(); // chronological
    let cumStudents = 0;
    let cumTeachers = 0;

    const rows = datesAsc.map((dk) => {
      const { newStudents, newTeachers } = daily.get(dk);
      cumStudents += newStudents;
      cumTeachers += newTeachers;
      return {
        date: dk,
        newStudents,
        newTeachers,
        newTotal: newStudents + newTeachers,
        totalStudents: cumStudents,
        totalTeachers: cumTeachers,
        totalUsers: cumStudents + cumTeachers,
      };
    });

    // Totals & today
    const totals = rows.at(-1) || {
      totalStudents: 0,
      totalTeachers: 0,
      totalUsers: 0,
    };
    const todayKey = dateKey(new Date().toISOString());
    const todayRow = rows.find((r) => r.date === todayKey);
    const newToday = todayRow?.newTotal || 0;

    return { rows, totals, newToday };
  }, [events]);
}

// --- Page
export default function Page() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(2);
  const [q, setQ] = useState("");

  // Sort newest first for timeline
  const baseEvents = useMemo(
    () => [...general_data].sort((a, b) => +new Date(b.at) - +new Date(a.at)),
    []
  );

  // Users report (built from all events)
  const { rows: usersRows, totals: usersTotals, newToday } = useUsersReport(baseEvents);

  // Filter by tab + search for the timeline
  const filtered = useMemo(() => {
    return baseEvents.filter((e) => {
      const inTab =
        activeTab === 1 ||
        tabs.find((t) => t.id === activeTab)?.title === eventCategory(e.type) ||
        (activeTab === 3 &&
          ["STUDENT_REGISTERED", "TEACHER_CREATED_COURSE", "TEACHER_UPDATED_LESSON"].includes(
            e.type
          )); // Users
      if (!inTab) return false;

      if (!q.trim()) return true;

      const text = [
        e.type,
        e.actor?.name,
        e.target?.name,
        e.view?.title,
        ...(e.view?.details?.map((d) => `${d.label} ${d.value}`) || []),
      ]
        .join(" ")
        .toLowerCase();
      return text.includes(q.toLowerCase());
    });
  }, [activeTab, q, baseEvents]);

  const goProfile = (evt) => {
    const actor = evt.actor || {};
    if (actor.role === "student") router.push(`/students/${actor.id}`);
    else if (actor.role === "teacher") router.push(`/instructors/${actor.id}`);
  };

  return (
    <div className="min-h-screen">
      <BreadCrumb title={"All Reports"} parent={"Home"} child={"Reports"} />

      {/* Tabs + search */}
      <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={[
                "border rounded-full cursor-pointer py-2 px-4 text-sm transition-all duration-300",
                "border-[var(--primary-color)] text-[var(--primary-color)]",
                activeTab === tab.id &&
                  "bg-gradient-to-br from-teal-400 via-teal-500 to-teal-600 text-white border-transparent shadow",
              ].join(" ")}
            >
              {tab.title}
            </button>
          ))}
        </div>
      </div>

      {/* ===== Users Report (only on Users tab) ===== */}
      {activeTab === 2 && <ReportGeneral />}
      {activeTab === 3 && (
       <ReportUsers usersRows={usersRows} usersTotals={usersTotals} tz={tz}  newToday={newToday}/>
      )}
      {activeTab === 4 && (
       <ReportCourses />
      )}
      {activeTab === 5 && (
       <ReportsAppointements />
      )}
      {activeTab === 6 && <ReportIncomes />}
      {activeTab === 7 && <ReportReservations />}
      {activeTab === 8 && <ReportStudents />}
      {/* ===== Timeline ===== */}
     
    </div>
  );
}
