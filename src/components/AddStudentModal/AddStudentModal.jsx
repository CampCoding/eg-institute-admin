"use client";

import React, { useState, useMemo } from "react";
import { Modal, Input, Checkbox, Avatar, Tag } from "antd";
import { Search, UserPlus, Mail, Phone, Check, Loader2 } from "lucide-react";
import { useGetStudentTeacher } from "@/utils/Api/Hooks/useTeachesrandStuden";

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
    student_email: "Amira_husein@mail.ru",
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
    student_email: "omartalaat1276@gmail.com",
    subscription_status: "accepted",
    time_zone: ""
  }
];

export default function AddStudentModal({ open, onClose, onAdd }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  const { allstudentsQuery  } = useGetStudentTeacher();

  // Get dynamic student list from the query
  const studentsList = useMemo(() => {
    if (allstudentsQuery?.data?.status === "success" && Array.isArray(allstudentsQuery.data.message)) {
      return allstudentsQuery.data.message;
    }
    return [];
  }, [allstudentsQuery?.data]);

  const isLoading = allstudentsQuery?.isLoading;

  // Filter students based on search term
  const filteredStudents = useMemo(() => {
    const query = searchTerm.toLowerCase().trim();
    if (!query) return studentsList;
    return studentsList.filter(
      (student) =>
        student.student_name?.toLowerCase().includes(query) ||
        student.student_email?.toLowerCase().includes(query) ||
        student.phone?.includes(query)
    );
  }, [searchTerm, studentsList]);

  // Handle single selection check/uncheck
  const toggleSelectStudent = (studentId) => {
    setSelectedIds((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  // Select/Deselect all filtered students
  const handleSelectAll = (checked) => {
    if (checked) {
      const allFilteredIds = filteredStudents.map((s) => s.student_id);
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allFilteredIds])));
    } else {
      const filteredIds = filteredStudents.map((s) => s.student_id);
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.includes(id)));
    }
  };

  // Check if all filtered students are selected
  const isAllFilteredSelected = useMemo(() => {
    if (filteredStudents.length === 0) return false;
    return filteredStudents.every((s) => selectedIds.includes(s.student_id));
  }, [filteredStudents, selectedIds]);

  const handleConfirmAdd = () => {
    const selectedStudents = studentsList.filter((s) =>
      selectedIds.includes(s.student_id)
    );
    onAdd(selectedStudents);
    // Reset state on success
    setSelectedIds([]);
    setSearchTerm("");
  };

  const handleCancel = () => {
    setSelectedIds([]);
    setSearchTerm("");
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={550}
      title={
        <div className="flex items-center gap-3 border-b border-gray-100 pb-3 mb-2">
          <div className="p-2.5 bg-teal-50 rounded-2xl text-teal-600">
            <UserPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">Add New Students</h3>
            <p className="text-xs text-gray-500 font-normal mt-0.5">
              Select one or multiple students from your database to assign
            </p>
          </div>
        </div>
      }
      className="add-student-modal"
    >
      {/* Search Input */}
      <div className="my-4">
        <Input
          prefix={<Search className="w-4 h-4 text-slate-400 mr-1.5" />}
          placeholder="Search by student name, email, or phone..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          size="large"
          className="rounded-2xl border-slate-200 hover:border-teal-400 focus:border-teal-500 focus:shadow-sm transition-all text-sm"
        />
      </div>

      {/* Select All Row */}
      {filteredStudents.length > 0 && (
        <div className="flex items-center justify-between px-3 py-2 bg-slate-50 rounded-xl mb-3 text-xs text-slate-600">
          <label className="flex items-center gap-2 cursor-pointer font-medium">
            <Checkbox
              checked={isAllFilteredSelected}
              onChange={(e) => handleSelectAll(e.target.checked)}
            />
            {isAllFilteredSelected ? "Deselect all shown" : "Select all shown"}
          </label>
          <span>
            {selectedIds.length} of {studentsList.length} selected
          </span>
        </div>
      )}

      {/* Student List */}
      <div className="max-h-[350px] overflow-y-auto pr-1 space-y-2.5 scrollbar-thin">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-7 h-7 animate-spin text-teal-600 mb-2" />
            <p className="text-xs text-slate-500 font-medium animate-pulse">Loading database students...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <p className="text-sm font-semibold text-slate-600">No students found</p>
            <p className="text-xs text-slate-400 mt-1">Try another name or search query.</p>
          </div>
        ) : (
          filteredStudents.map((student) => {
            const isChecked = selectedIds.includes(student.student_id);
            return (
              <div
                key={student.student_id}
                onClick={() => toggleSelectStudent(student.student_id)}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  isChecked
                    ? "bg-teal-50/60 border-teal-300 shadow-sm"
                    : "bg-white border-slate-100 hover:border-slate-300 hover:bg-slate-50/30"
                }`}
              >
                <div onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isChecked}
                    onChange={() => toggleSelectStudent(student.student_id)}
                  />
                </div>

                <Avatar
                  src={student.image}
                  className="bg-teal-100 text-teal-700 font-bold flex-shrink-0"
                  size={42}
                >
                  {student.student_name.charAt(0).toUpperCase()}
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-slate-800 text-sm truncate">
                      {student.student_name}
                    </h4>
                    {student.level && (
                      <Tag color="cyan" className="m-0 text-[10px] py-0.5 px-1.5 rounded-md border-0 uppercase font-bold">
                        {student.level}
                      </Tag>
                    )}
                    {student.subscription_status && (
                      <Tag color="success" className="m-0 text-[10px] py-0.5 px-1.5 rounded-md border-0 uppercase font-bold">
                        {student.subscription_status}
                      </Tag>
                    )}
                  </div>

                  <div className="flex flex-col gap-0.5 mt-1 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      {student.student_email}
                    </span>
                    {student.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        {student.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Controls */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-4 mt-4 gap-3">
        <button
          onClick={handleCancel}
          type="button"
          className="px-5 py-2.5 text-sm font-semibold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 hover:text-slate-700 transition-all"
        >
          Cancel
        </button>

        <button
          onClick={handleConfirmAdd}
          disabled={selectedIds.length === 0}
          type="button"
          className={`inline-flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-xl text-white transition-all shadow-sm ${
            selectedIds.length === 0
              ? "bg-slate-300 cursor-not-allowed opacity-80"
              : "bg-teal-600 hover:bg-teal-700 hover:shadow-md active:scale-95"
          }`}
        >
          <Check className="w-4 h-4" />
          Add Selected ({selectedIds.length})
        </button>
      </div>
    </Modal>
  );
}
