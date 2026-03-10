// components/AssignTeachersModal.jsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Modal, Avatar, Tag, Empty, Input } from "antd";
import {
  Users,
  Search,
  Check,
  UserPlus,
  UserMinus,
  Loader2,
  X,
} from "lucide-react";
import useGetAllTeachers from "@/utils/Api/Teachers/GetAllTeachers";
import axios from "axios";
import { BASE_URL } from "@/utils/base_url";
import toast from "react-hot-toast";

export default function AssignTeachersModal({ open, onClose, course }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedTeachers, setAssignedTeachers] = useState([]);
  const [assignLoading, setAssignLoading] = useState(null);
  const [activeTab, setActiveTab] = useState("available");

  const { data: teachersResponse, isLoading } = useGetAllTeachers();

  const allTeachers = useMemo(() => {
    if (teachersResponse?.status === "success") {
      return teachersResponse.message || [];
    }
    return [];
  }, [teachersResponse]);

  useEffect(() => {
    if (open && course) {
      fetchAssignedTeachers();
    }
  }, [open, course]);

  const fetchAssignedTeachers = async () => {
    const token = localStorage.getItem("AccessToken");
    try {
      const response = await axios.post(
        `${BASE_URL}/courses/select_course_teachers.php`,
        { course_id: course.id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response?.data?.status === "success") {
        setAssignedTeachers(response.data.message || []);
      }
    } catch (error) {
      setAssignedTeachers([]);
    }
  };

  const handleAssign = async (teacher) => {
    const token = localStorage.getItem("AccessToken");
    setAssignLoading(teacher.teacher_id);
    try {
      const response = await axios.post(
        `${BASE_URL}/teachers/add_teacher_to_course.php`,
        { course_id: course.id, teacher_id: teacher.teacher_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response?.data?.status === "success") {
        toast.success(`${teacher.teacher_name} assigned!`);
        setAssignedTeachers((prev) => [...prev, teacher]);
      } else {
        toast.error(response?.data?.message || "Failed");
      }
    } catch (error) {
      toast.error("Failed to assign teacher");
    } finally {
      setAssignLoading(null);
    }
  };

  const handleRemove = async (teacher) => {
    const token = localStorage.getItem("AccessToken");
    setAssignLoading(teacher.teacher_id);
    try {
      const response = await axios.post(
        `${BASE_URL}/teachers/add_teacher_to_course.php`,
        { course_id: course.id, teacher_id: teacher.teacher_id },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response?.data?.status === "success") {
        toast.success(`${teacher.teacher_name} removed!`);
        setAssignedTeachers((prev) =>
          prev.filter((t) => t.teacher_id !== teacher.teacher_id)
        );
      } else {
        toast.error(response?.data?.message || "Failed");
      }
    } catch (error) {
      toast.error("Failed to remove teacher");
    } finally {
      setAssignLoading(null);
    }
  };

  const isAssigned = (id) =>
    assignedTeachers.some((t) => String(t.teacher_id) === String(id));

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    let list = allTeachers;
    if (q) {
      list = list.filter(
        (t) =>
          t.teacher_name?.toLowerCase().includes(q) ||
          t.teacher_email?.toLowerCase().includes(q)
      );
    }
    if (activeTab === "assigned") {
      return list.filter((t) => isAssigned(t.teacher_id));
    }
    return list.filter((t) => !isAssigned(t.teacher_id));
  }, [allTeachers, searchTerm, activeTab, assignedTeachers]);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={600}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Users className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="font-semibold">Assign Teachers</h3>
            <p className="text-sm text-gray-500 font-normal">{course?.title}</p>
          </div>
        </div>
      }
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab("available")}
          className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
            activeTab === "available"
              ? "bg-teal-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <UserPlus className="w-4 h-4 inline mr-2" />
          Available (
          {allTeachers.filter((t) => !isAssigned(t.teacher_id)).length})
        </button>
        <button
          onClick={() => setActiveTab("assigned")}
          className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${
            activeTab === "assigned"
              ? "bg-green-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Check className="w-4 h-4 inline mr-2" />
          Assigned ({assignedTeachers.length})
        </button>
      </div>

      {/* Search */}
      <div className="mb-4">
        <Input
          prefix={<Search className="w-4 h-4 text-gray-400" />}
          placeholder="Search teachers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          allowClear
          size="large"
          className="rounded-xl"
        />
      </div>

      {/* Teachers List */}
      <div className="max-h-[400px] overflow-y-auto space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
          </div>
        ) : filtered.length === 0 ? (
          <Empty description="No teachers found" />
        ) : (
          filtered.map((teacher) => (
            <div
              key={teacher.teacher_id}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                isAssigned(teacher.teacher_id)
                  ? "bg-green-50 border-green-200"
                  : "bg-gray-50 border-gray-100 hover:border-teal-200"
              }`}
            >
              <Avatar src={teacher.teacher_image} size={44}>
                {teacher.teacher_name?.charAt(0)}
              </Avatar>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-gray-900 truncate">
                  {teacher.teacher_name}
                </h4>
                <p className="text-sm text-gray-500 truncate">
                  {teacher.specialization || teacher.teacher_email}
                </p>
              </div>
              {teacher.level && <Tag color="blue">{teacher.level}</Tag>}
              <button
                onClick={() =>
                  isAssigned(teacher.teacher_id)
                    ? handleRemove(teacher)
                    : handleAssign(teacher)
                }
                disabled={assignLoading === teacher.teacher_id}
                className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                  isAssigned(teacher.teacher_id)
                    ? "bg-red-50 text-red-600 hover:bg-red-100"
                    : "bg-teal-50 text-teal-600 hover:bg-teal-100"
                }`}
              >
                {assignLoading === teacher.teacher_id ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : isAssigned(teacher.teacher_id) ? (
                  <UserMinus className="w-5 h-5" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
