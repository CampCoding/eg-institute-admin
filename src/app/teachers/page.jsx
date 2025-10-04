"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { Star, ChevronRight, Edit, Trash } from "lucide-react";

/**
 * If you already have teachers data in "@/utils/data",
 * import it and map to this shape (name, title, summary, tags, level, rating, students, photo).
 * The mock below matches the card design in your screenshot.
 */
const seedTeachers = [
  {
    id: 1,
    name: "Dr. Amira Hassan",
    title: "Modern Standard Arabic",
    summary:
      "Specialist in advanced syntax and media Arabic with 10+ years teaching experience.",
    tags: ["Grammar", "Media Arabic", "Academic Writing"],
    level: "Expert",
    rating: 4.9,
    students: 1200,
    photo:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Omar El-Sayed",
    title: "Egyptian Dialect",
    summary:
      "Focuses on everyday conversation, street phrases, and cultural nuance.",
    tags: ["Conversation", "Culture", "Slang"],
    level: "Expert",
    rating: 4.8,
    students: 950,
    photo:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Nour Fathy",
    title: "Pronunciation & Phonetics",
    summary:
      "Helps learners master vowel length, emphatics, and natural stress patterns.",
    tags: ["Phonetics", "Accent", "Speaking"],
    level: "Expert",
    rating: 4.9,
    students: 800,
    photo:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Prof. Layla Saeed",
    title: "Reading & Vocabulary",
    summary:
      "Builds strong vocabulary foundations with graded readers and context-first learning.",
    tags: ["Vocabulary", "Reading", "Comprehension"],
    level: "Intermediate",
    rating: 4.6,
    students: 670,
    photo:
      "https://images.unsplash.com/photo-1544005314-6e0b0a1e2b1e?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: 5,
    name: "Karim Mostafa",
    title: "Conversation Clubs",
    summary:
      "Weekly conversation circles focusing on fluency, confidence, and natural pacing.",
    tags: ["Fluency", "Conversation", "Clubs"],
    level: "Beginner",
    rating: 4.5,
    students: 540,
    photo:
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=1400&auto=format&fit=crop",
  },
];

export default function TeachersPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return seedTeachers;
    return seedTeachers.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }, [search]);

  const levelColor = (lvl) => {
    if (lvl === "Beginner") return "text-emerald-700";
    if (lvl === "Intermediate") return "text-blue-700";
    return "text-teal-700"; // Expert
  };

  return (
    <div className="min-h-screen">
      <BreadCrumb title="Teachers" parent="Home" child="Teachers" />

      {/* Search */}
      <div className="mt-4">
        <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 ring-1 ring-slate-200">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500">
            <path
              fill="currentColor"
              d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.71.71l.27.28v.79l5 5 1.5-1.5-5-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"
            />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teachers, tags, topics…"
            className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid mt-6 gap-6 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((t) => (
          <article
            key={t.id}
            className="group relative overflow-hidden rounded-[22px] bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
          >
            {/* Soft blobs */}
            <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />
            <div className="pointer-events-none absolute -right-10 bottom-20 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />

            {/* Media */}
            <div className="relative h-56 overflow-hidden">
              <img
                src={t.photo}
                alt={t.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />

              {/* Rating pill */}
              <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 px-2 py-1 text-[12px] font-semibold shadow">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                {t.rating.toFixed(1)}
              </div>

              {/* Middle-right chevron button */}
              <button
                onClick={() => router.push(`/teachers/profile/${t.id}`)}
                className="absolute right-4 top-1/2 -translate-y-1/2 size-9 grid place-items-center rounded-full bg-teal-600 text-white shadow-md hover:bg-teal-700"
                aria-label="Open teacher"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <h3 className="text-xl font-semibold text-slate-900">{t.name}</h3>
              <p className={`mt-1 text-sm font-medium ${levelColor(t.level)}`}>
                {t.title}
              </p>

              <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                {t.summary}
              </p>

              {/* Tags */}
              <div className="mt-3 flex flex-wrap gap-2">
                {t.tags.map((tag, i) => (
                  <span
                    key={i}
                    className="inline-block rounded-full border border-teal-200 bg-teal-50 text-teal-700 px-2.5 py-1 text-[12px]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Meta row */}
              <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                {/* <span className="inline-flex items-center gap-2">
                  <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                  {t.students.toLocaleString()}+ students
                </span> */}
                <span className="text-teal-700 font-medium">{t.level} Level</span>
              </div>

              {/* Actions (added Edit icon button) */}
              <div className="mt-5 flex items-center gap-2">
                <button
                  onClick={() => router.push(`/teachers/profile/${t.id}`)}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 text-white px-5 py-2.5 text-sm font-semibold hover:bg-teal-700"
                >
                  Details <ChevronRight size={16} />
                </button>

                <button
                  onClick={() => router.push(`/teachers/edit/${t.id}`)}
                  className="size-10 rounded-xl border border-slate-200 grid place-items-center hover:bg-slate-50"
                  aria-label="Edit teacher"
                  title="Edit"
                >
                  <Edit size={18} />
                </button>

                <button
                  className="size-10 rounded-xl border border-slate-200 grid place-items-center hover:bg-slate-50"
                  aria-label="Delete teacher"
                  title="Delete"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>

            {/* Focus ring */}
            <span className="absolute pointer-events-none inset-0 ring-0 ring-[var(--primary-color)] rounded-[22px] opacity-0 group-hover:opacity-100 group-hover:ring-4 transition-all duration-300"></span>
          </article>
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16">
          <div className="mx-auto size-14 rounded-full bg-slate-100 grid place-items-center text-slate-500">
            <Star size={18} />
          </div>
          <h4 className="mt-4 text-lg font-semibold text-slate-900">
            No teachers found
          </h4>
          <p className="mt-1 text-slate-600">
            Try a different search keyword or clear the filters.
          </p>
        </div>
      )}
    </div>
  );
}
