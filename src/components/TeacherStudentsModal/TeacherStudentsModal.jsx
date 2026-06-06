"use client";

import React, { useState } from "react";
import { X, Search, GraduationCap, Mail, Phone, Calendar, Loader2 } from "lucide-react";

// الداتا الاستاتيك للتجربة والتيست
const STATIC_STUDENTS = [
  {
    student_id: "16",
    student_name: "Amira - Lv3",
    student_email: "Amira_husein@mail.ru",
    access_token: "eyJzdHVkZW50X2lkIjoiMTYiLCJpc3N1ZWRfYXQiOiIyMDI2LTAzLTA2IiwiZXhwaXJlc19hdCI6IjIwMjYtMDMtMDgifQ==.555e2854c1d5c9a240efc0ebbb8b8c890e9287664a12e607035bd5e432e91d13",
    country: "",
    course_id: null,
    created_at: "0000-00-00 00:00:00",
    expectation_level: "",
    gender: "male",
    image: "",
    level: null,
    notification_token: "notification_token",
    password: "$2y$10$uZUlduZn4v8CfyuNjj/u.e/.zYKfdAA8oT.O/6AlhmSvk616DkVRy",
    phone: "+79267573734",
    refresh_token: "eyJ1c2VyX2lkIjoiMTYiLCJleHBpcmVzX2F0IjoiMjAyNy0wMy0wNiJ9.5983a3947b2dc26ef3c31910714b2f31db054644c93dd25187ebb74a2d575191",
    status: "0",
    subscription_status: null,
    time_zone: ""
  },
  {
    student_id: "17",
    student_name: "Omar Talaat",
    student_email: "omartalaat1276@gmail.com",
    access_token: "eyJzdHVkZW50X2lkIjoiMTciLCJpc3N1ZWRfYXQiOiIyMDI2LTAzLTExIiwiZXhwaXJlc19hdCI6IjIwMjYtMDMtMTMifQ==.f87d874b2273e2fa235c240a1c37ff1b43553b87e68e20f8ea1c135cbd4ef011",
    country: "",
    course_id: "11",
    created_at: "2026-03-07 03:50:49",
    expectation_level: "",
    gender: "male",
    image: "",
    level: "beginner",
    notification_token: "notification_token",
    password: "$2y$10$MwNl0Y8njpYHJJVg6H2MYedI5VkrlWx8lFnBpqW3QGPgpd6RYX3s6",
    phone: "+201098476530",
    refresh_token: "eyJ1c2VyX2lkIjoiMTciLCJleHBpcmVzX2F0IjoiMjAyNy0wMy0xMSJ9.fcd9effc3c6da9f8412ae53040ac0dd2c94887da287253cf1c5e601dbf80f7c8",
    status: "0",
    subscription_status: "accepted",
    time_zone: ""
  }
];

export default function TeacherStudentsModal({ open, onClose, teacherName, students = [], isLoading = false }) {
  const [search, setSearch] = useState("");

  if (!open) return null;

  const displayStudents = students || [];

  // فلاتر البحث عن الطلاب باسم الطالب أو إيميله
  const filteredStudents = displayStudents.filter(
    (s) =>
      s.student_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.student_email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative w-full max-w-2xl bg-white rounded-[22px] border border-slate-100 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h3 className="text-xl font-bold text-slate-900">Assigned Students</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing students registered under <span className="text-teal-600 font-semibold">{teacherName || "Instructor"}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-xl border border-slate-200 grid place-items-center text-slate-500 hover:bg-slate-50 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-50 bg-white">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 ring-1 ring-slate-200/60 focus-within:ring-2 focus-within:ring-teal-500 transition-all">
            <Search size={18} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.value)}
              placeholder="Search students by name or email..."
              className="bg-transparent outline-none text-sm w-full placeholder:text-slate-400 text-slate-800"
            />
          </div>
        </div>

        {/* Students List Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-2" />
              <p className="text-sm text-slate-500 font-medium animate-pulse">Loading students...</p>
            </div>
          ) : filteredStudents.length > 0 ? (
            filteredStudents.map((student, idx) => (
              <div
                key={student.student_id || idx}
                className="group relative overflow-hidden rounded-2xl bg-white border border-slate-150 p-4 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Visual Accent decoration */}
                <div className="absolute top-0 bottom-0 left-0 w-1 bg-gradient-to-b from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Student Info */}
                  <div className="flex items-start gap-3">
                    <div className="size-10 rounded-xl bg-teal-50 border border-teal-100 grid place-items-center text-teal-600 font-bold text-sm shrink-0">
                      {student.student_name ? student.student_name.charAt(0).toUpperCase() : "S"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-900 group-hover:text-teal-600 transition-colors">
                        {student.student_name}
                      </h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <Mail size={12} className="text-slate-400" />
                        {student.student_email || "No email available"}
                      </p>
                    </div>
                  </div>

                  {/* Additional Meta details */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                    {student.phone && (
                      <span className="flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" />
                        {student.phone}
                      </span>
                    )}
                    {student.created_at && student.created_at !== "0000-00-00 00:00:00" && (
                      <span className="flex items-center gap-1">
                        <Calendar size={12} className="text-slate-400" />
                        {new Date(student.created_at).toLocaleDateString()}
                      </span>
                    )}
                    {student.level && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize text-[10px] font-medium">
                        {student.level}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            /* Empty State Inside Modal */
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
              <GraduationCap className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h4 className="text-sm font-semibold text-slate-800">No students found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                {search ? "No students match your search criteria." : "This instructor doesn't have any students assigned currently."}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}