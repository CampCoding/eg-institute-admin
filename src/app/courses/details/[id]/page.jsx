"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { courses } from "@/utils/data";
import { Pencil, ArrowLeft } from "lucide-react";

export default function CourseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = useMemo(() => (Array.isArray(params?.id) ? params.id[0] : params?.id), [params]);

  const [rowData, setRowData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Find course
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const course = courses?.find((c) => String(c?.id) === String(id)) || null;
    setRowData(course);
    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <BreadCrumb title="Details Of Course" parent="Courses" child="Detail" />
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="h-[220px] rounded-2xl border border-slate-200 bg-slate-100 animate-pulse" />
          <div className="space-y-3 p-4 rounded-2xl border border-slate-200">
            <div className="h-6 w-2/3 bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-full bg-slate-100 rounded animate-pulse" />
            <div className="h-4 w-5/6 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!rowData) {
    return (
      <div className="min-h-screen">
        <BreadCrumb title="Details Of Course" parent="Courses" child="Detail" />
        <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 p-5">
          <p className="text-rose-700">Course not found.</p>
          <button
            type="button"
            onClick={() => router.push("/courses")}
            className="mt-3 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 hover:bg-slate-50"
          >
            <ArrowLeft size={16} /> Back to courses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <BreadCrumb title="Details Of Course" parent="Courses" child="Detail" />

      <div className="mt-5 grid gap-6 lg:grid-cols-3">
        {/* Left: Media */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200 overflow-hidden bg-white">
          <div className="relative">
            {rowData.video ? (
              <video
                controls
                muted
                className="w-full h-[280px] sm:h-[360px] object-cover bg-black"
                poster={rowData?.poster}
                preload="metadata"
              >
                <source src={rowData?.video} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <img
                src={
                  rowData?.poster ||
                  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1400&auto=format&fit=crop"
                }
                alt={rowData?.title || "Course"}
                className="w-full h-[280px] sm:h-[360px] object-cover"
              />
            )}

            {/* soft gradient overlay like list card */}
            <div className={`absolute inset-0 bg-gradient-to-r ${rowData.color} opacity-20 pointer-events-none`} />

            {/* top-left chips */}
            <div className="absolute top-3 left-3 flex gap-2">
              <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                {rowData?.level}
              </span>
              <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                {rowData?.duration}
              </span>
            </div>
          </div>

          {/* meta footer */}
          <div className="p-4 flex items-center justify-between border-t border-slate-200">
            <div className="text-sm text-slate-600 flex items-center gap-4">
              <span className="inline-flex items-center gap-1">
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path fill="currentColor" d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z" />
                </svg>
                {rowData?.lessons} lessons
              </span>
              <span className="inline-flex items-center gap-1">
                <svg viewBox="0 0 24 24" className="h-4 w-4">
                  <path
                    fill="currentColor"
                    d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5Z"
                  />
                </svg>
                {rowData?.teacher}
              </span>
            </div>

            <div className="font-semibold text-[var(--text-color)]">{rowData?.price}</div>
          </div>
        </div>

        {/* Right: Info */}
        <aside className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-col items-start justify-between gap-3">
          <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => router.push("/courses")}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
              >
                <ArrowLeft size={16} className="inline -mt-0.5 mr-1" />
                Back
              </button>
              <button
                type="button"
                onClick={() => router.push(`/courses/edit/${rowData?.id}`)}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)] text-white px-3 py-2 text-sm hover:opacity-90"
              >
                <Pencil size={16} /> Edit
              </button>
            </div>
            
            <h1 className="text-xl font-semibold leading-tight">{rowData?.title}</h1>
           
          </div>

          <p className="mt-3 text-slate-700 leading-relaxed">{rowData?.description}</p>

          {/* Optional sections/lessons if you have them in your data */}
          {Array.isArray(rowData?.sections) && rowData.sections.length > 0 && (
            <div className="mt-5">
              <h2 className="font-semibold">Course content</h2>
              <div className="mt-3 space-y-3">
                {rowData.sections.map((sec) => (
                  <div key={sec.id} className="rounded-xl border border-slate-200">
                    <div className="px-4 py-3 border-b border-slate-200 font-medium">{sec.title}</div>
                    <ul className="divide-y divide-slate-200">
                      {sec.lessons?.map((l) => (
                        <li key={l.id} className="px-4 py-2 flex items-center justify-between text-sm">
                          <span className="line-clamp-1">{l.title}</span>
                          <span className="text-slate-500">{l.duration}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
