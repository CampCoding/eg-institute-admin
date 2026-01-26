"use client";
import React, { useEffect, useState } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { ArrowLeft, Plus, Trash2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BASE_URL } from "../../../utils/base_url";
import toast from "react-hot-toast";

export default function Page() {
  const router = useRouter();

  // ✅ Main form data
  const [formData, setFormData] = useState({
    group_name: "",
    group_type: "",
    course_id: "",
    teacher_id: "",
    max_students: "",
    start_date: "",
    session_duration: "",
    status: "active",
  });

  // ✅ Schedules array
  const [schedules, setSchedules] = useState([
    { day_of_week: "", start_time: "", end_time: "" },
  ]);

  const [addLoading, setAddLoading] = useState(false);
  const [allCourses, setAllCourses] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);
  const [teachersLoading, setTeachersLoading] = useState(false);

  const statuses = ["active", "completed", "inactive"];
  const daysOfWeek = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;

  // 🔹 Helper to convert time to minutes for comparison
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const parts = timeStr.split(":");
    const h = parseInt(parts[0] || "0", 10);
    const m = parseInt(parts[1] || "0", 10);
    return h * 60 + m;
  };

  // 🔹 Validate schedule is within teacher's available slots
  const isScheduleWithinTeacherSlots = (schedule, teacher) => {
    if (!teacher || !Array.isArray(teacher.teacher_slots)) {
      return true;
    }

    const sameDaySlots = teacher.teacher_slots.filter(
      (slot) => slot.day === schedule.day_of_week
    );

    if (sameDaySlots.length === 0) {
      return false;
    }

    const schedStart = parseTimeToMinutes(schedule.start_time);
    const schedEnd = parseTimeToMinutes(schedule.end_time);

    if (
      schedStart == null ||
      schedEnd == null ||
      Number.isNaN(schedStart) ||
      Number.isNaN(schedEnd) ||
      schedEnd <= schedStart
    ) {
      return false;
    }

    for (const slot of sameDaySlots) {
      const slotStart = parseTimeToMinutes(slot.slots_from);
      const slotEnd = parseTimeToMinutes(slot.slots_to);

      if (
        slotStart == null ||
        slotEnd == null ||
        Number.isNaN(slotStart) ||
        Number.isNaN(slotEnd)
      ) {
        continue;
      }

      if (schedStart >= slotStart && schedEnd <= slotEnd) {
        return true;
      }
    }

    return false;
  };

  // ✅ Fetch all courses
  function handleGetAllCourses() {
    axios
      .get(BASE_URL + `/courses/select_live_courses.php`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res?.data?.status === "success") {
          setAllCourses(res?.data?.message || []);
        }
      })
      .catch((err) => console.error(err));
  }

  // ✅ Fetch teachers for selected course
  function handleGetTeachersForCourse(courseId) {
    if (!courseId) {
      setAllTeachers([]);
      return;
    }

    setTeachersLoading(true);
    // Reset teacher selection when course changes
    setFormData((prev) => ({ ...prev, teacher_id: "" }));

    axios
      .post(
        BASE_URL + `/teachers/select_teachers_forcourse.php`,
        { course_id: String(courseId) },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        if (res?.data?.status === "success") {
          setAllTeachers(res?.data?.message || []);
        } else {
          setAllTeachers([]);
          toast.error(
            res?.data?.message || "No teachers found for this course"
          );
        }
      })
      .catch((err) => {
        console.error(err);
        setAllTeachers([]);
        toast.error("Failed to fetch teachers for this course");
      })
      .finally(() => {
        setTeachersLoading(false);
      });
  }

  // ✅ Initial load - fetch courses only
  useEffect(() => {
    handleGetAllCourses();
  }, []);

  // ✅ When course changes, fetch teachers for that course
  useEffect(() => {
    if (formData.course_id) {
      handleGetTeachersForCourse(formData.course_id);
    } else {
      setAllTeachers([]);
      setFormData((prev) => ({ ...prev, teacher_id: "" }));
    }
  }, [formData.course_id]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle schedule field changes
  const handleScheduleChange = (index, field, value) => {
    setSchedules((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
  };

  const addScheduleRow = () => {
    setSchedules((prev) => [
      ...prev,
      { day_of_week: "", start_time: "", end_time: "" },
    ]);
  };

  const removeScheduleRow = (index) => {
    setSchedules((prev) => prev.filter((_, i) => i !== index));
  };

  // Get selected teacher's available days for schedule validation hint
  const getSelectedTeacherSlots = () => {
    const teacher = allTeachers.find(
      (t) => String(t.teacher_id) === String(formData.teacher_id)
    );
    return teacher?.teacher_slots || [];
  };

  // Get available days from selected teacher
  const getAvailableDays = () => {
    const slots = getSelectedTeacherSlots();
    const days = [...new Set(slots.map((s) => s.day))];
    return days;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAddLoading(true);

    const selectedTeacher = allTeachers.find(
      (t) => String(t.teacher_id) === String(formData.teacher_id)
    );

    const hasIncomplete = schedules.some(
      (s) => !s.day_of_week || !s.start_time || !s.end_time
    );

    if (hasIncomplete) {
      toast.error(
        "Please fill all schedule fields (day, start, end) or remove extra empty rows."
      );
      setAddLoading(false);
      return;
    }

    const filledSchedules = schedules;

    const invalidSchedules = filledSchedules.filter(
      (s) => !isScheduleWithinTeacherSlots(s, selectedTeacher)
    );

    if (invalidSchedules.length > 0) {
      toast.error(
        "Some schedules are outside the teacher's available slots. Please adjust day/time."
      );
      setAddLoading(false);
      return;
    }

    const data_send = {
      group_name: formData.group_name.trim(),
      group_type: formData?.group_type?.trim(),
      course_id: Number(formData.course_id),
      teacher_id: Number(formData.teacher_id),
      max_students: Number(formData.max_students),
      start_date: formData.start_date,
      session_duration: formData.session_duration.trim(),
      status: formData.status,
      created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
      schedules: filledSchedules.map((s) => ({
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
      })),
    };

    try {
      const res = await axios.post(
        BASE_URL + "/groups/add_group.php",
        data_send,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res?.data?.status === "success") {
        toast.success(res?.data?.message || "Group created successfully");
        setFormData({
          group_name: "",
          group_type: "",
          course_id: "",
          teacher_id: "",
          max_students: "",
          start_date: "",
          session_duration: "",
          status: "active",
        });
        setSchedules([{ day_of_week: "", end_time: "", start_time: "" }]);
        setAllTeachers([]);
      } else {
        toast.error(res?.data?.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while creating group");
    }

    setAddLoading(false);
  };

  // Format time for display (HH:MM:SS -> HH:MM AM/PM)
  const formatTimeSlot = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
  };

  return (
    <div className="!overflow-x-hidden">
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
        title={"Add Group Page"}
        parent={"Groups"}
        child={"Add Group"}
      />

      <div className="mt-5 bg-white rounded-2xl border border-slate-200 p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <input
              type="text"
              name="group_name"
              placeholder="Enter group name"
              value={formData.group_name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[--primary-color] outline-none"
            />
          </div>

          {/* Group Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Type
            </label>
            <select
              value={formData?.group_type}
              onChange={(e) =>
                setFormData({ ...formData, group_type: e.target?.value })
              }
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[--primary-color] outline-none"
            >
              <option value="" disabled>
                Choose Group Type
              </option>
              <option value="private">Private</option>
              <option value="group">Group</option>
            </select>
          </div>

          {/* Course - Select first to load teachers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course <span className="text-red-500">*</span>
            </label>
            <select
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[--primary-color] outline-none"
            >
              <option value="">Select course first</option>
              {allCourses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">
              Select a course to load available teachers
            </p>
          </div>

          {/* Teacher - Depends on course selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teacher <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="teacher_id"
                value={formData.teacher_id}
                onChange={handleChange}
                required
                disabled={!formData.course_id || teachersLoading}
                className={`w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[--primary-color] outline-none ${
                  !formData.course_id || teachersLoading
                    ? "bg-gray-100 cursor-not-allowed"
                    : ""
                }`}
              >
                <option value="">
                  {!formData.course_id
                    ? "Please select a course first"
                    : teachersLoading
                      ? "Loading teachers..."
                      : allTeachers.length === 0
                        ? "No teachers available for this course"
                        : "Select teacher"}
                </option>
                {allTeachers.map((t) => (
                  <option key={t.teacher_id} value={t.teacher_id}>
                    {t.teacher_name}
                    {t.languages && t.languages.filter(Boolean).length > 0
                      ? ` (${t.languages.filter(Boolean).join(", ")})`
                      : ""}
                  </option>
                ))}
              </select>
              {teachersLoading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Loader2 size={18} className="animate-spin text-gray-400" />
                </div>
              )}
            </div>

            {/* Show selected teacher's available slots */}
            {formData.teacher_id && getSelectedTeacherSlots().length > 0 && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-xs font-medium text-blue-800 mb-2">
                  📅 Teacher's Available Slots:
                </p>
                <div className="flex flex-wrap gap-2">
                  {getSelectedTeacherSlots().map((slot, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-white text-blue-700 px-2 py-1 rounded-full border border-blue-200"
                    >
                      {slot.day}: {formatTimeSlot(slot.slots_from)} -{" "}
                      {formatTimeSlot(slot.slots_to)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Max Students */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Students
            </label>
            <input
              type="number"
              onWheel={(e) => e.target.blur()}
              name="max_students"
              placeholder="Enter max students (e.g. 20)"
              value={formData.max_students}
              onChange={handleChange}
              min={1}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[--primary-color] outline-none"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[--primary-color] outline-none"
            />
          </div>

          {/* Session Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Duration
            </label>
            <input
              type="text"
              name="session_duration"
              placeholder="e.g. 90 minutes"
              value={formData.session_duration}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[--primary-color] outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[--primary-color] outline-none"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Schedules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Schedules
            </label>

            {/* Hint for available days */}
            {formData.teacher_id && getAvailableDays().length > 0 && (
              <div className="mb-3 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-xs text-yellow-800">
                  💡 <strong>Tip:</strong> This teacher is available on:{" "}
                  <span className="font-medium">
                    {getAvailableDays().join(", ")}
                  </span>
                </p>
              </div>
            )}

            <div className="space-y-3">
              {schedules.map((schedule, index) => {
                const availableDays = getAvailableDays();
                const isValidDay =
                  !schedule.day_of_week ||
                  availableDays.length === 0 ||
                  availableDays.includes(schedule.day_of_week);

                return (
                  <div
                    key={index}
                    className={`grid grid-cols-1 md:grid-cols-4 gap-3 items-end border rounded-lg p-3 ${
                      !isValidDay
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200"
                    }`}
                  >
                    {/* Day of Week */}
                    <div>
                      <span className="block text-xs font-medium text-gray-600 mb-1">
                        Day of Week
                      </span>
                      <select
                        value={schedule.day_of_week}
                        onChange={(e) =>
                          handleScheduleChange(
                            index,
                            "day_of_week",
                            e.target.value
                          )
                        }
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[--primary-color] outline-none ${
                          !isValidDay
                            ? "border-red-400 bg-red-50"
                            : "border-gray-300"
                        }`}
                      >
                        <option value="">Select day</option>
                        {daysOfWeek.map((day) => {
                          const isAvailable =
                            availableDays.length === 0 ||
                            availableDays.includes(day);
                          return (
                            <option
                              key={day}
                              value={day}
                              className={!isAvailable ? "text-gray-400" : ""}
                            >
                              {day} {!isAvailable && "(unavailable)"}
                            </option>
                          );
                        })}
                      </select>
                      {!isValidDay && (
                        <p className="text-xs text-red-600 mt-1">
                          Teacher not available on this day
                        </p>
                      )}
                    </div>

                    {/* Start Time */}
                    <div>
                      <span className="block text-xs font-medium text-gray-600 mb-1">
                        Start Time
                      </span>
                      <input
                        type="time"
                        value={schedule.start_time}
                        onChange={(e) =>
                          handleScheduleChange(
                            index,
                            "start_time",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[--primary-color] outline-none"
                      />
                    </div>

                    {/* End Time */}
                    <div>
                      <span className="block text-xs font-medium text-gray-600 mb-1">
                        End Time
                      </span>
                      <input
                        type="time"
                        value={schedule.end_time}
                        onChange={(e) =>
                          handleScheduleChange(
                            index,
                            "end_time",
                            e.target.value
                          )
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[--primary-color] outline-none"
                      />
                    </div>

                    {/* Remove Button */}
                    <div className="flex md:justify-end">
                      {schedules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeScheduleRow(index)}
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={14} />
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={addScheduleRow}
              className="mt-3 inline-flex items-center gap-1 px-3 py-2 text-xs rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
            >
              <Plus size={14} />
              Add another schedule
            </button>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addLoading || !formData.teacher_id}
              className="px-6 py-2 rounded-lg bg-blue-600 !text-white hover:bg-blue-700 shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {addLoading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Group"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
