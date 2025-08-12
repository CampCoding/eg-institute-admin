// StudentProfile.jsx
"use client";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import React from "react";

export default function StudentProfile({ student }) {
    const router = useRouter();
  // Demo data (used if no prop passed)
  const data =
    student ||
    {
      id: 2,
      name: "Michael Chen",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=512&auto=format&fit=crop",
      email: "michael.chen@email.com",
      phone: "+1 234 567 8902",
      guardianName: "Lily Chen",
      guardianPhone: "+1 234 567 0000",
      status: "Active",
      className: "11B",
      grade: "Grade 11B",
      arabicLevel: "Intermediate",
      lastLesson: "Unit 6 – Past Tense Verbs",
      notes: "Strong pronunciation; needs more writing drills.",
      gpa: 3.9,
      attendance: 92,
      subjects: [
        { name: "Arabic Grammar", teacher: "Mr. Ahmad", score: 91 },
        { name: "Conversation", teacher: "Ms. Sarah", score: 88 },
        { name: "Reading & Comprehension", teacher: "Mr. Ali", score: 93 },
      ],
      tags: ["Committed", "Fast learner", "Great attitude"],
    };

  const Pill = ({ children, tone = "default" }) => {
    const tones = {
      default:
        "bg-gray-100 text-gray-700 border border-gray-200",
      success:
        "bg-[#02AAA0]/10 text-[#047a73] border border-[#02AAA0]/20",
      info: "bg-blue-50 text-blue-700 border border-blue-100",
    };
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]}`}>
        {children}
      </span>
    );
  };

  const Progress = ({ value }) => (
    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%`, backgroundColor: "#02AAA0" }}
      />
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
    
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

        <BreadCrumb title={`profile ${data?.name}`} parent={"Users"} child={"User Profile"}/>
      <div className="mt-5">
       

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
              <p className="text-gray-500 mt-1">{data.grade} • {data.className}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {data.tags.map((t) => (
                  <Pill key={t} tone="info">{t}</Pill>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
            
              <button
                onClick={() => router.push(`/students/edit/${data?.id}`)}
                className="px-4 py-2 rounded-xl text-white"
                style={{ backgroundColor: "#02AAA0" }}
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-500">GPA</div>
              <div className="text-xl font-semibold text-gray-900">{data.gpa}</div>
              <div className="mt-2"><Progress value={(data.gpa / 4) * 100} /></div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-500">Attendance</div>
              <div className="text-xl font-semibold text-gray-900">{data.attendance}%</div>
              <div className="mt-2"><Progress value={data.attendance} /></div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="text-xs text-gray-500">Arabic Level</div>
              <div className="text-xl font-semibold text-gray-900">{data.arabicLevel}</div>
              <div className="text-xs text-gray-500 mt-1">Last lesson: {data.lastLesson}</div>
            </div>
          </div>
        </div>

        {/* Content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Subjects & Scores */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Subjects & Scores</h2>
                <button className="text-sm text-gray-600 hover:text-gray-900">View transcripts</button>
              </div>
              <div className="divide-y">
                {data.subjects.map((s, idx) => (
                  <div key={idx} className="py-4 flex items-center gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{s.name}</div>
                      <div className="text-xs text-gray-500">Teacher: {s.teacher}</div>
                    </div>
                    <div className="w-40">
                      <Progress value={s.score} />
                    </div>
                    <div className="w-12 text-right font-semibold text-gray-900">
                      {s.score}%
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
          
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Email</span>
                  <a className="text-gray-900 hover:underline" href={`mailto:${data.email}`}>
                    {data.email}
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Phone</span>
                  <a className="text-gray-900" href={`tel:${data.phone}`}>
                    {data.phone}
                  </a>
                </div>
              </div>
              <div className="mt-5 pt-5 border-t">
                <div className="text-xs text-gray-500 mb-2">Guardian</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-900">{data.guardianName}</span>
                  <a className="text-gray-900" href={`tel:${data.guardianPhone}`}>
                    {data.guardianPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-end mt-6">
          <button className="px-4 py-2 rounded-xl border text-gray-700 hover:bg-gray-50">
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-xl text-white"
            style={{ backgroundColor: "#02AAA0" }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
