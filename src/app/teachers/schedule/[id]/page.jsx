"use client";
import React, { useState, useEffect } from "react";
import {
  Modal,
  Input,
  Switch,
  Button,
  Select,
  TimePicker,
  Form,
  message,
} from "antd";
import moment from "moment";
import { PlusIcon } from "lucide-react";

import "./schedule.css";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

const { Option } = Select;

// Simple Loader Component
const Loader = () => {
  return (
    <div className="loader-container">
      <div className="loader-spinner">
        <Loader2 className="animate-spin" />
      </div>
      <p className="loader-text">Loading...</p>
    </div>
  );
};

const Schedule = () => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [lessons, setLessons] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [weekRange, setWeekRange] = useState({
    start: "",
    end: "",
  });
  const [rowData, setRowData] = useState(null);
  const [showZoomModal, setShowZoomModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [addLessonForm] = Form.useForm();

  const daysOfWeek = [
    "Saturday",
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
  ];

  // Mock Data
  const mockLessons = [
    {
      lesson_id: "1",
      lesson_title: "Mathematics Class",
      course_id: "math_101",
      course_name: "Mathematics - Grade 10",
      lesson_date: moment().startOf("week").add(0, "days").format("YYYY-MM-DD"),
      start_time: "09:00:00",
      end_time: "10:30:00",
      duration: 90,
      description: "Group Type: Small Group",
      group_type: "small_group",
      request_type: "scheduled",
      student_id: "student_1",
      is_group: false,
      status: "Active",
      zoom_meeting_link: "https://zoom.us/j/123456789",
    },
    {
      lesson_id: "2",
      lesson_title: "Physics Class",
      course_id: "physics_101",
      course_name: "Physics - Grade 11",
      lesson_date: moment().startOf("week").add(0, "days").format("YYYY-MM-DD"),
      start_time: "11:00:00",
      end_time: "12:00:00",
      duration: 60,
      description: "Group Type: Individual Session",
      group_type: "individual",
      request_type: "scheduled",
      student_id: "student_2",
      is_group: false,
      status: "Active",
      zoom_meeting_link: "",
    },
    {
      lesson_id: "3",
      lesson_title: "Advanced Chemistry Group",
      course_id: "group_chemistry",
      course_name: "Chemistry Group - Advanced Chemistry",
      lesson_date: moment().startOf("week").add(1, "days").format("YYYY-MM-DD"),
      start_time: "14:00:00",
      end_time: "15:30:00",
      duration: 90,
      description: "Advanced chemistry group for top students",
      group_type: "group",
      request_type: "scheduled",
      is_group: true,
      group_id: "chem_group_1",
      status: "Active",
      zoom_meeting_link: "https://zoom.us/j/987654321",
    },
    {
      lesson_id: "4",
      lesson_title: "Biology Class",
      course_id: "biology_101",
      course_name: "Biology - Grade 12",
      lesson_date: moment().startOf("week").add(2, "days").format("YYYY-MM-DD"),
      start_time: "10:00:00",
      end_time: "11:30:00",
      duration: 90,
      description: "Group Type: Large Group",
      group_type: "large_group",
      request_type: "scheduled",
      student_id: "student_3",
      is_group: false,
      status: "dnActive",
      zoom_meeting_link: "",
    },
    {
      lesson_id: "5",
      lesson_title: "English Class",
      course_id: "english_101",
      course_name: "English Language - Intermediate Level",
      lesson_date: moment().startOf("week").add(3, "days").format("YYYY-MM-DD"),
      start_time: "16:00:00",
      end_time: "17:00:00",
      duration: 60,
      description: "Group Type: Individual Session",
      group_type: "individual",
      request_type: "scheduled",
      student_id: "student_4",
      is_group: false,
      status: "Active",
      zoom_meeting_link: "https://zoom.us/j/555666777",
    },
    {
      lesson_id: "6",
      lesson_title: "History Group",
      course_id: "group_history",
      course_name: "History Group - Modern History",
      lesson_date: moment().startOf("week").add(4, "days").format("YYYY-MM-DD"),
      start_time: "13:00:00",
      end_time: "14:00:00",
      duration: 60,
      description: "History group for secondary level",
      group_type: "group",
      request_type: "scheduled",
      is_group: true,
      group_id: "history_group_1",
      status: "Active",
      zoom_meeting_link: "",
    },
  ];

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = () => {
    setLoading(true);

    setTimeout(() => {
      const timeSlotSet = new Set();
      mockLessons.forEach((lesson) => {
        const start = moment(lesson.start_time, "HH:mm:ss");
        const end = moment(lesson.end_time, "HH:mm:ss");
        const timeSlot = `${start.format("H:mm")} - ${end.format("H:mm")}`;
        timeSlotSet.add(timeSlot);
      });

      const extractedTimeSlots = Array.from(timeSlotSet).sort((a, b) => {
        const startTimeA = moment(a.split(" - ")[0], "H:mm");
        const startTimeB = moment(b.split(" - ")[0], "H:mm");
        return startTimeA.diff(startTimeB);
      });

      setTimeSlots(extractedTimeSlots);
      setLessons(mockLessons);
      setWeekRange({
        start: moment().startOf("week").format("YYYY-MM-DD"),
        end: moment().endOf("week").format("YYYY-MM-DD"),
      });
      setLoading(false);
    }, 1500);
  };

  // Check if time slot is available
  const checkTimeSlotAvailability = (selectedDay, startTime, endTime) => {
    const dayIndex = daysOfWeek.indexOf(selectedDay);
    if (dayIndex === -1) return { available: true, conflictingLessons: [] };

    const startOfWeek = moment(
      weekRange.start || moment().format("YYYY-MM-DD")
    );
    const selectedDate = startOfWeek
      .clone()
      .add(dayIndex, "days")
      .format("YYYY-MM-DD");

    const newStart = moment(startTime, "HH:mm:ss");
    const newEnd = moment(endTime, "HH:mm:ss");

    const conflictingLessons = lessons.filter((lesson) => {
      if (lesson.lesson_date !== selectedDate) return false;

      const lessonStart = moment(lesson.start_time, "HH:mm:ss");
      const lessonEnd = moment(lesson.end_time, "HH:mm:ss");

      // Check for time overlap
      return (
        (newStart.isBefore(lessonEnd) && newEnd.isAfter(lessonStart)) ||
        (lessonStart.isBefore(newEnd) && lessonEnd.isAfter(newStart))
      );
    });

    return {
      available: conflictingLessons.length === 0,
      conflictingLessons: conflictingLessons,
    };
  };

  const setLinktoLesson = async () => {
    try {
      setSubmitting(true);

      setTimeout(() => {
        const updatedLessons = lessons.map((lesson) =>
          lesson.lesson_id === rowData.lesson_id
            ? { ...lesson, zoom_meeting_link: rowData.zoom_meeting_link }
            : lesson
        );
        setLessons(updatedLessons);

        toast.success("Link updated successfully");
        setShowZoomModal(false);
        setSubmitting(false);
      }, 1000);
    } catch (error) {
      console.log(error);
      setSubmitting(false);
    }
  };

  const setLessonStatus = async (status) => {
    try {
      setSubmitting(true);

      setTimeout(() => {
        const updatedLessons = lessons.map((lesson) =>
          lesson.lesson_id === rowData.lesson_id
            ? { ...lesson, status: status ? "Active" : "dnActive" }
            : lesson
        );
        setLessons(updatedLessons);

        toast.success(
          `Lesson ${status ? "activated" : "deactivated"} successfully`
        );
        setShowZoomModal(false);
        setSubmitting(false);
      }, 1000);
    } catch (error) {
      console.log(error);
      setSubmitting(false);
    }
  };

  const handleSaveZoomSettings = async () => {
    try {
      setSubmitting(true);

      if (rowData.zoom_meeting_link !== rowData.original_zoom_meeting_link) {
        await setLinktoLesson();
      }

      if (rowData.original_active != rowData.is_active) {
        await setLessonStatus(rowData.is_active);
      }

      setShowZoomModal(false);
    } catch (error) {
      console.log(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenZoomModal = (lesson) => {
    setRowData({
      ...lesson,
      zoom_meeting_link: lesson.zoom_meeting_link || "",
      is_active: lesson.status == "Active",
      original_zoom_meeting_link: lesson.zoom_meeting_link,
      original_active: lesson.status == "Active",
    });
    setShowZoomModal(true);
  };

  const handleAddLesson = async (values) => {
    try {
      setSubmitting(true);

      const { day, start_time, end_time, course_name, group_type } = values;

      const startTimeFormatted = start_time.format("HH:mm:ss");
      const endTimeFormatted = end_time.format("HH:mm:ss");

      const availability = checkTimeSlotAvailability(
        day,
        startTimeFormatted,
        endTimeFormatted
      );

      if (!availability.available) {
        toast.error(
          `Time slot is not available! Conflicting with: ${availability.conflictingLessons
            .map((lesson) => lesson.course_name)
            .join(", ")}`
        );
        setSubmitting(false);
        return;
      }

      // Simulate API call
      setTimeout(() => {
        const dayIndex = daysOfWeek.indexOf(day);
        const startOfWeek = moment(weekRange.start);
        const lessonDate = startOfWeek
          .clone()
          .add(dayIndex, "days")
          .format("YYYY-MM-DD");

        const duration = moment(end_time).diff(moment(start_time), "minutes");

        const newLesson = {
          lesson_id: `${Date.now()}`,
          lesson_title: `${course_name} Class`,
          course_id: `course_${Date.now()}`,
          course_name: course_name,
          lesson_date: lessonDate,
          start_time: startTimeFormatted,
          end_time: endTimeFormatted,
          duration: duration,
          description: `Group Type: ${group_type}`,
          group_type: group_type,
          request_type: "scheduled",
          student_id: "new_student",
          is_group: group_type === "group",
          status: "Active",
          zoom_meeting_link: "",
        };

        setLessons([...lessons, newLesson]);

        // Update time slots
        const start = moment(startTimeFormatted, "HH:mm:ss");
        const end = moment(endTimeFormatted, "HH:mm:ss");
        const newTimeSlot = `${start.format("H:mm")} - ${end.format("H:mm")}`;

        if (!timeSlots.includes(newTimeSlot)) {
          const updatedTimeSlots = [...timeSlots, newTimeSlot].sort((a, b) => {
            const startTimeA = moment(a.split(" - ")[0], "H:mm");
            const startTimeB = moment(b.split(" - ")[0], "H:mm");
            return startTimeA.diff(startTimeB);
          });
          setTimeSlots(updatedTimeSlots);
        }

        toast.success("Lesson added successfully!");
        setShowAddLessonModal(false);
        addLessonForm.resetFields();
        setSubmitting(false);
      }, 1000);
    } catch (error) {
      console.log(error);
      toast.error("Error adding lesson");
      setSubmitting(false);
    }
  };

  const getLessonsForSlot = (day, timeSlot) => {
    const dayIndex = daysOfWeek.indexOf(day);
    if (dayIndex === -1) return [];

    const startOfWeek = moment(
      weekRange.start || moment().format("YYYY-MM-DD")
    );
    const dayDate = startOfWeek
      .clone()
      .add(dayIndex, "days")
      .format("YYYY-MM-DD");

    const [slotStartTime, slotEndTime] = timeSlot.split(" - ");
    const slotStart = moment(slotStartTime, "H:mm");
    const slotEnd = moment(slotEndTime, "H:mm");

    return lessons.filter((lesson) => {
      if (lesson.lesson_date !== dayDate) return false;

      const lessonStart = moment(lesson.start_time, "HH:mm:ss");
      const lessonEnd = moment(lesson.end_time, "HH:mm:ss");

      return (
        lessonStart.format("H:mm") === slotStart.format("H:mm") &&
        lessonEnd.format("H:mm") === slotEnd.format("H:mm")
      );
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours > 0 ? `${hours} Hours` : ""} ${
      mins > 0 ? `${mins} Minutes` : ""
    }`.trim();
  };

  const getLessonTypeClass = (lesson) => {
    if (lesson.is_group) return "group-lesson";
    if (lesson.group_type === "individual") return "individual-lesson";
    if (lesson.group_type === "small_group") return "small-group-lesson";
    if (lesson.group_type === "large_group") return "large-group-lesson";
    return "";
  };

  return (
    <div className="schedule-wrapper">
      <div className="schedule-header-section">
        <div className="flex justify-between items-center">
          <h1 className="schedule-main-title">Schedule Lessons</h1>
          <Button
            type="primary"
            icon={<PlusIcon className="w-4 h-4" />}
            onClick={() => setShowAddLessonModal(true)}
            className="add-lesson-btn"
            size="large"
          >
            Add Lesson
          </Button>
        </div>
      </div>

      <div className="page_content">
        {loading ? (
          <Loader />
        ) : (
          <div className="schedule-content">
            <div className="week-info">
              <h3 className="week-title">
                Week Schedule : {moment(weekRange.start).format("YYYY/MM/DD")} -{" "}
                {moment(weekRange.end).format("YYYY/MM/DD")}
              </h3>
            </div>

            <div className="schedule-container">
              <div className="schedule-grid">
                <div className="schedule-header">
                  <div className="schedule-cell day-header">Day / Time</div>
                  {timeSlots.map((slot, index) => (
                    <div key={index} className="schedule-cell time-header">
                      {slot}
                    </div>
                  ))}
                </div>

                {daysOfWeek.map((day, dayIndex) => (
                  <div key={dayIndex} className="schedule-row">
                    <div className="schedule-cell day-cell">{day}</div>
                    {timeSlots.map((slot, slotIndex) => {
                      const slotLessons = getLessonsForSlot(day, slot);

                      return (
                        <div
                          key={slotIndex}
                          className="schedule-cell time-cell"
                        >
                          {slotLessons.map((lesson, lessonIndex) => (
                            <div
                              onClick={() => handleOpenZoomModal(lesson)}
                              key={lessonIndex}
                              className={`lesson-card ${getLessonTypeClass(
                                lesson
                              )} ${
                                lesson.status === "dnActive"
                                  ? "inactive-lesson"
                                  : ""
                              }`}
                            >
                              <div className="lesson-title">
                                {lesson.course_name}
                              </div>
                              <div className="lesson-time">
                                {moment(lesson.start_time, "HH:mm:ss").format(
                                  "hh:mm A"
                                )}
                                <span className="lesson-duration">
                                  ({formatDuration(lesson.duration)})
                                </span>
                              </div>
                              <div className="lesson-group-type">
                                {lesson.is_group
                                  ? "Group"
                                  : lesson.group_type === "small_group"
                                  ? "Small Group"
                                  : lesson.group_type === "individual"
                                  ? "Individual"
                                  : "Large Group"}
                              </div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        title={`Lesson Settings: ${rowData?.course_name || ""}`}
        open={showZoomModal}
        onCancel={() => setShowZoomModal(false)}
        className="custom-modal"
        centered
        closeIcon={<span className="modal-close-btn">×</span>}
        footer={
          <>
            <div className="w-full flex justify-end">
              <button
                onClick={handleSaveZoomSettings}
                className="modal-submit-button"
                disabled={submitting}
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <Loader2 className="animate-spin" />
                  </div>
                ) : (
                  "Save Settings"
                )}
              </button>
            </div>
          </>
        }
      >
        <div className="custom-form">
          <div className="form-group">
            <label className="form-label" htmlFor="zoom_link">
              Meeting Link
            </label>
            <Input
              id="zoom_link"
              className="custom-input"
              size="large"
              placeholder="Enter meeting link for the lesson"
              value={rowData?.zoom_meeting_link}
              onChange={(e) => {
                setRowData({
                  ...rowData,
                  zoom_meeting_link: e.target.value,
                });
              }}
            />
          </div>
          <div className="form-group mt-4">
            <label className="form-label mb-2 block" htmlFor="lesson_status">
              Lesson Status
            </label>
            <div className="flex items-center">
              <Switch
                id="lesson_status"
                checked={rowData?.is_active}
                onChange={(checked) => {
                  setRowData({
                    ...rowData,
                    is_active: checked,
                  });
                }}
              />
              <span className="ml-2">
                {rowData?.is_active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>
      </Modal>

      {/* Add Lesson Modal */}
      <Modal
        title="Add New Lesson"
        open={showAddLessonModal}
        onCancel={() => {
          setShowAddLessonModal(false);
          addLessonForm.resetFields();
        }}
        className="custom-modal add-lesson-modal"
        centered
        width={600}
        footer={null}
        closeIcon={<span className="modal-close-btn">×</span>}
      >
        <Form
          form={addLessonForm}
          layout="vertical"
          onFinish={handleAddLesson}
          className="add-lesson-form"
        >
          <div className="form-row">
            <Form.Item
              label="Day"
              name="day"
              rules={[{ required: true, message: "Please select a day!" }]}
              className="form-item-half"
            >
              <Select
                placeholder="Select day"
                className="custom-select"
                size="large"
              >
                {daysOfWeek.map((day) => (
                  <Option key={day} value={day}>
                    {day}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Course Name"
              name="course_name"
              rules={[{ required: true, message: "Please enter course name!" }]}
              className="form-item-half"
            >
              <Input
                placeholder="Enter course name"
                className="custom-input"
                size="large"
              />
            </Form.Item>
          </div>

          <div className="form-row">
            <Form.Item
              label="Start Time"
              name="start_time"
              rules={[{ required: true, message: "Please select start time!" }]}
              className="form-item-half"
            >
              <TimePicker
                placeholder="Select start time"
                className="custom-time-picker"
                format="HH:mm"
                size="large"
                minuteStep={15}
              />
            </Form.Item>

            <Form.Item
              label="End Time"
              name="end_time"
              rules={[
                { required: true, message: "Please select end time!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    const startTime = getFieldValue("start_time");
                    if (!value || !startTime) {
                      return Promise.resolve();
                    }
                    if (value.isAfter(startTime)) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("End time must be after start time!")
                    );
                  },
                }),
              ]}
              className="form-item-half"
            >
              <TimePicker
                placeholder="Select end time"
                className="custom-time-picker"
                format="HH:mm"
                size="large"
                minuteStep={15}
              />
            </Form.Item>
          </div>

          <Form.Item
            label="Group Type"
            name="group_type"
            rules={[{ required: true, message: "Please select group type!" }]}
          >
            <Select
              placeholder="Select group type"
              className="custom-select"
              size="large"
            >
              <Option value="individual">Individual</Option>
              <Option value="small_group">Small Group</Option>
              <Option value="large_group">Large Group</Option>
              <Option value="group">Group</Option>
            </Select>
          </Form.Item>

          <div className="modal-footer">
            <Button
              onClick={() => {
                setShowAddLessonModal(false);
                addLessonForm.resetFields();
              }}
              className="cancel-button"
              size="large"
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={submitting}
              className="submit-button"
              size="large"
            >
              Add Lesson
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default Schedule;
