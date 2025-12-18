// InstructorProfile.jsx
"use client";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import useGetTeacherById from "../../../../utils/Api/Teachers/GetTeacherById";
import { useDispatch, useSelector } from "react-redux";
import { setTeacher } from "../../../../utils/Store/TeacherSlice";
import { time } from "framer-motion";

export default function InstructorProfile({ instructor }) {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useDispatch();
  const { data: teacher } = useGetTeacherById({ id });
  console.log(teacher);

  const data = instructor || {
    id: teacher?.message?.teacher_id,
    name: teacher?.message?.teacher_name,
    email: teacher?.message?.teacher_email,
    phone: teacher?.message?.phone,
    hourlyRate: teacher?.message?.hourly_rate,
    specialties: teacher?.message.specialization,
    bio: teacher?.message?.bio,
    tags: teacher?.message?.tags,
    level: teacher?.message?.level,
    timezone: teacher?.message?.timezone,
    country: teacher?.message?.country,
    avatar:
      teacher?.message?.teacher_image ||
      "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=1400&auto=format&fit=crop",
    status: "Active",
    role: "Arabic Instructor",

    langs: teacher?.message?.languages || [
      "Arabic (Native)",
      "English (C1)",
      "French (B1)",
    ],
    rating: teacher?.message?.rate,
    satisfaction: 96,
    studentsCount: teacher?.message?.student_count,
    classesCount: teacher?.message?.class_count,
    lessonsTaught: 1420,
    attendance: 98,
    availability: teacher?.message?.teacher_slots || [],
    courses: [
      {
        id: "A101",
        title: "Arabic for Beginners (A1)",
        level: "A1",
        enrolled: 42,
        progress: 78,
        nextLesson: "Unit 5 – Pronouns",
      },
      {
        id: "A202",
        title: "Modern Standard Arabic – Intermediate",
        level: "B1",
        enrolled: 31,
        progress: 52,
        nextLesson: "Reading: News Headlines",
      },
      {
        id: "C110",
        title: "Colloquial Egyptian – Survival",
        level: "A2",
        enrolled: 28,
        progress: 64,
        nextLesson: "Shopping Dialogues",
      },
    ],
    reviews: [
      { name: "Michael", rating: 5, text: "Clear explanations and patient." },
      { name: "Aisha", rating: 5, text: "Great pronunciation drills!" },
      { name: "Leo", rating: 4, text: "Engaging and structured lessons." },
    ],
  };
  console.log(data);

  // Helpers
  const capitalize = (s) =>
    typeof s === "string" && s.length
      ? s.charAt(0).toUpperCase() + s.slice(1)
      : "";

  // ✅ teacher: هو الريسبونس (أو teacher?.message حسب انت بتجيبها ازاي)
  const teacherFromApiToForm = {
    name: data?.name ?? "",

    // زي التاني: prefer teacher_email ثم email
    email: data?.teacher_email || data?.email || "",

    phone: data?.phone ?? "",

    // زي التاني: title = specialization (ولو عندك specialties array خليه fallback)
    title: data?.specialties ?? "",

    // زي التاني: summary = summary أو bio
    summary: data?.summary ?? data?.bio ?? "",

    // زي التاني: photo
    photo: data?.teacher_image ?? data?.avatar ?? DEFAULT_PHOTO,

    country: data?.country ?? "",

    // زي التاني
    TimeZone:
      data?.time_zone && data.time_zone.trim()
        ? data.time_zone
        : "Africa/Cairo",

    // زي التاني: hourly_rate
    hourly_rate: data?.hourly_rate ?? data?.hourlyRate ?? "",

    // زي التاني: level (ولو جاي lower-case حوّله)
    level: data?.level ? capitalize(data.level) : "Expert",

    // زي التاني: tags => array
    tags:
      typeof data?.tags === "string"
        ? data.tags
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : Array.isArray(data?.tags)
        ? data.tags
        : [],

    // زي التاني: Languages (ولو عندك langs fallback)
    Languages: Array.isArray(data?.languages)
      ? data.languages
      : Array.isArray(data?.langs)
      ? data.langs
      : [],

    // ✅ زي التاني بالظبط: teacher_slots (مش availability)
    // وخليه يرجع "HH:mm:ss" زي ما التاني عامل
    teacher_slots: Array.isArray(data?.teacher_slots)
      ? data.teacher_slots.map((s) => ({
          day: s?.day ?? "Monday",
          slots_from: s?.slots_from ?? "",
          slots_to: s?.slots_to ?? "",
        }))
      : Array.isArray(data?.availability)
      ? data.availability.map((s) => ({
          day: s?.day ?? "Monday",
          slots_from: s?.slots_from ?? "",
          slots_to: s?.slots_to ?? "",
        }))
      : [],
  };

  console.log(teacherFromApiToForm);

  const Pill = ({ children, tone = "default" }) => {
    const tones = {
      default: "bg-gray-100 text-gray-700 border border-gray-200",
      success: "bg-[#02AAA0]/10 text-[#047a73] border border-[#02AAA0]/20",
      info: "bg-blue-50 text-blue-700 border border-blue-100",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]}`}
      >
        {children}
      </span>
    );
  };

  const Progress = ({ value }) => (
    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: "#02AAA0",
        }}
      />
    </div>
  );

  return (
    <div className="min-h-screen">
      <div className="flex mb-4 items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
        >
          <ArrowLeft size={16} className="inline -mt-0.5 mr-1" />
          Back
        </button>
      </div>

      <BreadCrumb
        title={`profile ${data?.name}`}
        parent={"Users"}
        child={"User Profile"}
      />

      <div className="mt-5">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <img
              src={data.avatar}
              alt={data.name}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-md"
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  {data.name}
                </h1>
                <Pill tone="success">{data.status}</Pill>
                <Pill>ID: {data.id}</Pill>
              </div>
              <p className="text-gray-500 mt-1">{data.role} •</p>
              <div className="flex flex-wrap justify-start items-center gap-2 mt-3">
                level:<Pill tone="info">{data.level}</Pill>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => router.push(`/teachers/schedule/${data?.id}`)}
                className="px-4 py-2 rounded-xl text-white"
                style={{ backgroundColor: "#02AAA0" }}
              >
                Schedule
              </button>
              <button
                onClick={() => {
                  dispatch(setTeacher(teacherFromApiToForm));
                  router.push(`/teachers/edit/${data?.id}`);
                }}
                className="px-4 py-2 rounded-xl text-white"
                style={{ backgroundColor: "#02AAA0" }}
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-500">Students</div>
              <div className="text-xl font-semibold text-gray-900">
                {data.studentsCount}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-500">Classes</div>
              <div className="text-xl font-semibold text-gray-900">
                {data.classesCount}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-500">Satisfaction</div>
              <div className="text-xl font-semibold text-gray-900">
                {data.satisfaction}%
              </div>
              <div className="mt-2">
                <Progress value={data.satisfaction} />
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-500">Lessons Taught</div>
              <div className="text-xl font-semibold text-gray-900">
                {data.lessonsTaught}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Courses taught */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Courses Taught
                </h2>
                <button
                  onClick={() => router.push(`/courses/add`)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Create new course
                </button>
              </div>
              <div className="divide-y">
                {data.courses.map((c) => (
                  <div
                    key={c.id}
                    className="py-4 grid grid-cols-12 gap-4 items-center"
                  >
                    <div className="col-span-6">
                      <div className="font-medium text-gray-900">{c.title}</div>
                      <div className="text-xs text-gray-500">
                        Level {c.level} • ID: {c.id}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Next: {c.nextLesson}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio & Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                About
              </h2>
              <p className="text-gray-700 leading-relaxed">{data.bio}</p>
            </div>

            {/* Reviews */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Reviews
                </h2>
                <Pill tone="success">Avg {data.rating}★</Pill>
              </div>
              <div className="space-y-4">
                {data.reviews.map((r, i) => (
                  <div key={i} className="p-4 rounded-xl border bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-gray-900">{r.name}</div>
                      <div className="text-sm">{"★".repeat(r.rating)}</div>
                    </div>
                    <p className="text-gray-700 text-sm mt-1">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Email</span>
                  <a
                    className="text-gray-900 hover:underline"
                    href={`mailto:${data.email}`}
                  >
                    {data.email}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Phone</span>
                  <a className="text-gray-900" href={`tel:${data.phone}`}>
                    {data.phone}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Hourly Rate</span>
                  <span className="text-gray-900">${data.hourlyRate}/hr</span>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t">
                <div className="text-xs text-gray-500 mb-2">Languages</div>
                <div className="flex flex-wrap gap-2">
                  {data.langs.map((l) => (
                    <Pill key={l}>{l}</Pill>
                  ))}
                </div>
              </div>
            </div>

            {/* Availability */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Weekly Availability
              </h2>
              <div className="space-y-3">
                {data?.availability?.map((a) => {
                  const slot = `${a.slots_from} - ${a.slots_to}`;

                  return (
                    <div
                      key={a.day}
                      className="flex items-start justify-between"
                    >
                      <span className="text-gray-600 w-16">{a.day}</span>
                      <div className="flex-1 flex flex-wrap gap-2">
                        <Pill>{slot}</Pill>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
