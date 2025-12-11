"use client";
import React, { useEffect, useState } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { BASE_URL } from "../../../utils/base_url";
import toast from "react-hot-toast";

export default function Page() {
  const router = useRouter();

  // ✅ body الأساسي بتاع request
  const [formData, setFormData] = useState({
    group_name: "",
    group_type:"",
    course_id: "",
    teacher_id: "",
    max_students: "",
    start_date: "",
    session_duration: "",
    status: "active",
  });

  // ✅ schedules[]
  const [schedules, setSchedules] = useState([
    { day_of_week: "", start_time: "", end_time: "" },
  ]);

  const [addLoading, setAddLoading] = useState(false);
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

  // 🔹 helper لتحويل الوقت لدقايق عشان نقارن بسهولة
  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return null;
    const parts = timeStr.split(":");
    const h = parseInt(parts[0] || "0", 10);
    const m = parseInt(parts[1] || "0", 10);
    return h * 60 + m;
  };

  // 🔹 التحقق إن الـ schedule جوّه الـ slots بتاعة المدرس
  const isScheduleWithinTeacherSlots = (schedule, teacher) => {
    if (!teacher || !Array.isArray(teacher.teacher_slots)) {
      // لو مفيش slots، مش هنعمل validation
      return true;
    }

    // filter على نفس اليوم
    const sameDaySlots = teacher.teacher_slots.filter(
      (slot) => slot.day === schedule.day_of_week
    );

    if (sameDaySlots.length === 0) {
      // مفيش slots في اليوم ده خالص
      return false;
    }

    const schedStart = parseTimeToMinutes(schedule.start_time);
    const schedEnd = parseTimeToMinutes(schedule.end_time);

    // لو الوقت مش متظبط أو النهاية <= البداية → اعتبره invalid
    if (
      schedStart == null ||
      schedEnd == null ||
      Number.isNaN(schedStart) ||
      Number.isNaN(schedEnd) ||
      schedEnd <= schedStart
    ) {
      return false;
    }

    // لو الـ schedule وقع جوّه أي slot في نفس اليوم → valid
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

      // 👇 هنا افتراض إن from < to في نفس اليوم
      if (schedStart >= slotStart && schedEnd <= slotEnd) {
        return true;
      }
    }

    return false;
  };

  function handleGetAllCourses() {
    const token = localStorage.getItem("AccessToken");
    axios
      .get(BASE_URL + `/courses/select_live_courses.php`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res?.data?.status === "success") {
          // ✅ تصحيح: دي كانت setAllTeachers قبل كده
          setAllCourses(res?.data?.message || []);
        }
      })
      .catch((err) => console.error(err));
  }

  function handleGetAllTeachers() {
    const token = localStorage.getItem("AccessToken");
    axios
      .get(BASE_URL + `/teachers/select_teachers.php`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res?.data?.status === "success") {
          setAllTeachers(res?.data?.message || []);
        }
      })
      .catch((err) => console.error(err));
  }

  // ✅ useEffect صح هنا: [] → مرّة واحدة على الماونت
  useEffect(() => {
    handleGetAllCourses();
    handleGetAllTeachers();
  }, []);

  // تغيير أي input في الفورم الأساسي
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // تغيير حقل جوّه schedule معين
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

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setAddLoading(true);

  //   const token = localStorage.getItem("AccessToken");

  //   // 🧠 جيبي المدرس المختار عشان نتحقق من slots بتاعته
  //   const selectedTeacher = allTeachers.find(
  //     (t) => String(t.teacher_id) === String(formData.teacher_id)
  //   );

  //   // schedules اللي مليانة فعلاً
  //   const filledSchedules = schedules.filter(
  //     (s) => s.day_of_week && s.start_time && s.end_time
  //   );

  //   // ✅ validation: أي schedule مش جوّه slots يطلع invalid
  //   const invalidSchedules = filledSchedules.filter(
  //     (s) => !isScheduleWithinTeacherSlots(s, selectedTeacher)
  //   );

  //   if (invalidSchedules.length > 0) {
  //     toast.error(
  //       "Some schedules are outside the teacher's available slots. Please adjust day/time."
  //     );
  //     setAddLoading(false);
  //     return;
  //   }

  //   // ✅ تجهيز الـ payload
  //   const data_send = {
  //     group_name: formData.group_name.trim(),
  //     course_id: Number(formData.course_id),
  //     teacher_id: Number(formData.teacher_id),
  //     max_students: Number(formData.max_students),
  //     start_date: formData.start_date, // "YYYY-MM-DD"
  //     session_duration: formData.session_duration.trim(), // مثال: "90 minutes"
  //     status: formData.status,
  //     created_at: new Date().toISOString().slice(0, 19).replace("T", " "),
  //     schedules: filledSchedules.map((s) => ({
  //       day_of_week: s.day_of_week,
  //       start_time: s.start_time,
  //       end_time: s.end_time,
  //     })),
  //   };

  //   try {
  //     const res = await axios.post(
  //       BASE_URL + "/groups/add_group.php",
  //       data_send,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     if (res?.data?.status === "success") {
  //       toast.success(res?.data?.message || "Group created successfully");
  //       // ممكن بعد النجاح ترجعي لصفحة الجروبات مثلاً:
  //       // router.push("/dashboard/groups");
  //     } else {
  //       toast.error(res?.data?.message || "Something went wrong");
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     toast.error("Error while creating group");
  //   }

  //   setAddLoading(false);
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setAddLoading(true);

  const token = localStorage.getItem("AccessToken");

  const selectedTeacher = allTeachers.find(
    (t) => String(t.teacher_id) === String(formData.teacher_id)
  );

  // هنا مش هنفلتر، هنشتغل على schedules نفسها
  const hasIncomplete = schedules.some(
    (s) => !s.day_of_week || !s.start_time || !s.end_time
  );

  if (hasIncomplete) {
    toast.error("Please fill all schedule fields (day, start, end) or remove extra empty rows.");
    setAddLoading(false);
    return;
  }

  // ✅ دلوقتي كل الـ rows كاملة، نستخدم schedules مباشرة
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
    group_type : formData?.group_type?.trim(),
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
      axios.get(BASE_URL+"/groups/select_groups.php");
      setFormData({
        group_name: "",
    group_type:"",
    course_id: "",
    teacher_id: "",
    max_students: "",
    start_date: "",
    session_duration: "",
    status: "active",
      })
      setSchedules([{day_of_week:"",end_time:"",start_time:""}]);
    } else {
      toast.error(res?.data?.message || "Something went wrong");
    }
  } catch (err) {
    console.error(err);
    toast.error("Error while creating group");
  }

  setAddLoading(false);
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

      <div className="mt-5 bg-white  rounded-2xl border border-slate-200 p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name → group_name */}
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

           <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Type
            </label>
           <select
           value={formData?.group_type}
           onChange={(e) => setFormData({...formData , group_type:e.target?.value})} 
                         className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[--primary-color] outline-none"
           >
            <option value={""} disabled selected>Choose Group Type</option>
            <option value={"private"}>Private</option>
            <option value="group">Group</option>
           </select>
          </div>

          {/* Course → select from allCourses */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Course
            </label>
            <select
              name="course_id"
              value={formData.course_id}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[--primary-color] outline-none"
            >
              <option value="">Select course</option>
              {allCourses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </option>
              ))}
            </select>
          </div>

          {/* Teacher → select from allTeachers */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teacher
            </label>
            <select
              name="teacher_id"
              value={formData.teacher_id}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[--primary-color] outline-none"
            >
              <option value="">Select teacher</option>
              {allTeachers.map((t) => (
                <option key={t.teacher_id} value={t.teacher_id}>
                  {t.teacher_name}
                </option>
              ))}
            </select>
          </div>

          {/* Max Students → max_students */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Students
            </label>
            <input
              type="number"
              name="max_students"
              placeholder="Enter max students (e.g. 20)"
              value={formData.max_students}
              onChange={handleChange}
              min={1}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[--primary-color] outline-none"
            />
          </div>

          {/* Start Date → start_date */}
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

          {/* Session Duration → session_duration */}
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

          {/* Status → status */}
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
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Schedules → schedules[] */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Schedules
            </label>

            <div className="space-y-3">
              {schedules.map((schedule, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end border border-slate-200 rounded-lg p-3"
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
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[--primary-color] outline-none"
                    >
                      <option value="">Select day</option>
                      {daysOfWeek.map((day) => (
                        <option key={day} value={day}>
                          {day}
                        </option>
                      ))}
                    </select>
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
                        handleScheduleChange(index, "end_time", e.target.value)
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
              ))}
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
          <div className="flex  justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addLoading}
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all disabled:opacity-60"
            >
              {addLoading ? "Saving..." : "Save Group"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
