import React, { useMemo, useState } from "react";
import {
  UserPlus,
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  TrendingDown,
  Download,
} from "lucide-react";

const ACCENT = "#02AAA0";

export default function ReportUsers({ usersRows, usersTotals, newToday, tz }) {
  const rowsAsc = useMemo(
    () => [...usersRows].sort((a, b) => a.date.localeCompare(b.date)),
    [usersRows]
  );

  // Today vs yesterday change
  const todayKey = new Date().toLocaleDateString("en-CA", { timeZone: tz });
  const todayRow = rowsAsc.find((r) => r.date === todayKey);
  const prevRow = rowsAsc.filter((r) => r.date < todayKey).slice(-1)[0];
  const prevNew = prevRow?.newTotal ?? 0;
  const changeAbs = (todayRow?.newTotal ?? newToday ?? 0) - prevNew;
  const changePct =
    prevNew > 0 ? Math.round((changeAbs / prevNew) * 100) : (todayRow?.newTotal ? 100 : 0);

  // 14-day spark (simple bars)
  const sparkSlice = rowsAsc.slice(-14);
  const sparkVals = sparkSlice.map((r) => r.newTotal);
  const sparkMax = Math.max(1, ...sparkVals);

  const fmtDay = (d) =>
    new Date(d + "T00:00:00").toLocaleDateString("ar-EG", {
      timeZone: tz,
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

  const exportCSV = () => {
    const header = [
      "Date",
      "New users",
      "New students",
      "New teachers",
      "Total students",
      "Total teachers",
      "Total users",
    ];
    const lines = rowsAsc
      .map((r) =>
        [
          r.date,
          r.newTotal,
          r.newStudents,
          r.newTeachers,
          r.totalStudents,
          r.totalTeachers,
          r.totalUsers,
        ].join(",")
      )
      .join("\n");
    const csv = header.join(",") + "\n" + lines;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `users-report-${todayKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mt-6 space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* New today */}
        <div className="rounded-2xl border overflow-hidden relative border-slate-200 bg-white p-4">
        <div className="absolute w-12 h-12 cursor-none bg-teal-500 rounded-full -right-5 -bottom-5"></div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">New users today</div>
            <UserPlus size={18} style={{ color: ACCENT }} />
          </div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">{newToday}</div>

          <div className="mt-2 flex items-center gap-2 text-xs">
            {changeAbs >= 0 ? (
              <span className="inline-flex items-center gap-1 text-emerald-600">
                <TrendingUp size={14} />
                +{changeAbs} ({changePct}%)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-rose-600">
                <TrendingDown size={14} />
                {changeAbs} ({changePct}%)
              </span>
            )}
            <span className="text-slate-400">vs. yesterday</span>
          </div>

          {/* sparkline */}
          <div className="mt-3 flex items-end gap-1 h-10">
            {sparkSlice.map((r) => (
              <div
                key={r.date}
                title={`${fmtDay(r.date)} • ${r.newTotal} new`}
                className="w-2 rounded-sm"
                style={{
                  height: `${(r.newTotal / sparkMax) * 100}%`,
                  background: ACCENT,
                  opacity: r.date === todayKey ? 1 : 0.5,
                }}
              />
            ))}
          </div>
        </div>

        {/* Total registrations */}
        <div className="rounded-2xl border overflow-hidden relative border-slate-200 bg-white p-4">
            <div className="absolute w-12 h-12  bg-amber-500 rounded-full -right-5 -bottom-5"></div>
          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">Total Registration</div>
            <Users size={18} style={{ color: ACCENT }} />
          </div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">
            {usersTotals.totalUsers || 0}
          </div>
          <div className="text-xs text-slate-500 mt-2">Students + Teachers (cumulative)</div>
        </div>

        {/* Total students */}
        <div className="rounded-2xl relative overflow-hidden border border-slate-200 bg-white p-4">
        <div className="absolute w-12 h-12 cursor-none bg-blue-500 rounded-full -right-5 -bottom-5"></div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">Total students</div>
            <GraduationCap size={18} style={{ color: ACCENT }} />
          </div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">
            {usersTotals.totalStudents || 0}
          </div>
          <div className="text-xs text-slate-500 mt-2">Cumulative to date</div>
        </div>

        {/* Total teachers */}
        <div className="rounded-2xl border border-slate-200 relative overflow-hidden bg-white p-4">
        <div className="absolute w-12 h-12 cursor-none bg-fuchsia-500 rounded-full -right-5 -bottom-5"></div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-500">Total teachers</div>
            <BookOpen size={18} style={{ color: ACCENT }} />
          </div>
          <div className="text-2xl font-semibold text-slate-900 mt-1">
            {usersTotals.totalTeachers || 0}
          </div>
          <div className="text-xs text-slate-500 mt-2">Cumulative to date</div>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Users Report (by date)</h3>
            <p className="text-xs text-slate-500">
              Counts are based on registration events; teacher counts may be inferred from first
              activity if no teacher registration exists.
            </p>
          </div>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            <Download size={16} /> Export CSV
          </button>
        </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-white/95 backdrop-blur z-10">
              <tr className="text-left text-slate-500">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">New users</th>
                <th className="px-4 py-3">New students</th>
                <th className="px-4 py-3">New teachers</th>
                <th className="px-4 py-3">Total students</th>
                <th className="px-4 py-3">Total teachers</th>
                <th className="px-4 py-3">Total users</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {[...rowsAsc].reverse().map((r) => (
                <tr key={r.date} className="odd:bg-slate-50/40 hover:bg-slate-50 transition">
                  <td className="px-4 py-3 font-medium text-slate-900">{fmtDay(r.date)}</td>
                  <td className="px-4 py-3">{r.newTotal}</td>
                  <td className="px-4 py-3">{r.newStudents}</td>
                  <td className="px-4 py-3">{r.newTeachers}</td>
                  <td className="px-4 py-3">{r.totalStudents}</td>
                  <td className="px-4 py-3">{r.totalTeachers}</td>
                  <td className="px-4 py-3 font-semibold">{r.totalUsers}</td>
                </tr>
              ))}
              {rowsAsc.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    No data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
