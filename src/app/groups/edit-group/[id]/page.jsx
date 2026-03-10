"use client";

import React, { useEffect, useState } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { ArrowLeft, Plus, Trash2, Loader2, Lock } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import toast from "react-hot-toast";
import { BASE_URL } from "../../../../utils/base_url";

const EDIT_GROUP_ENDPOINT = "/groups/edit_group.php";
const SELECT_GROUPS_ENDPOINT = "/groups/select_groups.php";

export default function Page() {
  const router = useRouter();
  const { id } = useParams();

  const [addLoading, setAddLoading] = useState(false);
  const [loadingGroup, setLoadingGroup] = useState(true);
  const [teachersLoading, setTeachersLoading] = useState(false);

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

  // ✅ Store original teacher name for display
  const [originalTeacherName, setOriginalTeacherName] = useState("");

  const [schedules, setSchedules] = useState([
    { day_of_week: "", start_time: "", end_time: "" },
  ]);

  const [allCourses, setAllCourses] = useState([]);
  const [allTeachers, setAllTeachers] = useState([]);

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

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const [hStr, mStr] = timeStr.split(":");
    const h = parseInt(hStr || "0", 10);
    const m = parseInt(mStr || "0", 10);
    return h * 60 + m;
  };

  const isScheduleWithinTeacherSlots = (schedule, teacher) => {
    if (!teacher || !Array.isArray(teacher.teacher_slots)) return true;

    const sameDaySlots = teacher.teacher_slots.filter(
      (slot) => slot.day === schedule.day_of_week
    );
    if (sameDaySlots.length === 0) return false;

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
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res?.data?.status === "success") {
          setAllCourses(res?.data?.message || []);
        }
      })
      .catch((err) => console.error(err));
  }

  // ✅ Fetch teachers for selected course - SAME AS MODAL
  function handleGetTeachersForCourse(courseId, keepTeacherId = null) {
    if (!courseId) {
      setAllTeachers([]);
      return;
    }

    setTeachersLoading(true);

    axios
      .post(
        `${BASE_URL}/courses/select_course_teachers.php`,
        { course_id: courseId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        if (res?.data?.status === "success") {
          const teachers = res?.data?.message || [];
          setAllTeachers(teachers);

          // ✅ Find and store original teacher name
          if (keepTeacherId) {
            const originalTeacher = teachers.find(
              (t) => String(t.teacher_id) === String(keepTeacherId)
            );
            if (originalTeacher) {
              setOriginalTeacherName(
                originalTeacher.teacher_name +
                  (originalTeacher.specialization
                    ? ` - ${originalTeacher.specialization}`
                    : "")
              );
            }
          }
        } else {
          setAllTeachers([]);
        }
      })
      .catch((err) => {
        console.error(err);
        setAllTeachers([]);
      })
      .finally(() => {
        setTeachersLoading(false);
      });
  }

  // ✅ Load existing group data
  async function handleGetGroupDetails() {
    setLoadingGroup(true);

    try {
      const res = await axios.get(BASE_URL + SELECT_GROUPS_ENDPOINT, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res?.data?.status === "success") {
        const list = res?.data?.message || [];
        const found = list.find((g) => String(g.group_id) === String(id));

        if (!found) {
          toast.error("Group not found");
          router.back();
          return;
        }

        console.log("Found Group:", found);

        // ✅ Store original teacher name from group data
        if (found.teacher_name) {
          setOriginalTeacherName(found.teacher_name);
        }

        setFormData({
          group_name: found.group_name || "",
          group_type: found.type || "",
          course_id: String(found.course_id || ""),
          teacher_id: String(found.teacher_id || ""),
          max_students: String(found.max_students || ""),
          start_date: found.start_date || "",
          session_duration: String(found.session_duration || ""),
          status: found.status || "active",
        });

        if (found.course_id) {
          handleGetTeachersForCourse(found.course_id, found.teacher_id);
        }

        if (Array.isArray(found.slots) && found.slots.length > 0) {
          setSchedules(
            found.slots.map((slot) => ({
              day_of_week: slot.day_of_week || "",
              start_time: slot.start_time?.slice(0, 5) || "",
              end_time: slot.end_time?.slice(0, 5) || "",
            }))
          );
        } else {
          setSchedules([{ day_of_week: "", start_time: "", end_time: "" }]);
        }
      } else {
        toast.error(res?.data?.message || "Failed to load group");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error while loading group data");
    } finally {
      setLoadingGroup(false);
    }
  }

  useEffect(() => {
    handleGetAllCourses();
  }, []);

  useEffect(() => {
    if (id) {
      handleGetGroupDetails();
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

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

  const getSelectedTeacherSlots = () => {
    const teacher = allTeachers.find(
      (t) => String(t.teacher_id) === String(formData.teacher_id)
    );
    return teacher?.teacher_slots || [];
  };

  const getAvailableDays = () => {
    const slots = getSelectedTeacherSlots();
    const days = [...new Set(slots.map((s) => s.day))];
    return days;
  };

  const formatTimeSlot = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":");
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? "PM" : "AM";
    const h12 = h % 12 || 12;
    return `${h12}:${minutes} ${ampm}`;
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
      group_id: Number(id),
      group_name: formData.group_name.trim(),
      group_type: formData.group_type?.trim(),
      course_id: Number(formData.course_id),
      teacher_id: Number(formData.teacher_id),
      max_students: Number(formData.max_students),
      start_date: formData.start_date,
      session_duration: formData.session_duration.trim(),
      status: formData.status,
      schedules: filledSchedules.map((s) => ({
        day_of_week: s.day_of_week,
        start_time: s.start_time,
        end_time: s.end_time,
      })),
    };

    console.log("Payload being sent:", data_send);

    try {
      const res = await axios.post(BASE_URL + EDIT_GROUP_ENDPOINT, data_send, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response:", res.data);

      if (res?.data?.status === "success") {
        toast.success(res?.data?.message || "Group updated successfully");
        router.push("/groups");
      } else {
        toast.error(res?.data?.message || "Something went wrong");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Error while updating group");
    }

    setAddLoading(false);
  };

  if (loadingGroup) {
    return (
      <div className="p-4 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500 mx-auto mb-4"></div>
          <p className="text-sm text-slate-500">Loading group data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="!overflow-x-hidden">
      <div className="flex mb-4 items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft size={16} className="inline -mt-0.5 mr-1" />
          Back
        </button>
      </div>

      <BreadCrumb
        title={"Edit Group Page"}
        parent={"Groups"}
        child={"Edit Group"}
      />

      <div className="mt-5 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="group_name"
              placeholder="Enter group name"
              value={formData.group_name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          {/* Group Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.group_type}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  group_type: e.target.value,
                }))
              }
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            >
              <option value="">Choose Group Type</option>
              <option value="private">Private</option>
              <option value="group">Group</option>
            </select>
          </div>

          {/* Course - DISABLED in Edit mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                name="course_id"
                value={formData.course_id}
                disabled
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed outline-none transition-all"
              >
                <option value="">Select course</option>
                {allCourses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Lock size={16} className="text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <Lock size={12} />
              Course cannot be changed after group creation
            </p>
          </div>

          {/* Teacher - DISABLED in Edit mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teacher <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={
                  teachersLoading
                    ? "Loading..."
                    : originalTeacherName || "No teacher assigned"
                }
                disabled
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-100 cursor-not-allowed outline-none transition-all"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Lock size={16} className="text-gray-400" />
              </div>
            </div>
            <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
              <Lock size={12} />
              Teacher cannot be changed after group creation
            </p>

            {/* Show selected teacher's available slots */}
            {formData.teacher_id && getSelectedTeacherSlots().length > 0 && (
              <div className="mt-2 p-3 bg-teal-50 rounded-lg border border-teal-200">
                <p className="text-xs font-medium text-teal-800 mb-2">
                  📅 Teacher's Available Slots:
                </p>
                <div className="flex flex-wrap gap-2">
                  {getSelectedTeacherSlots().map((slot, idx) => (
                    <span
                      key={idx}
                      className="text-xs bg-white text-teal-700 px-2 py-1 rounded-full border border-teal-200"
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
              Max Students <span className="text-red-500">*</span>
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
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="start_date"
              value={formData.start_date}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          {/* Session Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Session Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="session_duration"
              placeholder="e.g. 90"
              value={formData.session_duration}
              onChange={handleChange}
              min={1}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition-all"
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
              Schedules <span className="text-red-500">*</span>
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
                    className={`grid grid-cols-1 md:grid-cols-4 gap-3 items-end border rounded-lg p-4 ${
                      !isValidDay
                        ? "border-red-300 bg-red-50"
                        : "border-slate-200 bg-gray-50"
                    } hover:bg-gray-100 transition-colors`}
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
                        className={`w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none ${
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
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
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 outline-none"
                      />
                    </div>

                    {/* Remove Button */}
                    <div className="flex md:justify-end">
                      {schedules.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeScheduleRow(index)}
                          className="inline-flex items-center gap-1 px-3 py-2 text-xs rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
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
              className="!mt-3 inline-flex items-center gap-1 px-4 py-2 text-sm rounded-lg bg-teal-50 text-teal-700 hover:bg-teal-100 transition-colors font-medium"
            >
              <Plus size={16} />
              Add another schedule
            </button>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addLoading}
              className="px-6 py-2.5 rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-md transition-all disabled:opacity-60 disabled:cursor-not-allowed font-medium"
            >
              {addLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </span>
              ) : (
                "Update Group"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
