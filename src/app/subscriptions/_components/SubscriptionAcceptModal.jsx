// components/SubscriptionAcceptModal.jsx
"use client";

import { useState, useEffect, useMemo } from "react";
import {
  CheckCircle,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  BookOpen,
  Lock,
  Unlock,
  RefreshCw,
  X,
  GraduationCap,
  Users,
} from "lucide-react";
import { Select } from "antd";
import {
  checkSlotsAvailability,
  toHHMM,
  format24to12,
  toHHMMSS,
  timeToMinutes,
  minutesToHHMM,
  DAY_ORDER,
  isSlotConflicting,
} from "@/utils/subscriptionHelpers";
import toast from "react-hot-toast";
import axios from "axios";
import { BASE_URL } from "../../../utils/base_url";
// import apiClient from "@/utils/ApiClient";
// import "antd/dist/reset.css"; // Import Ant Design styles

const { Option } = Select;

export default function SubscriptionAcceptModal({
  isOpen,
  onClose,
  subscription,
  allSubscriptions,
  onAccept,
  loading,
}) {
  const [step, setStep] = useState("checking");
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [selectedNewSlots, setSelectedNewSlots] = useState([]);

  // Course & Teacher Selection
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState(null);
  const [selectedTeacherData, setSelectedTeacherData] = useState(null);

  // Group Selection (for group subscriptions)
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  // Data states
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [teachersLoading, setTeachersLoading] = useState(false);

  // Check if subscription is group type
  const isGroupSubscription = subscription?.subscription_type === "group";

  // Fetch courses on mount
  useEffect(() => {
    const fetchCourses = async () => {
      setCoursesLoading(true);
      try {
        const response = await axios.get(
          `${BASE_URL}/courses/select_courses.php`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("AccessToken")}`,
            },
          }
        );
        if (response.data?.message) {
          setCourses(response.data.message);
        }
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setCoursesLoading(false);
      }
    };

    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  // Fetch teachers when course changes
  useEffect(() => {
    const fetchTeachers = async () => {
      if (!selectedCourseId) {
        setTeachers([]);
        return;
      }

      setTeachersLoading(true);
      try {
        const response = await axios.post(
          `${BASE_URL}/teachers/select_teachers_forcourse.php`,
          { course_id: selectedCourseId },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("AccessToken")}`,
            },
          }
        );
        if (response.data?.message) {
          setTeachers(response.data.message);
        } else {
          setTeachers([]);
        }
      } catch (error) {
        console.error("Error fetching teachers:", error);
        toast.error("Failed to load teachers");
        setTeachers([]);
      } finally {
        setTeachersLoading(false);
      }
    };

    fetchTeachers();
  }, [selectedCourseId]);

  // Fetch groups when teacher changes (only for group subscriptions)
  useEffect(() => {
    const fetchGroups = async () => {
      if (!selectedTeacherId || !isGroupSubscription) {
        setGroups([]);
        return;
      }

      setGroupsLoading(true);
      try {
        const response = await axios.post(
          `${BASE_URL}/teachers/select_teacher_groups.php`,
          { teacher_id: selectedTeacherId },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("AccessToken")}`,
            },
          }
        );
        if (response.data?.message && Array.isArray(response.data.message)) {
          setGroups(response.data.message);
        } else {
          setGroups([]);
        }
      } catch (error) {
        console.error("Error fetching groups:", error);
        toast.error("Failed to load groups");
        setGroups([]);
      } finally {
        setGroupsLoading(false);
      }
    };

    fetchGroups();
  }, [selectedTeacherId, isGroupSubscription]);

  // Initialize with current course, teacher, and group
  useEffect(() => {
    if (subscription && isOpen) {
      setSelectedCourseId(subscription.course_id);
      setSelectedTeacherId(subscription.teacher_id);
      if (isGroupSubscription) {
        setSelectedGroupId(subscription.group_id);
      }
    }
  }, [subscription, isOpen, isGroupSubscription]);

  // Update teacher data when teacher is selected
  useEffect(() => {
    if (selectedTeacherId && teachers.length > 0) {
      const teacher = teachers.find(
        (t) => String(t.teacher_id) === String(selectedTeacherId)
      );
      setSelectedTeacherData(teacher || null);
    } else {
      setSelectedTeacherData(null);
    }
  }, [selectedTeacherId, teachers]);

  // Get teacher slots from selected teacher or original subscription
  const currentTeacherSlots = useMemo(() => {
    if (selectedTeacherData?.slots) {
      return selectedTeacherData.slots;
    }
    return subscription?.teacher_slots || [];
  }, [selectedTeacherData, subscription]);

  const reservedSlots = useMemo(() => {
    if (!subscription || !allSubscriptions) return [];

    const teacherId = selectedTeacherId || subscription.teacher_id;
    const currentGroupId = subscription.group_id;

    const reserved = [];
    allSubscriptions.forEach((sub) => {
      if (
        String(sub.teacher_id) === String(teacherId) &&
        sub.status === "accepted" &&
        sub.group_id !== currentGroupId
      ) {
        (sub.slots || []).forEach((slot) => {
          reserved.push({ ...slot, group_id: sub.group_id });
        });
      }
    });

    return reserved;
  }, [subscription, allSubscriptions, selectedTeacherId]);

  useEffect(() => {
    if (!isOpen || !subscription) return;

    setStep("checking");
    setSelectedNewSlots([]);
    setAvailabilityResult(null);

    // For group subscriptions, skip schedule checking
    if (isGroupSubscription) {
      setStep("available");
      return;
    }

    const timer = setTimeout(() => {
      const requestedSlots = subscription.slots || [];
      const result = checkSlotsAvailability(
        requestedSlots,
        reservedSlots,
        subscription.group_id
      );
      setAvailabilityResult(result);
      setStep(result.allAvailable ? "available" : "conflict");
    }, 500);

    return () => clearTimeout(timer);
  }, [isOpen, subscription, reservedSlots, isGroupSubscription]);

  const availableSlotsByDay = useMemo(() => {
    const daySlots = new Map();

    currentTeacherSlots
      .filter((slot) => slot?.hidden !== "1")
      .forEach((slot) => {
        const day = slot?.day || "";
        const startTime = slot?.slots_from || "";
        const endTime = slot?.slots_to || "";

        if (!day || !startTime || !endTime) return;

        const startMins = timeToMinutes(toHHMM(startTime));
        const endMins = timeToMinutes(toHHMM(endTime));

        const hourSlots = [];
        for (
          let currentStart = startMins;
          currentStart + 60 <= endMins;
          currentStart += 60
        ) {
          const currentEnd = currentStart + 60;
          const slotStartTime = minutesToHHMM(currentStart);
          const slotEndTime = minutesToHHMM(currentEnd);

          const isReserved = isSlotConflicting(
            {
              day_of_week: day,
              start_time: slotStartTime,
              end_time: slotEndTime,
            },
            reservedSlots,
            subscription?.group_id
          );

          hourSlots.push({
            key: `${day}-${slotStartTime}-${slotEndTime}`,
            day_of_week: day,
            start_time: slotStartTime,
            end_time: slotEndTime,
            start_time_12h: format24to12(toHHMMSS(slotStartTime)),
            end_time_12h: format24to12(toHHMMSS(slotEndTime)),
            isReserved,
          });
        }

        if (!daySlots.has(day)) daySlots.set(day, []);
        daySlots.get(day).push(...hourSlots);
      });

    return daySlots;
  }, [currentTeacherSlots, reservedSlots, subscription]);

  const daysToRender = useMemo(() => {
    const existingDays = Array.from(availableSlotsByDay.keys());
    return existingDays.sort((a, b) => {
      const ia = DAY_ORDER.indexOf(a);
      const ib = DAY_ORDER.indexOf(b);
      if (ia === -1 && ib === -1) return a.localeCompare(b);
      if (ia === -1) return 1;
      if (ib === -1) return -1;
      return ia - ib;
    });
  }, [availableSlotsByDay]);

  const toggleSlot = (slot) => {
    if (slot.isReserved) {
      toast.error("This slot is already reserved");
      return;
    }
    setSelectedNewSlots((prev) => {
      const exists = prev.some((s) => s.key === slot.key);
      if (exists) return prev.filter((s) => s.key !== slot.key);
      return [...prev, slot];
    });
  };

  const isSlotSelected = (key) => selectedNewSlots.some((s) => s.key === key);

  const handleCourseChange = (courseId) => {
    setSelectedCourseId(courseId);
    setSelectedTeacherId(null);
    setSelectedTeacherData(null);
    setSelectedNewSlots([]);
    setSelectedGroupId(null);
  };

  const handleTeacherChange = (teacherId) => {
    setSelectedTeacherId(teacherId);
    setSelectedNewSlots([]);
    setSelectedGroupId(null);
  };

  const handleGroupChange = (groupId) => {
    setSelectedGroupId(groupId);
  };

  // ✅ Handle group and private subscriptions differently
  const handleDirectAccept = () => {
    const payload = {
      subscription_id: Number(subscription.subscription_id),
      status: "accepted",
      new_course_id: Number(selectedCourseId || subscription.course_id),
      new_teacher_id: Number(selectedTeacherId || subscription.teacher_id),
    };

    if (isGroupSubscription) {
      // For group subscriptions, send new_group_id
      payload.new_group_id = Number(selectedGroupId || subscription.group_id);
    } else {
      // For private subscriptions, send schedule_updates
      const slotsToUse = subscription.slots || [];
      payload.schedule_updates = slotsToUse.map((slot) => ({
        schedule_id: slot?.schedule_id ? Number(slot.schedule_id) : null,
        new_from: toHHMMSS(slot.start_time),
        new_to: toHHMMSS(slot.end_time),
        new_day_of_week: slot.day_of_week,
      }));
    }

    // console.log("📤 Sending Accept Payload:", payload);
    // return;
    onAccept(payload);
  };

  // ✅ For reschedule (only for private)
  const handleAcceptWithNewSchedule = () => {
    const requiredCount = subscription.slots?.length || 1;

    if (selectedNewSlots.length < requiredCount) {
      toast.error(`Please select at least ${requiredCount} time slot(s)`);
      return;
    }

    const originalSlots = subscription.slots || [];
    const scheduleUpdates = selectedNewSlots.map((newSlot, index) => {
      const originalSlot = originalSlots[index];
      return {
        schedule_id: originalSlot?.schedule_id
          ? Number(originalSlot.schedule_id)
          : null,
        new_from: toHHMMSS(newSlot.start_time),
        new_to: toHHMMSS(newSlot.end_time),
        new_day_of_week: newSlot.day_of_week,
      };
    });

    const payload = {
      subscription_id: Number(subscription.subscription_id),
      status: "accepted",
      new_course_id: Number(selectedCourseId || subscription.course_id),
      new_teacher_id: Number(selectedTeacherId || subscription.teacher_id),
      schedule_updates: scheduleUpdates,
    };

    console.log("📤 Sending Accept with Reschedule Payload:", payload);
    onAccept(payload);
  };

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep("checking");
      setSelectedNewSlots([]);
      setAvailabilityResult(null);
      setSelectedCourseId(null);
      setSelectedTeacherId(null);
      setSelectedTeacherData(null);
      setSelectedGroupId(null);
      setCourses([]);
      setTeachers([]);
      setGroups([]);
    }
  }, [isOpen]);

  if (!isOpen || !subscription) return null;

  const hasChanges =
    (selectedCourseId &&
      String(selectedCourseId) !== String(subscription.course_id)) ||
    (selectedTeacherId &&
      String(selectedTeacherId) !== String(subscription.teacher_id)) ||
    (isGroupSubscription &&
      selectedGroupId &&
      String(selectedGroupId) !== String(subscription.group_id));

  // Get selected group info
  const selectedGroup = groups.find(
    (g) => String(g.group_id) === String(selectedGroupId)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-teal-50 via-cyan-50 to-emerald-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  Accept Subscription
                </h2>
                <p className="text-sm text-gray-500">
                  {isGroupSubscription ? "Group" : "Private"} Class
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          {/* Loading */}
          {step === "checking" && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mb-4" />
              <p className="text-gray-600 font-medium">
                Checking schedule availability...
              </p>
            </div>
          )}

          {/* Available */}
          {step === "available" && (
            <div className="space-y-6">
              <div className="p-5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-800 text-lg mb-1">
                      {isGroupSubscription
                        ? "Group Available!"
                        : "All Time Slots Are Available!"}
                    </h3>
                    <p className="text-emerald-700 text-sm">
                      {isGroupSubscription
                        ? "You can accept this group subscription."
                        : "No conflicts detected. You can accept this subscription directly."}
                    </p>
                  </div>
                </div>
              </div>

              <SubscriptionDetails subscription={subscription} />

              {/* Course & Teacher Selection */}
              <CourseTeacherSelector
                courses={courses}
                teachers={teachers}
                coursesLoading={coursesLoading}
                teachersLoading={teachersLoading}
                selectedCourseId={selectedCourseId}
                selectedTeacherId={selectedTeacherId}
                onCourseChange={handleCourseChange}
                onTeacherChange={handleTeacherChange}
                originalCourseId={subscription.course_id}
                originalTeacherId={subscription.teacher_id}
              />

              {/* Group Selection (only for group subscriptions) */}
              {isGroupSubscription && (
                <GroupSelector
                  groups={groups}
                  groupsLoading={groupsLoading}
                  selectedGroupId={selectedGroupId}
                  onGroupChange={handleGroupChange}
                  originalGroupId={subscription.group_id}
                />
              )}

              {hasChanges && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800 text-sm">
                        Changes Detected
                      </p>
                      <p className="text-amber-700 text-xs mt-0.5">
                        The subscription will be updated with the new selection.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Show group schedule if group subscription */}
              {isGroupSubscription && selectedGroup && (
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    Group Schedule
                  </h4>
                  {selectedGroup.group_schedules &&
                  selectedGroup.group_schedules.length > 0 ? (
                    <div className="grid gap-3">
                      {selectedGroup.group_schedules.map((slot, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-4 bg-white rounded-xl border border-emerald-200 shadow-sm"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                              <span className="text-emerald-700 font-bold text-sm">
                                {idx + 1}
                              </span>
                            </div>
                            <span className="font-semibold text-gray-800">
                              {slot.day_of_week}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span className="font-medium">
                              {format24to12(slot.start_time)} -{" "}
                              {format24to12(slot.end_time)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">
                      No schedule available for this group
                    </p>
                  )}
                </div>
              )}

              {/* Show requested schedule if private subscription */}
              {!isGroupSubscription && (
                <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-teal-600" />
                    Requested Schedule
                  </h4>
                  <div className="grid gap-3">
                    {subscription.slots?.map((slot, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-white rounded-xl border border-emerald-200 shadow-sm"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                            <span className="text-emerald-700 font-bold text-sm">
                              {idx + 1}
                            </span>
                          </div>
                          <span className="font-semibold text-gray-800">
                            {slot.day_of_week}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span className="font-medium">
                            {format24to12(slot.start_time)} -{" "}
                            {format24to12(slot.end_time)}
                          </span>
                        </div>
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full flex items-center gap-1 font-medium">
                          <Unlock className="w-3 h-3" />
                          Available
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleDirectAccept}
                  disabled={
                    loading ||
                    !selectedTeacherId ||
                    (isGroupSubscription && !selectedGroupId)
                  }
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Accept Subscription
                    </>
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Conflict (only for private subscriptions) */}
          {step === "conflict" && !isGroupSubscription && (
            <div className="space-y-6">
              <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-amber-800 text-lg mb-1">
                      Schedule Conflict Detected!
                    </h3>
                    <p className="text-amber-700 text-sm">
                      {availabilityResult?.conflicts?.length} of{" "}
                      {subscription.slots?.length} slots are already reserved.
                      Choose alternative slots or change teacher to proceed.
                    </p>
                  </div>
                </div>
              </div>

              <SubscriptionDetails subscription={subscription} />

              {/* Course & Teacher Selection */}
              <CourseTeacherSelector
                courses={courses}
                teachers={teachers}
                coursesLoading={coursesLoading}
                teachersLoading={teachersLoading}
                selectedCourseId={selectedCourseId}
                selectedTeacherId={selectedTeacherId}
                onCourseChange={handleCourseChange}
                onTeacherChange={handleTeacherChange}
                originalCourseId={subscription.course_id}
                originalTeacherId={subscription.teacher_id}
              />

              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-200">
                <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  Schedule Status
                </h4>
                <div className="grid gap-3">
                  {availabilityResult?.conflicts?.map((slot, idx) => (
                    <div
                      key={`c-${idx}`}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-rose-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                          <Lock className="w-5 h-5 text-rose-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            {slot.day_of_week}
                          </span>
                          <span className="text-xs text-rose-600">
                            Conflict
                          </span>
                        </div>
                      </div>
                      <span className="font-medium text-gray-600">
                        {format24to12(slot.start_time)} -{" "}
                        {format24to12(slot.end_time)}
                      </span>
                      <span className="text-xs bg-rose-100 text-rose-700 px-3 py-1.5 rounded-full font-medium">
                        Reserved
                      </span>
                    </div>
                  ))}
                  {availabilityResult?.available?.map((slot, idx) => (
                    <div
                      key={`a-${idx}`}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border-2 border-emerald-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                          <Unlock className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <span className="font-semibold text-gray-800 block">
                            {slot.day_of_week}
                          </span>
                          <span className="text-xs text-emerald-600">
                            Available
                          </span>
                        </div>
                      </div>
                      <span className="font-medium text-gray-600">
                        {format24to12(slot.start_time)} -{" "}
                        {format24to12(slot.end_time)}
                      </span>
                      <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-medium">
                        Available
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setStep("reschedule")}
                  disabled={!selectedTeacherId}
                  className="flex-1 bg-gradient-to-r from-teal-600 to-cyan-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-teal-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-teal-200"
                >
                  <RefreshCw className="w-5 h-5" />
                  Choose Alternative Schedule
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Reschedule (only for private subscriptions) */}
          {step === "reschedule" && !isGroupSubscription && (
            <div className="space-y-5">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
                <div className="flex items-center gap-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-semibold text-blue-800">
                      Select New Time Slots
                    </h3>
                    <p className="text-sm text-blue-700">
                      Choose {subscription.slots?.length || 1} slot(s) • 1 hour
                      each
                    </p>
                  </div>
                </div>
              </div>

              {/* Course & Teacher Selection */}
              <CourseTeacherSelector
                courses={courses}
                teachers={teachers}
                coursesLoading={coursesLoading}
                teachersLoading={teachersLoading}
                selectedCourseId={selectedCourseId}
                selectedTeacherId={selectedTeacherId}
                onCourseChange={handleCourseChange}
                onTeacherChange={handleTeacherChange}
                originalCourseId={subscription.course_id}
                originalTeacherId={subscription.teacher_id}
              />

              <div className="flex items-center justify-between p-4 bg-gray-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selectedNewSlots.length >=
                      (subscription.slots?.length || 1)
                        ? "bg-emerald-100"
                        : "bg-amber-100"
                    }`}
                  >
                    <span
                      className={`font-bold ${
                        selectedNewSlots.length >=
                        (subscription.slots?.length || 1)
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }`}
                    >
                      {selectedNewSlots.length}/
                      {subscription.slots?.length || 1}
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">Selected</span>
                </div>
                {selectedNewSlots.length > 0 && (
                  <button
                    onClick={() => setSelectedNewSlots([])}
                    className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="max-h-[300px] overflow-y-auto space-y-4 pr-1">
                {daysToRender.map((day) => {
                  const daySlots = availableSlotsByDay.get(day) || [];
                  if (daySlots.length === 0) return null;

                  const availableCount = daySlots.filter(
                    (s) => !s.isReserved
                  ).length;

                  return (
                    <div
                      key={day}
                      className="border border-gray-200 rounded-2xl p-4 bg-gray-50"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-bold text-gray-800">{day}</h4>
                        <span className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                          {availableCount} available
                        </span>
                      </div>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {daySlots.map((slot) => {
                          const isSelected = isSlotSelected(slot.key);
                          const isReserved = slot.isReserved;

                          return (
                            <button
                              key={slot.key}
                              onClick={() => toggleSlot(slot)}
                              disabled={isReserved}
                              className={`relative p-3 rounded-xl border-2 transition-all text-center ${
                                isReserved
                                  ? "border-gray-200 bg-gray-100 cursor-not-allowed opacity-50"
                                  : isSelected
                                    ? "border-teal-500 bg-teal-50 scale-105 shadow-md"
                                    : "border-gray-200 bg-white hover:border-teal-300"
                              }`}
                            >
                              {isSelected && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                              )}
                              {isReserved && (
                                <Lock className="absolute top-1 right-1 w-3 h-3 text-gray-400" />
                              )}
                              <div className="text-sm font-bold text-gray-800">
                                {slot.start_time_12h}
                              </div>
                              <div className="text-[10px] text-gray-500">
                                to {slot.end_time_12h}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedNewSlots.length > 0 && (
                <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                  <h4 className="font-semibold text-teal-800 mb-2">
                    New Schedule
                  </h4>
                  <div className="grid gap-2">
                    {selectedNewSlots.map((slot, idx) => (
                      <div
                        key={slot.key}
                        className="flex items-center justify-between p-2 bg-white rounded-lg"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center text-xs font-bold text-teal-700">
                            {idx + 1}
                          </span>
                          <span className="font-medium">
                            {slot.day_of_week}
                          </span>
                          <span className="text-gray-500 text-sm">
                            {slot.start_time_12h} - {slot.end_time_12h}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleSlot(slot)}
                          className="text-rose-500 text-xs font-medium hover:bg-rose-50 px-2 py-1 rounded"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAcceptWithNewSchedule}
                  disabled={
                    loading ||
                    !selectedTeacherId ||
                    selectedNewSlots.length < (subscription.slots?.length || 1)
                  }
                  className="flex-1 bg-gradient-to-r from-emerald-600 to-green-600 text-white py-3.5 px-6 rounded-xl font-semibold hover:from-emerald-700 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                >
                  {loading ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Accept with New Schedule
                    </>
                  )}
                </button>
                <button
                  onClick={() => setStep("conflict")}
                  disabled={loading}
                  className="px-6 py-3.5 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ Group Selector with Ant Design
function GroupSelector({
  groups,
  groupsLoading,
  selectedGroupId,
  onGroupChange,
  originalGroupId,
}) {
  const groupChanged =
    selectedGroupId && String(selectedGroupId) !== String(originalGroupId);

  return (
    <div className="relative">
      <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
        <Users className="w-4 h-4 text-teal-600" />
        Group
        {groupChanged && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
            Changed
          </span>
        )}
      </label>

      <Select
        value={selectedGroupId || undefined}
        onChange={onGroupChange}
        loading={groupsLoading}
        disabled={groupsLoading || groups.length === 0}
        placeholder={
          groupsLoading
            ? "Loading groups..."
            : groups.length === 0
              ? "No groups available"
              : "Select Group"
        }
        showSearch
        filterOption={(input, option) =>
          (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
        }
        className="w-full"
        size="large"
        style={{ width: "100%" }}
      >
        {groups.map((group) => {
          const currentStudents = Number(group.group_students || 0);
          const maxStudents = Number(group.max_students || 0);
          const isFull = currentStudents >= maxStudents;

          return (
            <Option
              key={group.group_id}
              value={group.group_id}
              disabled={isFull}
              label={`${group.group_name} (${currentStudents}/${maxStudents})`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{group.group_name}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    isFull
                      ? "bg-rose-100 text-rose-700"
                      : "bg-emerald-100 text-emerald-700"
                  }`}
                >
                  {currentStudents}/{maxStudents} {isFull ? "FULL" : ""}
                </span>
              </div>
            </Option>
          );
        })}
      </Select>

      {/* Show selected group info */}
      {selectedGroupId && groups.length > 0 && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
          {(() => {
            const group = groups.find(
              (g) => String(g.group_id) === String(selectedGroupId)
            );
            if (!group) return null;

            const currentStudents = Number(group.group_students || 0);
            const maxStudents = Number(group.max_students || 0);
            const availableSlots = maxStudents - currentStudents;

            return (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 font-medium">Capacity:</span>
                  <span className="text-blue-900 font-semibold">
                    {currentStudents}/{maxStudents} students
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 font-medium">
                    Available slots:
                  </span>
                  <span
                    className={`font-semibold ${
                      availableSlots > 0 ? "text-emerald-600" : "text-rose-600"
                    }`}
                  >
                    {availableSlots} {availableSlots === 1 ? "slot" : "slots"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 font-medium">Start date:</span>
                  <span className="text-blue-900">{group.start_date}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-700 font-medium">Duration:</span>
                  <span className="text-blue-900">
                    {group.session_duration} min
                  </span>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ✅ Course & Teacher Selector with Ant Design
function CourseTeacherSelector({
  courses,
  teachers,
  coursesLoading,
  teachersLoading,
  selectedCourseId,
  selectedTeacherId,
  onCourseChange,
  onTeacherChange,
  originalCourseId,
  originalTeacherId,
}) {
  const courseChanged =
    selectedCourseId && String(selectedCourseId) !== String(originalCourseId);
  const teacherChanged =
    selectedTeacherId &&
    String(selectedTeacherId) !== String(originalTeacherId);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* Course Selection */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-teal-600" />
          Course
          {courseChanged && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              Changed
            </span>
          )}
        </label>

        <Select
          value={selectedCourseId || undefined}
          onChange={onCourseChange}
          loading={coursesLoading}
          disabled={coursesLoading}
          placeholder={coursesLoading ? "Loading courses..." : "Select Course"}
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          className="w-full"
          size="large"
          style={{ width: "100%" }}
        >
          {courses.map((course) => (
            <Option
              key={course.course_id}
              value={course.course_id}
              label={course.course_name}
            >
              {course.course_name}
            </Option>
          ))}
        </Select>
      </div>

      {/* Teacher Selection */}
      <div className="relative">
        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-teal-600" />
          Teacher
          {teacherChanged && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              Changed
            </span>
          )}
        </label>

        <Select
          value={selectedTeacherId || undefined}
          onChange={onTeacherChange}
          loading={teachersLoading}
          disabled={!selectedCourseId || teachersLoading}
          placeholder={
            !selectedCourseId
              ? "Select course first"
              : teachersLoading
                ? "Loading teachers..."
                : "Select Teacher"
          }
          showSearch
          filterOption={(input, option) =>
            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          className="w-full"
          size="large"
          style={{ width: "100%" }}
        >
          {teachers.map((teacher) => (
            <Option
              key={teacher.teacher_id}
              value={teacher.teacher_id}
              label={teacher.teacher_name}
            >
              {teacher.teacher_name}
            </Option>
          ))}
        </Select>
      </div>
    </div>
  );
}

function SubscriptionDetails({ subscription }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
          <User className="w-4 h-4" />
          Student
        </div>
        <p className="font-semibold text-gray-800">
          {subscription.student_name}
        </p>
        <p className="text-xs text-gray-500">{subscription.student_email}</p>
        <p className="text-xs text-gray-500">{subscription.phone}</p>
      </div>
      <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center gap-2 text-gray-500 text-xs mb-2">
          <Calendar className="w-4 h-4" />
          Start Date
        </div>
        <p className="font-semibold text-gray-800">
          {subscription.subscription_start_date}
        </p>
        <p className="text-xs text-gray-500">
          Type: {subscription.subscription_type}
        </p>
      </div>
    </div>
  );
}
