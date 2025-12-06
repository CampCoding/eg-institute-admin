"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { courses as seedCourses } from "@/utils/data";
import { Pencil, ArrowLeft } from "lucide-react";

function mergeWithDrafts() {
  try {
    const drafts = JSON.parse(localStorage.getItem("courseDrafts") || "[]");
    const map = new Map(seedCourses.map((c) => [String(c.id), c]));
    drafts.forEach((d) => map.set(String(d.id), d));
    return Array.from(map.values());
  } catch {
    return seedCourses;
  }
}

const defaultOverview = {
  whatYouWillLearn: [
    "Read and write Arabic script fluently",
    "Understand Egyptian movies and TV shows",
    "Master Egyptian expressions and idioms",
    "Engage in everyday Egyptian conversations",
    "Navigate Egyptian markets and restaurants",
    "Build confidence in real-life situations",
  ],
  features: [
    { title: "Interactive Dialogues", subtitle: "Real-life conversations" },
    { title: "Audio Lessons", subtitle: "Native pronunciation" },
    { title: "Writing Practice", subtitle: "Script mastery" },
  ],
};

const defaultFreeTrials = [
  {
    id: "ft1",
    title: "Egyptian Arabic Basics - Free Trial",
    questions: 20,
    duration: "25 min",
    type: "MCQ",
    isFree: true,
  },
  {
    id: "ft2",
    title: "Daily Conversations - Sample",
    questions: 15,
    duration: "20 min",
    type: "MCQ",
    isFree: true,
  },
];

const defaultInstructor = {
  name: "Ahmed Hassan",
  role: "Native Egyptian Arabic Teacher & Cultural Expert",
  bio: `Ahmed Hassan is a certified Arabic language instructor with over 10 years of
experience teaching Egyptian Arabic to international students. Born and raised in Cairo,
he brings authentic cultural insights and practical language skills to help students
communicate naturally and confidently in Egyptian Arabic.`,
  avatarBg: "#0ea5a6",
};

const defaultReviews = [
  {
    id: "r1",
    title: "Best Egyptian Arabic course!",
    text:
      '“This course transformed my ability to communicate in Egyptian Arabic. The lessons are practical, engaging, and culturally rich. I can now watch Egyptian movies without subtitles!”',
    author: "Sarah Thompson, USA",
    stars: 5,
  },
  {
    id: "r2",
    title: "Highly recommended!",
    text:
      "“Ahmed is an excellent teacher who makes learning fun and easy. The course structure is perfect for beginners and the cultural insights are invaluable.”",
    author: "Michael Chen, Canada",
    stars: 5,
  },
];

export default function CourseDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const id = useMemo(
    () => (Array.isArray(params?.id) ? params.id[0] : params?.id),
    [params]
  );

  const [rowData, setRowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview"); // overview | trials | content | instructor | reviews

  // Find course (seed + drafts)
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    const all = mergeWithDrafts();
    const course = all?.find((c) => String(c?.id) === String(id)) || null;
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

  const overview = rowData?.overview || defaultOverview;
  const freeTrials = rowData?.freeTrials?.length ? rowData.freeTrials : defaultFreeTrials;
  const instructor = rowData?.instructor || defaultInstructor;
  const reviews = rowData?.reviews?.length ? rowData.reviews : defaultReviews;

  return (
    <div className="min-h-screen">
      <BreadCrumb title="Details Of Course" parent="Courses" child="Detail" />

      {/* Header strip like screenshot */}
      <div className="mt-5  gap-6 ">
        {/* Left summary card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
          <div className="flex gap-4">
            <img
              src={
                rowData?.poster ||
                "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop"
              }
              alt={rowData?.title}
              className="w-28 h-20 sm:w-36 sm:h-24 rounded-xl object-cover"
            />
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
                {rowData?.title}
              </h1>
              <p className="text-sm text-slate-600 mt-1">
                {rowData?.description}
              </p>

              <ul className="mt-3 flex flex-wrap gap-4 text-[13px] text-slate-700">
                <li className="inline-flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4">
                    <path fill="currentColor" d="M7 11h10v2H7zM7 6h10v2H7zm0 10h10v2H7z" />
                  </svg>
                  12 weeks
                </li>
                <li className="inline-flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4">
                    <path fill="currentColor" d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5z" />
                  </svg>
                  2847 students
                </li>
                <li className="inline-flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 text-amber-400">
                    <path
                      fill="currentColor"
                      d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                    />
                  </svg>
                  4.9 (312 reviews)
                </li>
                <li className="inline-flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4">
                    <path fill="currentColor" d="M3 4h18v2H3zm0 6h18v2H3zm0 6h12v2H3z" />
                  </svg>
                  36 practice exams
                </li>
                <li className="inline-flex items-center gap-2">
                  <svg viewBox="0 0 24 24" className="h-4 w-4">
                    <path fill="currentColor" d="M19 3H5a2 2 0 0 0-2 2v14l4-4h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" />
                  </svg>
                  24 flashcard sets
                </li>
              </ul>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-5">
            <div className="flex border-b border-slate-200 text-sm">
              {[
                { key: "overview", label: "Overview" },
                { key: "trials", label: "Free Trials" },
                { key: "content", label: "Course Content" },
                { key: "instructor", label: "Instructor" },
                { key: "reviews", label: "Reviews" },
              ].map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 -mb-px border-b-2 ${
                    tab === t.key
                      ? "border-[var(--primary-color)] text-slate-900 font-medium"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab panels */}
            <div className="pt-5">
              {/* OVERVIEW */}
              {tab === "overview" && (
                <div>
                  <h3 className="font-semibold">Course Overview</h3>
                  <p className="mt-2 text-slate-700 leading-relaxed">
                    {rowData?.longDescription ||
                      "This comprehensive Egyptian Arabic course is designed for learners who want to communicate effectively in everyday Egyptian life. Through interactive lessons, real-life dialogues, and cultural insights, you'll learn to speak, understand, and interact confidently in Egyptian Arabic. Our course covers everything from basic greetings to complex conversations, including colloquial expressions and cultural nuances that textbooks often miss."}
                  </p>

                  <h4 className="mt-6 font-semibold">What you'll learn:</h4>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2">
                    {overview.whatYouWillLearn.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-slate-700">
                        <span className="mt-1 inline-flex size-4 rounded-full bg-emerald-100 text-emerald-700 items-center justify-center">
                          <svg viewBox="0 0 24 24" className="h-3 w-3">
                            <path
                              fill="currentColor"
                              d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                            />
                          </svg>
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <h4 className="mt-6 font-semibold">Course Features:</h4>
                  <div className="mt-3 grid gap-3 sm:grid-cols-3">
                    {overview.features.map((f, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-slate-200 p-3 flex items-start gap-3"
                      >
                        <div className="size-8 rounded-lg bg-teal-50 text-teal-700 grid place-items-center">
                          <svg viewBox="0 0 24 24" className="h-4 w-4">
                            <path
                              fill="currentColor"
                              d="M19 3H5a2 2 0 0 0-2 2v14l4-4h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"
                            />
                          </svg>
                        </div>
                        <div>
                          <div className="font-medium">{f.title}</div>
                          <div className="text-xs text-slate-500">{f.subtitle}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* FREE TRIALS */}
              {tab === "trials" && (
                <div>
                  <h3 className="font-semibold">Free Trial Lessons</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Try these free lessons to experience our teaching methodology and course
                    quality.
                  </p>

                  <div className="mt-4 space-y-3">
                    {freeTrials.map((t) => (
                      <div
                        key={t.id}
                        className="rounded-xl border border-emerald-200 bg-emerald-50 p-4"
                      >
                        <div className="font-medium">{t.title}</div>
                        <div className="mt-2 flex flex-wrap gap-3 text-xs text-slate-700">
                          <span className="inline-flex items-center gap-1">
                            <svg viewBox="0 0 24 24" className="h-4 w-4">
                              <path
                                fill="currentColor"
                                d="M3 5h18v2H3zm0 6h18v2H3zm0 6h18v2H3z"
                              />
                            </svg>
                            {t.questions} questions
                          </span>
                          <span>{t.duration}</span>
                          <span className="rounded-full border px-2 py-0.5"> {t.type} </span>
                          {t.isFree && (
                            <span className="rounded-full border border-emerald-300 bg-emerald-100 text-emerald-700 px-2 py-0.5">
                              Free
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* COURSE CONTENT */}
              {tab === "content" && (
                <div>
                  <h3 className="font-semibold">Course Content</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Explore our comprehensive curriculum designed to take you from beginner to
                    fluent speaker.
                  </p>

                  <div className="mt-4 space-y-3">
                    {(rowData.units || []).map((u) => (
                      <button
                        key={u.unitId}
                        type="button"
                        className="w-full rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-left p-4 flex items-center justify-between"
                      >
                        <div>
                          <div className="font-medium">
                            Unit {u.unitNumber}: {u.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            Foundation topics & practical application
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <span>{u.lessonsCount ?? (u.videos?.length || 0)} topics</span>
                          <svg viewBox="0 0 24 24" className="h-4 w-4">
                            <path fill="currentColor" d="M9 6l6 6-6 6" />
                          </svg>
                        </div>
                      </button>
                    ))}
                    {!rowData.units?.length && (
                      <div className="rounded-xl border border-slate-200 p-4 text-slate-600">
                        No units added yet.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* INSTRUCTOR */}
              {tab === "instructor" && (
                <div>
                  <h3 className="font-semibold">About the Instructor</h3>

                  <div className="mt-3 rounded-2xl border border-slate-200 p-4 flex gap-4 items-start">
                    <div
                      className="size-12 rounded-full grid place-items-center text-white font-semibold"
                      style={{ background: instructor.avatarBg || "#0ea5a6" }}
                    >
                      {(instructor.name || "A H")
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold">{instructor.name || rowData.teacher}</div>
                      <div className="text-sm text-slate-600">{instructor.role}</div>
                      <p className="mt-2 text-slate-700 leading-relaxed">{instructor.bio}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* REVIEWS */}
              {tab === "reviews" && (
                <div>
                  <h3 className="font-semibold">Student Reviews</h3>
                  <div className="mt-3 space-y-3">
                    {reviews.map((r) => (
                      <div
                        key={r.id}
                        className="rounded-2xl border border-slate-200 bg-white p-4"
                      >
                        <div className="flex items-center gap-2 text-amber-500">
                          {Array.from({ length: r.stars || 5 }).map((_, i) => (
                            <svg key={i} viewBox="0 0 24 24" className="h-4 w-4">
                              <path
                                fill="currentColor"
                                d="M12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"
                              />
                            </svg>
                          ))}
                          <span className="text-slate-700 font-medium">{r.title}</span>
                        </div>
                        <p className="mt-2 text-slate-700">{r.text}</p>
                        <div className="mt-1 text-xs text-slate-500">- {r.author}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right price sidebar */}
        {/* <aside className="rounded-2xl border border-slate-200 bg-white p-5 h-fit">
          <div className="text-center">
            <div className="text-3xl font-bold">${(rowData.price || "$149").replace("$","")}</div>
            <div className="text-slate-500 line-through mt-1">$199</div>
            <div className="text-emerald-600 text-xs mt-1">25% off · Limited Time</div>

            <button
              type="button"
              className="mt-4 w-full rounded-lg bg-teal-600 text-white py-2 font-medium hover:bg-teal-700"
            >
              Continue Learning
            </button>
          </div>

          <div className="mt-5 text-sm">
            <div className="font-semibold mb-2">This course includes:</div>
            <ul className="space-y-2 text-slate-700">
              {[
                "36 Practice Tests",
                "24 Flashcard Sets",
                "Lifetime Access",
                "Certificate of Completion",
                "Mobile & Desktop Access",
                "Downloadable Resources",
                "24/7 Support",
              ].map((li) => (
                <li key={li} className="flex items-start gap-2">
                  <span className="mt-0.5 inline-flex size-4 rounded-full bg-emerald-100 text-emerald-700 items-center justify-center">
                    <svg viewBox="0 0 24 24" className="h-3 w-3">
                      <path
                        fill="currentColor"
                        d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                      />
                    </svg>
                  </span>
                  {li}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <svg viewBox="0 0 24 24" className="h-4 w-4">
                <path
                  fill="currentColor"
                  d="M12 2a9 9 0 1 0 9 9 9.01 9.01 0 0 0-9-9Zm1 14h-2v-2h2Zm0-4h-2V7h2Z"
                />
              </svg>
              30-day money-back guarantee
            </div>
          </div>
        </aside> */}
      </div>
    </div>
  );
}
