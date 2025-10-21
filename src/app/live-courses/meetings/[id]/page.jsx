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
} from "antd";
import dayjs from "dayjs";

const { TextArea } = Input;
const { Option } = Select;

// Mock data for meetings
const mockMeetings = [
  {
    id: 1,
    title: "Session 1: Introduction to Advanced JavaScript",
    date: "2024-01-15",
    time: "10:00",
    duration: 60,
    status: "scheduled",
    meetingLink: "https://zoom.us/j/123456789",
    attendees: 0,
    maxAttendees: 50,
    description: "Course introduction and overview of advanced concepts",
  },
  {
    id: 2,
    title: "Session 2: ES6+ Features Deep Dive",
    date: "2024-01-17",
    time: "10:00",
    duration: 60,
    status: "finished",
    meetingLink: "https://zoom.us/j/123456789",
    attendees: 45,
    maxAttendees: 50,
    description:
      "Arrow functions, destructuring, and modern JavaScript features",
  },
  {
    id: 3,
    title: "Session 3: Async JavaScript & Promises",
    date: "2024-01-19",
    time: "10:00",
    duration: 60,
    status: "started",
    meetingLink: "https://zoom.us/j/123456789",
    attendees: 42,
    maxAttendees: 50,
    description: "Understanding asynchronous programming patterns",
  },
];

export default function MeetingsPage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [meetings, setMeetings] = useState(mockMeetings);
  const [course, setCourse] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [copiedLink, setCopiedLink] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Load course data based on courseId
    setCourse({
      id: courseId,
      title: "Advanced JavaScript Masterclass",
      teacher: "Sarah Johnson",
    });
  }, [courseId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "started":
        return "bg-red-100 text-red-700 border-red-200";
      case "finished":
        return "bg-green-100 text-green-700 border-green-200";
      case "scheduled":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "started":
        return <PlayCircle className="w-4 h-4" />;
      case "finished":
        return <CheckCircle className="w-4 h-4" />;
      case "scheduled":
        return <Calendar className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "started":
        return "Started";
      case "finished":
        return "Finished";
      case "scheduled":
        return "Scheduled";
      default:
        return "Unknown";
    }
  };

  const copyMeetingLink = async (link, meetingId) => {
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
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":");
    const date = new Date();
    date.setHours(parseInt(hours), parseInt(minutes));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const handleAddMeeting = () => {
    setEditingMeeting(null);
    setIsModalVisible(true);
    form.resetFields();
  };

  const handleEditMeeting = (meeting) => {
    setEditingMeeting(meeting);
    setIsModalVisible(true);

    // Set form values
    form.setFieldsValue({
      title: meeting.title,
      date: dayjs(meeting.date),
      time: dayjs(meeting.time, "HH:mm"),
      duration: meeting.duration,
      meetingLink: meeting.meetingLink,
      description: meeting.description,
      status: meeting.status,
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setEditingMeeting(null);
    form.resetFields();
  };

  const handleModalOk = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();

      const meetingData = {
        id: editingMeeting ? editingMeeting.id : Date.now(),
        title: values.title,
        date: values.date.format("YYYY-MM-DD"),
        time: values.time.format("HH:mm"),
        duration: values.duration,
        meetingLink: values.meetingLink,
        description: values.description,
        status: values.status || "scheduled",
        attendees: editingMeeting ? editingMeeting.attendees : 0,
        maxAttendees: 50,
      };

      if (editingMeeting) {
        // Update existing meeting
        setMeetings((prev) =>
          prev.map((meeting) =>
            meeting.id === editingMeeting.id ? meetingData : meeting
          )
        );
        message.success("Meeting updated successfully!");
      } else {
        // Add new meeting
        setMeetings((prev) => [...prev, meetingData]);
        message.success("Meeting created successfully!");
      }

      setIsModalVisible(false);
      setEditingMeeting(null);
      form.resetFields();
    } catch (error) {
      console.error("Validation failed:", error);
      message.error("Please check all required fields");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeeting = (meetingId) => {
    setMeetings((prev) => prev.filter((meeting) => meeting.id !== meetingId));
    message.success("Meeting deleted successfully!");
  };

  const handleStatusChange = (meetingId, newStatus) => {
    setMeetings((prev) =>
      prev.map((meeting) =>
        meeting.id === meetingId ? { ...meeting, status: newStatus } : meeting
      )
    );

    const statusText = newStatus === "started" ? "started" : "finished";
    message.success(`Meeting ${statusText} successfully!`);
  };

  return (
    <div className="min-h-screen">
      <BreadCrumb
        title="Course Meetings"
        child="Meetings"
        parent="Live Courses"
      />

      <div className="mt-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900">
              {course?.title} - Meetings
            </h1>
            <p className="text-slate-600">Instructor: {course?.teacher}</p>
          </div>
          <Button
            type="primary"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleAddMeeting}
            className="flex items-center gap-2"
          >
            Add Meeting
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Sessions</p>
                <p className="text-xl font-semibold">{meetings.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Finished</p>
                <p className="text-xl font-semibold">
                  {meetings.filter((m) => m.status === "finished").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <PlayCircle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Started</p>
                <p className="text-xl font-semibold">
                  {meetings.filter((m) => m.status === "started").length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-600">Avg. Attendance</p>
                <p className="text-xl font-semibold">42</p>
              </div>
            </div>
          </div>
        </div>

        {/* Meetings List */}
        <div className="space-y-4">
          {meetings.map((meeting) => (
            <div
              key={meeting.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {meeting.title}
                    </h3>
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        meeting.status
                      )}`}
                    >
                      {getStatusIcon(meeting.status)}
                      {getStatusText(meeting.status)}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm mb-3">
                    {meeting.description}
                  </p>

                  <div className="flex items-center gap-6 text-sm text-slate-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(meeting.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      <span>
                        {formatTime(meeting.time)} ({meeting.duration} min)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>
                        {meeting.attendees}/{meeting.maxAttendees}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {/* Status Action Buttons */}
                  {meeting.status === "scheduled" && (
                    <Button
                      type="primary"
                      danger
                      size="small"
                      icon={<PlayCircle className="w-4 h-4" />}
                      onClick={() => handleStatusChange(meeting.id, "started")}
                    >
                      Start Meeting
                    </Button>
                  )}

                  {meeting.status === "started" && (
                    <>
                      <a
                        href={meeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Button
                          type="primary"
                          danger
                          size="small"
                          icon={<Video className="w-4 h-4" />}
                        >
                          Join Live
                        </Button>
                      </a>
                      <Button
                        size="small"
                        icon={<StopCircle className="w-4 h-4" />}
                        onClick={() =>
                          handleStatusChange(meeting.id, "finished")
                        }
                      >
                        Finish
                      </Button>
                    </>
                  )}

                  {meeting.status === "scheduled" && (
                    <a
                      href={meeting.meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        type="primary"
                        size="small"
                        icon={<ExternalLink className="w-4 h-4" />}
                      >
                        Join
                      </Button>
                    </a>
                  )}

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
                  />

                  <Button
                    size="small"
                    icon={<Edit className="w-4 h-4" />}
                    onClick={() => handleEditMeeting(meeting)}
                    title="Edit meeting"
                  />

                  <Popconfirm
                    title="Delete Meeting"
                    description="Are you sure you want to delete this meeting?"
                    onConfirm={() => handleDeleteMeeting(meeting.id)}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button
                      size="small"
                      danger
                      icon={<Trash2 className="w-4 h-4" />}
                      title="Delete meeting"
                    />
                  </Popconfirm>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {meetings.length === 0 && (
          <div className="text-center py-12">
            <Video className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              No meetings scheduled
            </h3>
            <p className="text-slate-600 mb-6">
              Create your first meeting to get started
            </p>
            <Button type="primary" size="large" onClick={handleAddMeeting}>
              Add First Meeting
            </Button>
          </div>
        )}
      </div>

      {/* Add/Edit Meeting Modal */}
      <Modal
        title={editingMeeting ? "Edit Meeting" : "Add New Meeting"}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={600}
        okText={editingMeeting ? "Update Meeting" : "Create Meeting"}
      >
        <Form form={form} layout="vertical" className="mt-4">
          <Form.Item
            name="title"
            label="Meeting Title"
            rules={[{ required: true, message: "Please enter meeting title" }]}
          >
            <Input placeholder="Session title" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="date"
              label="Date"
              rules={[{ required: true, message: "Please select date" }]}
            >
              <DatePicker className="w-full" />
            </Form.Item>

            <Form.Item
              name="time"
              label="Time"
              rules={[{ required: true, message: "Please select time" }]}
            >
              <TimePicker className="w-full" format="HH:mm" />
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="duration"
              label="Duration (minutes)"
              rules={[{ required: true, message: "Please select duration" }]}
            >
              <Select placeholder="Select duration">
                <Option value={30}>30 minutes</Option>
                <Option value={45}>45 minutes</Option>
                <Option value={60}>60 minutes</Option>
                <Option value={90}>90 minutes</Option>
                <Option value={120}>120 minutes</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="status"
              label="Status"
              rules={[{ required: true, message: "Please select status" }]}
            >
              <Select placeholder="Select status" defaultValue="scheduled">
                <Option value="scheduled">Scheduled</Option>
                <Option value="started">Started</Option>
                <Option value="finished">Finished</Option>
              </Select>
            </Form.Item>
          </div>

          <Form.Item
            name="meetingLink"
            label="Meeting Link"
            rules={[
              { required: true, message: "Please enter meeting link" },
              { type: "url", message: "Please enter a valid URL" },
            ]}
          >
            <Input placeholder="https://zoom.us/j/123456789" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: "Please enter description" }]}
          >
            <TextArea rows={3} placeholder="Meeting description or agenda" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
