"use client";

import React, { useState, useMemo } from "react";
import { X, Search, Mail, Phone, Clock, Star, Globe, Play, BookOpen, Loader2 } from "lucide-react";
import { Avatar, Tag, Tooltip } from "antd";
import { useGetStudentTeacher } from "@/utils/Api/Hooks/useTeachesrandStuden";





export default function StudentTeachersModal({ open, onClose, studentId, studentName }) {
  const [searchTerm, setSearchTerm] = useState("");

  const { allTeachersForStudentQuery } = useGetStudentTeacher(null, studentId);
  const teachersResponse = allTeachersForStudentQuery?.data;
  const isLoading = allTeachersForStudentQuery?.isLoading;

  const teachersList = useMemo(() => {
    if (teachersResponse?.status === "success" && Array.isArray(teachersResponse.message)) {
      return teachersResponse.message;
    }
    return [];
  }, [teachersResponse]);

  const filteredTeachers = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return teachersList;
    return teachersList.filter(
      (t) =>
        t.teacher_name?.toLowerCase().includes(query) ||
        t.teacher_email?.toLowerCase().includes(query) ||
        t.specialization?.toLowerCase().includes(query)
    );
  }, [searchTerm, teachersList]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-[24px] border border-slate-100 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden animate-in fade-in zoom-in-95 duration-250">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h3 className="text-xl font-bold text-slate-950">Assigned Instructors</h3>
            <p className="text-xs text-slate-500 mt-1">
              Showing teachers assigned to student: <span className="text-teal-600 font-semibold">{studentName || "N/A"}</span> <span className="text-slate-400 font-normal">(ID: {studentId})</span>
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="size-9 rounded-xl border border-slate-200 grid place-items-center text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-slate-50 bg-white">
          <div className="flex items-center gap-2.5 rounded-2xl bg-slate-50 px-3.5 py-2.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-teal-500 transition-all">
            <Search size={18} className="text-slate-400" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search instructors by name, email, or specialization..."
              className="bg-transparent outline-none text-sm w-full placeholder:text-slate-400 text-slate-800"
            />
          </div>
        </div>

        {/* Teachers List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-slate-50/50 scrollbar-thin">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-2" />
              <p className="text-sm text-slate-500 font-medium animate-pulse">Loading instructors...</p>
            </div>
          ) : filteredTeachers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
              <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
              <h4 className="text-sm font-semibold text-slate-800">No instructors found</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                No matching teachers are assigned to this student.
              </p>
            </div>
          ) : (
            filteredTeachers.map((teacher, idx) => (
              <div
                key={teacher.teacher_id || idx}
                className="group relative overflow-hidden rounded-[20px] bg-white border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* Accent bar */}
                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-gradient-to-b from-teal-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="flex flex-col md:flex-row gap-5">
                  {/* Avatar & Video trigger */}
                  <div className="flex flex-col items-center gap-3 shrink-0">
                    <Avatar
                      src={teacher.teacher_image}
                      size={72}
                      className="rounded-2xl border-2 border-white shadow ring-2 ring-slate-100 object-cover"
                    >
                      {teacher.teacher_name.charAt(0).toUpperCase()}
                    </Avatar>
                    
                    {teacher.video && (
                      <a
                        href={teacher.video}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 hover:text-teal-800 text-[11px] font-bold transition-all border border-teal-100"
                      >
                        <Play size={10} className="fill-teal-700 text-teal-700" />
                        Intro Video
                      </a>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <h4 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors">
                          {teacher.teacher_name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">{teacher.specialization}</p>
                      </div>

                      {/* Hourly rate & Rating */}
                      <div className="flex items-center gap-3 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100 text-xs shrink-0">
                        <span className="text-slate-600">
                          Rate: <span className="font-bold text-slate-800">${teacher.hourly_rate}/hr</span>
                        </span>
                        {parseFloat(teacher.rate) > 0 && (
                          <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                            <Star size={12} className="fill-amber-400 text-amber-400" />
                            <span className="font-bold text-slate-800">{teacher.rate}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                      {teacher.bio}
                    </p>

                    {/* Meta row */}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500 border-t border-slate-100 pt-3">
                      <span className="flex items-center gap-1.5">
                        <Mail size={13.5} className="text-slate-400" />
                        {teacher.teacher_email}
                      </span>
                      {teacher.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone size={13.5} className="text-slate-400" />
                          {teacher.phone}
                        </span>
                      )}
                      {teacher.country && (
                        <span className="flex items-center gap-1.5">
                          <Globe size={13.5} className="text-slate-400" />
                          {teacher.country}
                        </span>
                      )}
                      {teacher.level && (
                        <Tag color="cyan" className="m-0 text-[10px] py-0.5 px-1.5 rounded border-0 uppercase font-bold">
                          {teacher.level}
                        </Tag>
                      )}
                    </div>

                    {/* Slots */}
                    {teacher.teacher_slots && teacher.teacher_slots.length > 0 && (
                      <div className="mt-3.5 bg-slate-50 rounded-xl p-3 border border-slate-100">
                        <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                          <Clock size={12} /> Available Slots
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {teacher.teacher_slots.map((slot) => (
                            <span
                              key={slot.slots_id}
                              className="inline-flex items-center gap-1 text-[11px] bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-700 font-medium"
                            >
                              <span className="text-teal-600 font-bold">{slot.day}</span>: {slot.slots_from.slice(0, 5)} - {slot.slots_to.slice(0, 5)}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-white flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
