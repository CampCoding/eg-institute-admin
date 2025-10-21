import React from "react";
import HomeCard from "../HomeCard/HomeCard";
import HomeCardHeader from "../HomeCardHeader/HomeCardHeader";
import { BookOpen, PlayCircle } from "lucide-react";

export default function HomeTopCourses({ topCourses, recentActivity }) {
  return (
    <div>
      {/* Courses & Activity Row */}
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Top Courses */}
        <HomeCard className="xl:col-span-2">
          <HomeCardHeader
            title="Top Courses"
            subtitle="By enrollments & progress"
            icon={BookOpen}
          />
          <div className="divide-y divide-slate-100">
            {topCourses.map((c) => (
              <div
                key={c.id}
                className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 px-6 py-4"
              >
                <div>
                  <p className="font-medium text-slate-900">{c.title}</p>
                  <p className="text-xs mt-1 text-slate-500">
                    Dialect: {c.dialect === "MSA" ? "الفصحى" : "العامية"}
                  </p>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto">
                  <div className="min-w-[120px]">
                    {/* <p className="text-xs text-slate-500 mb-1">Progress</p>
                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${c.progress}%` }} />
                    </div> */}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">Students</p>
                    <p className="font-semibold text-slate-900">
                      {c.students.toLocaleString()}
                    </p>
                  </div>
                  {/* <button className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50">View</button> */}
                </div>
              </div>
            ))}
          </div>
        </HomeCard>

        {/* Recent Activity */}
        <HomeCard>
          <HomeCardHeader
            title="Recent Activity"
            subtitle="Live feed"
            icon={PlayCircle}
          />
          <div className="px-4 pb-4">
            <ul className="space-y-3">
              {recentActivity.map((a) => (
                <li key={a.id} className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  <div className="text-sm">
                    <p>
                      <span className="font-medium text-slate-900">
                        {a.user}
                      </span>{" "}
                      {a.action}{" "}
                      <span className="text-slate-600">{a.meta}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {a.time} ago
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </HomeCard>
      </div>
    </div>
  );
}
