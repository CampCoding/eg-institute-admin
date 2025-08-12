"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import {
  Loader2,
  Save,
  Plus,
  X,
  Upload,
  ArrowLeft,
  Pencil,
} from "lucide-react";
import { courses, teachers } from "@/utils/data";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const GRADIENTS = [
  "from-indigo-500 via-sky-500 to-emerald-500",
  "from-fuchsia-500 via-pink-500 to-amber-400",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-amber-500 via-orange-500 to-rose-500",
  "from-violet-500 via-purple-500 to-blue-500",
];

export default function page() {
  const router = useRouter();
  const { id } = useParams();
  const [rowData, setRowData] = useState({});

  const [form, setForm] = useState({
    title: "",
    description: "",
    level: LEVELS[0],
    duration: "4h 30m",
    lessons: 12,
    teacher: "Unknown",
    price: "$0",
    video: "",
    poster: "",
    color: GRADIENTS[0],
  });

  const [chapters, setChapters] = useState([
    { title: "Introduction", duration: "05:00" },
  ]);

  const [saving, setSaving] = useState(false);
  const valid = useMemo(() => !!form.title && !!form.description, [form]);

  const onChange = (key, val) => setForm((s) => ({ ...s, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;

    setSaving(true);
    const payload = {
      ...form,
      id: `course-${Date.now()}`,
      sections: [
        {
          id: `sec-${Date.now()}`,
          title: "Course Content",
          lessons: chapters.map((c, i) => ({
            id: `lesson-${i + 1}`,
            title: c.title || `Lesson ${i + 1}`,
            duration: c.duration || "00:00",
            videoUrl: form.video || "",
          })),
        },
      ],
    };

    try {
      // TODO: Replace with your real API endpoint
      // await fetch("/api/courses", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify(payload),
      // });

      // fallback: stash once in localStorage so you can inspect quickly
      if (typeof window !== "undefined") {
        const drafts = JSON.parse(localStorage.getItem("courseDrafts") || "[]");
        localStorage.setItem(
          "courseDrafts",
          JSON.stringify([payload, ...drafts])
        );
      }

      router.push("/courses");
    } catch (err) {
      console.error(err);
      alert("Failed to save course. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (id) {
      setForm(courses?.find((course) => course?.id == id));
    }
  }, [id]);

  return (
    <div className="min-h-screen">
      <div className="flex  !mb-3 items-center gap-2">
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

      <BreadCrumb title="Edit Course" child="Courses" parent="Home" />

      <form onSubmit={handleSubmit} className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Left: form */}
        <div className="xl:col-span-2 space-y-6">
          {/* Basic info */}
          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <h2 className="text-lg font-semibold">Basic information</h2>
            <p className="text-sm text-slate-600 mt-1">
              Title, description, level, and pricing.
            </p>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Title</label>
                <input
                  value={form.title}
                  onChange={(e) => onChange("title", e.target.value)}
                  placeholder="e.g., React & Next.js Complete Guide"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => onChange("description", e.target.value)}
                  rows={4}
                  placeholder="What will students learn?"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Level</label>
                <select
                  value={form.level}
                  onChange={(e) => onChange("level", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)] bg-white"
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Duration</label>
                <input
                  value={form.duration}
                  onChange={(e) => onChange("duration", e.target.value)}
                  placeholder="e.g., 6h 15m"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Lessons</label>
                <input
                  type="number"
                  min={1}
                  value={form.lessons}
                  onChange={(e) => onChange("lessons", Number(e.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Teacher</label>
                <select
                  value={form.teacher}
                  onChange={(e) => onChange("teacher", e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)] bg-white"
                >
                  {teachers?.map((teach) => (
                    <option key={teach?.id} value={teach?.id}>
                      {teach?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium">Price</label>
                <input
                  value={form.price}
                  onChange={(e) => onChange("price", e.target.value)}
                  placeholder="$99"
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                />
              </div>
            </div>
          </div>

          {/* Chapters / lessons */}
          {/* <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">Chapters</h2>
                <p className="text-sm text-slate-600 mt-1">
                  Add lesson titles and durations (optional).
                </p>
              </div>
              <button
                type="button"
                onClick={addChapter}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)] text-white px-3 py-2 text-sm hover:opacity-90"
              >
                <Plus size={16} /> Add
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {chapters.map((c, i) => (
                <div
                  key={i}
                  className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_140px_auto]"
                >
                  <input
                    value={c.title}
                    onChange={(e) => updateChapter(i, "title", e.target.value)}
                    placeholder={`Lesson ${i + 1} title`}
                    className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                  <input
                    value={c.duration}
                    onChange={(e) =>
                      updateChapter(i, "duration", e.target.value)
                    }
                    placeholder="mm:ss"
                    className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                  <button
                    type="button"
                    onClick={() => removeChapter(i)}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
                    aria-label="Remove"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div> */}

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={!valid || saving}
              className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)] text-white px-4 py-2 font-medium hover:opacity-90 disabled:opacity-60"
            >
              {saving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}
              Save course
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Right: live preview */}
        <div>
          <div className="rounded-2xl bg-white border border-slate-200 p-5">
            <h3 className="font-semibold">Live preview</h3>
            <p className="text-sm text-slate-600">
              Matches your courses grid style.
            </p>

            <article className="group relative mt-4 overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
              {/* Soft blobs */}
              <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />
              <div className="pointer-events-none absolute -right-10 bottom-20 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />

              <div className="relative h-44 overflow-hidden">
                {form.video ? (
                  <video
                    src={form.video}
                    poster={form.poster}
                    className="h-full w-full object-cover"
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  />
                ) : (
                  <img
                    src={
                      form.poster ||
                      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1400&auto=format&fit=crop"
                    }
                    alt="Poster"
                    className="h-full w-full object-cover"
                  />
                )}
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${form.color} opacity-25`}
                />
                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                    {form.level}
                  </span>
                  <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                    {form.duration}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h2 className="text-base sm:text-lg font-semibold tracking-tight line-clamp-1">
                  {form.title || "Course title"}
                </h2>
                <p className="mt-1 text-slate-600 text-sm line-clamp-2">
                  {form.description ||
                    "A short course description will appear here."}
                </p>

                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <span
                      className="inline-flex items-center gap-1"
                      title="Lessons"
                    >
                      <svg viewBox="0 0 24 24" className="h-4 w-4">
                        <path
                          fill="currentColor"
                          d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z"
                        />
                      </svg>
                      {form.lessons} lessons
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <svg viewBox="0 0 24 24" className="h-4 w-4">
                        <path
                          fill="currentColor"
                          d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5Z"
                        />
                      </svg>
                      {form.teacher}
                    </span>
                  </div>
                  <span className="font-semibold text-[var(--text-color)]">
                    {form.price}
                  </span>
                </div>
              </div>
            </article>
          </div>
        </div>
      </form>
    </div>
  );
}
