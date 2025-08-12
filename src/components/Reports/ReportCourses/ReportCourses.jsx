"use client";
import React, { useMemo, useState } from "react";
import { Users, Star, BookOpen, Clock, Search } from "lucide-react";

const ACCENT = "#02AAA0";

const DEMO_COURSES = [
  {
    id: "crs_egy_conv",
    title: "Egyptian Arabic: Everyday Conversation",
    level: "A2",
    teacher: "Mariam Fathi",
    enrolled: 128,
    progress: 64,
    rating: 4.7,
    ratingCount: 93,
    duration: "12h",
    image:
      "https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "crs_msa_beg",
    title: "MSA for Beginners (A1)",
    level: "A1",
    teacher: "Omar Nasser",
    enrolled: 210,
    progress: 78,
    rating: 4.5,
    ratingCount: 155,
    duration: "18h",
    videoUrl:
      "https://cdn.coverr.co/videos/coverr-studying-hard-9483/1080p.mp4", // demo
    poster:
      "https://images.unsplash.com/photo-1513258496099-48168024aec0?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "crs_msa_inter",
    title: "MSA Core Grammar & Vocabulary",
    level: "B1",
    teacher: "Sara Al-Masri",
    enrolled: 86,
    progress: 52,
    rating: 4.3,
    ratingCount: 61,
    duration: "22h",
    image:
      "https://images.unsplash.com/photo-1529101091764-c3526daf38fe?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: "crs_egy_shop",
    title: "Colloquial Egyptian: Shopping Dialogues",
    level: "A2",
    teacher: "Youssef Kamal",
    enrolled: 74,
    progress: 33,
    rating: 4.1,
    ratingCount: 24,
    duration: "8h",
    videoUrl:
      "https://cdn.coverr.co/videos/coverr-laptop-at-the-cafe-1532/1080p.mp4", // demo
    poster:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop",
  },
];

function ProgressBar({ value }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${v}%`, backgroundColor: ACCENT }}
        aria-label={`Progress ${v}%`}
      />
    </div>
  );
}

function Rating({ value, count }) {
  const full = Math.floor(value);
  const hasHalf = value - full >= 0.5;
  const stars = Array.from({ length: 5 }).map((_, i) => {
    const filled = i < full || (i === full && hasHalf);
    return (
      <Star
        key={i}
        size={14}
        className="shrink-0"
        style={{ color: filled ? ACCENT : "#cbd5e1", fill: filled ? ACCENT : "none" }}
      />
    );
  });
  return (
    <div className="flex items-center gap-1.5" title={`${value} / 5`}>
      <div className="flex items-center">{stars}</div>
      <span className="text-xs text-slate-600">
        {value.toFixed(1)} ({count})
      </span>
    </div>
  );
}

export default function ReportCourses({ courses = DEMO_COURSES }) {
  const [q, setQ] = useState("");
  const [sortBy, setSortBy] = useState("enrolled_desc");

  const filtered = useMemo(() => {
    const text = q.trim().toLowerCase();
    let list = [...courses].filter((c) => {
      if (!text) return true;
      return (
        c.title.toLowerCase().includes(text) ||
        (c.teacher || "").toLowerCase().includes(text) ||
        (c.level || "").toLowerCase().includes(text)
      );
    });

    switch (sortBy) {
      case "enrolled_desc":
        list.sort((a, b) => b.enrolled - a.enrolled);
        break;
      case "enrolled_asc":
        list.sort((a, b) => a.enrolled - b.enrolled);
        break;
      case "rating_desc":
        list.sort((a, b) => b.rating - a.rating);
        break;
      case "progress_desc":
        list.sort((a, b) => b.progress - a.progress);
        break;
      default:
        break;
    }
    return list;
  }, [courses, q, sortBy]);

  return (
    <div className="min-h-screen">
      {/* Header controls */}
      <div className="mb-4 flex mt-5 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search courses, teacher, level…"
              className="w-full sm:w-72 rounded-xl border border-slate-200 pl-9 pr-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200 px-3 py-2 bg-white outline-none focus:ring-2 ring-[var(--primary-color)]"
          >
            <option value="enrolled_desc">Sort: Most enrolled</option>
            <option value="rating_desc">Sort: Highest rating</option>
            <option value="progress_desc">Sort: Highest progress</option>
            <option value="enrolled_asc">Sort: Least enrolled</option>
          </select>
        </div>
      </div>

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-slate-500">
          No courses found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((c) => (
            <article
              key={c.id}
              className="group relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              {/* Banner: video -> image -> gradient */}
              <div className="relative h-40 sm:h-48 overflow-hidden">
                {c.videoUrl ? (
                  <video
                    src={c.videoUrl}
                    poster={c.poster || c.image}
                    className="h-full w-full object-cover"
                    muted
                    playsInline
                    controls
                    preload="metadata"
                  />
                ) : c.image ? (
                  <img
                    src={c.image}
                    alt={`${c.title} cover`}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-r from-teal-500 via-teal-400 to-emerald-500" />
                )}

                {/* Non-blocking overlays */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="pointer-events-none absolute top-3 left-3 flex gap-2">
                  <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                    {c.level}
                  </span>
                  <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200 inline-flex items-center gap-1">
                    <Clock size={12} /> {c.duration}
                  </span>
                </div>
                <div className="pointer-events-none absolute bottom-3 left-3 flex items-center gap-2 text-white drop-shadow">
                  <BookOpen size={16} />
                  <h3 className="font-semibold line-clamp-1">{c.title}</h3>
                </div>
              </div>

              {/* Body */}
              <div className="p-4">
                {c.teacher && (
                  <p className="text-xs text-slate-600 mb-3">
                    Instructor: <span className="font-medium text-slate-900">{c.teacher}</span>
                  </p>
                )}

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Progress</span>
                    <span className="font-medium text-slate-900">{c.progress}%</span>
                  </div>
                  <ProgressBar value={c.progress} />
                </div>

                {/* Meta row */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Users size={16} />
                    <span className="text-sm">{c.enrolled} students</span>
                  </div>
                  <Rating value={c.rating} count={c.ratingCount} />
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
