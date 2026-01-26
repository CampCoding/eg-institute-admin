"use client";

import React, { useState, useEffect } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Video,
  Calendar,
  Clock,
  Users,
  Plus,
  ExternalLink,
  Edit,
  Trash2,
  Copy,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  StopCircle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";
import {
  Modal,
  Input,
  Select,
  Form,
  Button,
  message,
  Popconfirm,
  DatePicker,
  TimePicker,
  Spin,
  Empty,
} from "antd";
import dayjs from "dayjs";
import axios from "axios";
import { BASE_URL } from "../../../../utils/base_url";

const { TextArea } = Input;
const { Option } = Select;

export default function MeetingsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [meetings, setMeetings] = useState([]);
  const [course, setCourse] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(null);

  // Week navigation state
  const [weekInfo, setWeekInfo] = useState({
    week_start: "",
    week_end: "",
    today: "",
    timeZone: "",
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;
  const admin_id =
    typeof window !== "undefined" ? localStorage.getItem("UserId") : null;

  // Fetch meetings from API
  const fetchMeetings = async (weekOffset = 0) => {
    setPageLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/courses/select_course_meetings.php`,
        {
          course_id: String(courseId),
          week_offset: weekOffset,
          admin_id: admin_id,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.data?.status === "success") {
        const data = response.data;

        // Set week info
        setWeekInfo({
          week_start: data.week_start || "",
          week_end: data.week_end || "",
          today: data.today || "",
          timeZone: data.timeZone || "",
        });

        // Transform API data to match UI structure
        const transformedMeetings = (data.group_lessons || []).map(
          (lesson) => ({
            id: lesson.schedule_id,
            session_id: lesson.session_id,
            title: `${lesson.group_name} - ${lesson.day_of_week}`,
            date: lesson.session_date,
            time: lesson.start_time?.slice(0, 5) || "00:00",
            endTime: lesson.end_time?.slice(0, 5) || "00:00",
            duration: calculateDuration(lesson.start_time, lesson.end_time),
            status: lesson.session_status || "active", // Default to active
            meetingLink: lesson.zoom_meeting_link || "",
            attendees: 0,
            maxAttendees: 50,
            description: `${lesson.course_name} - ${lesson.group_name}`,
            groupName: lesson.group_name,
            courseName: lesson.course_name,
            dayOfWeek: lesson.day_of_week,
            image: lesson.image,
          })
        );

        setMeetings(transformedMeetings);

        // Set course info from first meeting
        if (transformedMeetings.length > 0) {
          setCourse({
            id: courseId,
            title: transformedMeetings[0].courseName,
            image: transformedMeetings[0].image,
          });
        }
      } else {
        message.error(response?.data?.message || "Failed to fetch meetings");
      }
    } catch (error) {
      console.error("Error fetching meetings:", error);
      message.error("Failed to load meetings");
    } finally {
      setPageLoading(false);
    }
  };

  // Calculate duration in minutes from start and end time
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return 60;

    const [startH, startM] = startTime.split(":").map(Number);
    const [endH, endM] = endTime.split(":").map(Number);

    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    return endMinutes - startMinutes;
  };

  useEffect(() => {
    if (courseId) {
      fetchMeetings();
    }
  }, [courseId]);

  // Updated status handling - only active and deActive
  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700 border-green-200";
      case "deActive":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-green-100 text-green-700 border-green-200"; // Default to active
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />;
      case "deActive":
        return <XCircle className="w-4 h-4" />;
      default:
        return <CheckCircle className="w-4 h-4" />; // Default to active
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "active":
        return "Active";
      case "deActive":
        return "Inactive";
      default:
        return "Active"; // Default to active
    }
  };

  const copyMeetingLink = async (link, meetingId) => {
    if (!link) {
      message.warning("No meeting link available");
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopiedLink(meetingId);
      message.success("Meeting link copied to clipboard!");
      setTimeout(() => setCopiedLink(null), 2000);
    } catch (err) {
      console.error("Failed to copy link:", err);
      message.error("Failed to copy link");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatWeekRange = () => {
    if (!weekInfo.week_start || !weekInfo.week_end) return "";
    const start = new Date(weekInfo.week_start);
    const end = new Date(weekInfo.week_end);

    const startStr = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
    const endStr = end.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    return `${startStr} - ${endStr}`;
  };

  const isToday = (dateStr) => {
    return dateStr === weekInfo.today;
  };

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    setIsModalVisible(true);

    form.setFieldsValue({
      session_date: dayjs(meeting.date),
      zoom_meeting_link: meeting.meetingLink,
      status: meeting.status || "active",
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingMeeting(null);
    form.resetFields();
  };

  // Update session using update_session.php API
  const handleModalOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const payload = {
        session_id: editingMeeting.session_id,
        session_date: values.session_date.format("YYYY-MM-DD"),
        zoom_meeting_link: values.zoom_meeting_link || "",
        status: values.status || "active",
      };

      console.log("Update session payload:", payload);

      const response = await axios.post(
        `${BASE_URL}/courses/update_session.php`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.data?.status === "success") {
        message.success("Session updated successfully!");
        fetchMeetings();
        setIsModalVisible(false);
        setEditingMeeting(null);
        form.resetFields();
      } else {
        message.error(response?.data?.message || "Failed to update session");
      }
    } catch (error) {
      console.error("Error updating session:", error);
      message.error("Please check all required fields");
    } finally {
      setLoading(false);
    }
  };

  // Toggle status between active and deActive
  const handleStatusToggle = async (meeting) => {
    const newStatus = meeting.status === "active" ? "deActive" : "active";
    setStatusLoading(meeting.session_id);

    try {
      const payload = {
        session_id: meeting.session_id,
        session_date: meeting.date,
        zoom_meeting_link: meeting.meetingLink || "",
        status: newStatus,
      };

      console.log("Toggle status payload:", payload);

      const response = await axios.post(
        `${BASE_URL}/courses/update_session.php`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.data?.status === "success") {
        const statusText = newStatus === "active" ? "activated" : "deactivated";
        message.success(`Session ${statusText} successfully!`);
        fetchMeetings();
      } else {
        message.error(response?.data?.message || "Failed to update status");
      }
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Failed to update session status");
    } finally {
      setStatusLoading(null);
    }
  };

  // Updated stats calculations - only active and deActive
  const stats = {
    total: meetings.length,
    active: meetings.filter((m) => m.status === "active").length,
    inactive: meetings.filter((m) => m.status === "deActive").length,
  };

  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-slate-600 mt-4">Loading meetings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <BreadCrumb
        title="Course Meetings"
        child="Meetings"
        parent="Live Courses"
      />

      <div className="mt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              {course?.image && (
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
                  {course?.title || "Course Meetings"}
                </h1>
                {weekInfo.timeZone && (
                  <p className="text-slate-600 text-sm">
                    Timezone: {weekInfo.timeZone}
                  </p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              icon={<RefreshCw className="w-4 h-4" />}
              onClick={() => fetchMeetings()}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Week Navigation */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Calendar className="w-5 h-5 text-[var(--primary-color)]" />
              <div>
                <h3 className="font-semibold text-slate-900">
                  {formatWeekRange()}
                </h3>
                <p className="text-sm text-slate-600">
                  Today: {formatDate(weekInfo.today)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Updated Stats - only active and deActive */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Sessions</p>
                <p className="text-xl font-semibold">{stats.total}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Active Sessions</p>
                <p className="text-xl font-semibold">{stats.active}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <XCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Inactive Sessions</p>
                <p className="text-xl font-semibold">{stats.inactive}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Meetings List */}
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className={`bg-white rounded-2xl border p-4 sm:p-6 hover:shadow-lg transition-all duration-300 ${
                isToday(meeting.date)
                  ? "border-blue-300 bg-blue-50/30"
                  : "border-slate-200"
              } ${meeting.status === "deActive" ? "opacity-75" : ""}`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div className="flex-1">
                  {/* Header with image */}
                  <div className="flex items-start gap-3 mb-3">
                    {meeting.image && (
                      <img
                        src={meeting.image}
                        alt={meeting.courseName}
                        className="w-16 h-16 rounded-lg object-cover hidden sm:block"
                      />
                    )}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {meeting.groupName}
                        </h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            meeting.status
                          )}`}
                        >
                          {getStatusIcon(meeting.status)}
                          {getStatusText(meeting.status)}
                        </span>
                        {isToday(meeting.date) && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                            📅 Today
                          </span>
                        )}
                      </div>
                      <p className="text-slate-600 text-sm">
                        {meeting.courseName}
                      </p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {meeting.dayOfWeek}, {formatDate(meeting.date)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(meeting.time)} -{" "}
                        {formatTime(meeting.endTime)} ({meeting.duration} min)
                      </span>
                    </div>
                  </div>

                  {/* Meeting Link Display */}
                  {meeting.meetingLink && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <span className="text-slate-500">Meeting Link:</span>
                      <a
                        href={meeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate max-w-xs"
                      >
                        {meeting.meetingLink}
                      </a>
                    </div>
                  )}

                  {!meeting.meetingLink && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-amber-600">
                      <AlertCircle className="w-4 h-4" />
                      <span>No meeting link set</span>
                      <Button
                        size="small"
                        type="link"
                        onClick={() => handleEditMeeting(meeting)}
                        className="text-blue-600 p-0"
                      >
                        Add link
                      </Button>
                    </div>
                  )}
                </div>

                {/* Updated Actions - simplified for active/deActive only */}
                <div className="flex flex-wrap items-center gap-2">
                  {/* Join Meeting Button - only show for active sessions with links */}
                  {meeting.status === "active" && meeting.meetingLink && (
                    <a
                      href={meeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        type="primary"
                        size="small"
                        icon={<Video className="w-4 h-4" />}
                        className="bg-green-600 hover:bg-green-700 border-green-600"
                      >
                        Join Session
                      </Button>
                    </a>
                  )}

                  {/* Status Toggle Button */}
                  <Popconfirm
                    title={
                      meeting.status === "active"
                        ? "Are you sure you want to deactivate this session?"
                        : "Are you sure you want to activate this session?"
                    }
                    onConfirm={() => handleStatusToggle(meeting)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      size="small"
                      danger={meeting.status === "active"}
                      type={
                        meeting.status === "deActive" ? "primary" : "default"
                      }
                      icon={
                        statusLoading === meeting.session_id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : meeting.status === "active" ? (
                          <XCircle className="w-4 h-4" />
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )
                      }
                      loading={statusLoading === meeting.session_id}
                    >
                      {meeting.status === "active" ? "Deactivate" : "Activate"}
                    </Button>
                  </Popconfirm>

                  {/* Copy Link Button */}
                  <Button
                    size="small"
                    icon={
                      copiedLink === meeting.id ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )
                    }
                    onClick={() =>
                      copyMeetingLink(meeting.meetingLink, meeting.id)
                    }
                    title="Copy meeting link"
                    disabled={!meeting.meetingLink}
                  />

                  {/* Edit Button */}
                  <Button
                    size="small"
                    icon={<Edit className="w-4 h-4" />}
                    onClick={() => handleEditMeeting(meeting)}
                    title="Edit session"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {meetings.length === 0 && (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div>
                  <p className="text-lg font-medium text-slate-900 mb-2">
                    No meetings scheduled
                  </p>
                  <p className="text-slate-600 mb-6">
                    No sessions found for this week. Sessions are created
                    automatically from group schedules.
                  </p>
                </div>
              }
            />
          </div>
        )}
      </div>

      {/* Updated Edit Meeting Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-[var(--primary-color)]" />
            Edit Session
          </div>
        }
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={500}
        okText="Update Session"
      >
        <Form form={form} layout="vertical" className="mt-4">
          {/* Display Info (Read-only) */}
          {editingMeeting && (
            <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                {editingMeeting.image && (
                  <img
                    src={editingMeeting.image}
                    alt={editingMeeting.courseName}
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-slate-900">
                    {editingMeeting.groupName}
                  </p>
                  <p className="text-sm text-slate-600">
                    {editingMeeting.courseName}
                  </p>
                </div>
              </div>
              <div className="text-sm text-slate-600">
                <p>
                  📅 {editingMeeting.dayOfWeek} •{" "}
                  {formatTime(editingMeeting.time)} -{" "}
                  {formatTime(editingMeeting.endTime)}
                </p>
              </div>
            </div>
          )}

          <Form.Item
            name="session_date"
            label="Session Date"
            rules={[{ required: true, message: "Please select date" }]}
          >
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            name="zoom_meeting_link"
            label="Meeting Link (Zoom/Google Meet)"
            rules={[{ type: "url", message: "Please enter a valid URL" }]}
          >
            <Input
              placeholder="https://zoom.us/j/123456789"
              prefix={<Video className="w-4 h-4 text-slate-400" />}
            />
          </Form.Item>

          <Form.Item
            name="status"
            label="Status"
            rules={[{ required: true, message: "Please select status" }]}
          >
            <Select placeholder="Select status">
              <Option value="active">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  Active
                </div>
              </Option>
              <Option value="deActive">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-600" />
                  Inactive
                </div>
              </Option>
            </Select>
          </Form.Item>

          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              💡 <strong>Tip:</strong> Add the Zoom meeting link before the
              session starts so students can join. Only active sessions are
              visible to students.
            </p>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
