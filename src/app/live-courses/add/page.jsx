"use client";

import React, { useState } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Users,
  Video,
  Globe,
  Play,
  X,
} from "lucide-react";
import { Upload, Progress, Radio, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";

const { Dragger } = Upload;

export default function AddLiveCoursePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploading, setVideoUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    teacher: "",
    level: "Beginner",
    duration: "",
    price: "",
    maxStudents: "",
    meetingLink: "",
    schedule: "",
    timezone: "EST",
    poster: "",
    totalSessions: "",
    sessionDuration: "60",
    // New advertising video fields
    advertisingVideoType: "url", // 'url' or 'upload'
    advertisingVideoUrl: "",
    advertisingVideoFile: null,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVideoTypeChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      advertisingVideoType: e.target.value,
      advertisingVideoUrl: "",
      advertisingVideoFile: null,
    }));
    setVideoUploadProgress(0);
    setVideoUploading(false);
  };

  const handleVideoUpload = (file) => {
    // Validate file type
    const isVideo = file.type.startsWith("video/");
    if (!isVideo) {
      message.error("You can only upload video files!");
      return false;
    }

    // Validate file size (500MB limit)
    const isLt500M = file.size / 1024 / 1024 < 500;
    if (!isLt500M) {
      message.error("Video must be smaller than 500MB!");
      return false;
    }

    // Start upload simulation
    setVideoUploading(true);
    setVideoUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setVideoUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + Math.random() * 10;
      });
    }, 300);

    // Simulate upload completion
    setTimeout(() => {
      clearInterval(interval);
      setVideoUploadProgress(100);
      setVideoUploading(false);

      // Store the file in form data
      setFormData((prev) => ({
        ...prev,
        advertisingVideoFile: file,
      }));

      message.success(`${file.name} uploaded successfully!`);
    }, 3000);

    // Prevent default upload behavior
    return false;
  };

  const removeUploadedVideo = () => {
    setFormData((prev) => ({
      ...prev,
      advertisingVideoFile: null,
    }));
    setVideoUploadProgress(0);
    setVideoUploading(false);
  };

  const uploadProps = {
    name: "video",
    multiple: false,
    accept: "video/*",
    showUploadList: false,
    beforeUpload: handleVideoUpload,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create FormData for file upload
      const submitData = new FormData();

      // Add all form fields
      Object.keys(formData).forEach((key) => {
        if (key === "advertisingVideoFile" && formData[key]) {
          submitData.append("advertisingVideo", formData[key]);
        } else if (key !== "advertisingVideoFile") {
          submitData.append(key, formData[key]);
        }
      });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      console.log("Creating live course:", formData);
      console.log("Uploaded video file:", formData.advertisingVideoFile);

      // Redirect to live courses page
      router.push("/live-courses");
    } catch (error) {
      console.error("Error creating course:", error);
      message.error("Failed to create course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <BreadCrumb
        title="Add Live Course"
        child="Add Course"
        parent="Live Courses"
      />

      <div className="mt-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Create New Live Course
            </h1>
            <p className="text-slate-600">
              Set up a new live course with interactive sessions
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Course Information */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Video className="w-5 h-5 text-[var(--primary-color)]" />
              Course Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  placeholder="Enter course title"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  placeholder="Describe what students will learn in this live course"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Instructor *
                </label>
                <input
                  type="text"
                  name="teacher"
                  value={formData.teacher}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  placeholder="Instructor name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Level *
                </label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Duration *
                </label>
                <input
                  type="text"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  placeholder="e.g., 8 weeks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Price *
                </label>
                <input
                  type="text"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  placeholder="$299"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Course Image URL
                </label>
                <input
                  type="url"
                  name="poster"
                  value={formData.poster}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            </div>
          </div>

          {/* Advertising Video Section */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Play className="w-5 h-5 text-[var(--primary-color)]" />
              Advertising Video
            </h2>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-3">
                  Video Source
                </label>
                <Radio.Group
                  value={formData.advertisingVideoType}
                  onChange={handleVideoTypeChange}
                  className="space-x-6"
                >
                  <Radio value="url">Video URL</Radio>
                  <Radio value="upload">Upload Video</Radio>
                </Radio.Group>
              </div>

              {formData.advertisingVideoType === "url" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Video URL
                  </label>
                  <input
                    type="url"
                    name="advertisingVideoUrl"
                    value={formData.advertisingVideoUrl}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Supported: YouTube, Vimeo, or direct video file URLs
                  </p>
                </div>
              )}

              {formData.advertisingVideoType === "upload" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Upload Video File
                  </label>

                  {!formData.advertisingVideoFile && (
                    <Dragger
                      {...uploadProps}
                      className="border-2 border-dashed border-slate-300 rounded-xl hover:border-[var(--primary-color)]"
                    >
                      <p className="ant-upload-drag-icon">
                        <InboxOutlined
                          style={{ fontSize: "48px", color: "#9ca3af" }}
                        />
                      </p>
                      <p className="ant-upload-text text-lg font-medium text-slate-700">
                        Click or drag video file to this area to upload
                      </p>
                      <p className="ant-upload-hint text-slate-500">
                        Support for MP4, AVI, MOV, WMV formats. Maximum file
                        size: 500MB
                      </p>
                    </Dragger>
                  )}

                  {videoUploading && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-blue-700">
                          Uploading video...
                        </span>
                        <span className="text-sm text-blue-600">
                          {Math.round(videoUploadProgress)}%
                        </span>
                      </div>
                      <Progress
                        percent={videoUploadProgress}
                        status="active"
                        strokeColor="#3b82f6"
                        className="mb-2"
                      />
                    </div>
                  )}

                  {formData.advertisingVideoFile && !videoUploading && (
                    <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Video className="w-5 h-5 text-green-600" />
                          <div>
                            <p className="font-medium text-green-900">
                              {formData.advertisingVideoFile.name}
                            </p>
                            <p className="text-sm text-green-700">
                              {(
                                formData.advertisingVideoFile.size /
                                (1024 * 1024)
                              ).toFixed(2)}{" "}
                              MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={removeUploadedVideo}
                          className="p-1 rounded-full hover:bg-green-200 transition-colors"
                        >
                          <X className="w-4 h-4 text-green-600" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Session Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--primary-color)]" />
              Session Settings
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Total Sessions *
                </label>
                <input
                  type="number"
                  name="totalSessions"
                  value={formData.totalSessions}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  placeholder="16"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Session Duration (minutes) *
                </label>
                <select
                  name="sessionDuration"
                  value={formData.sessionDuration}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Schedule *
                </label>
                <input
                  type="text"
                  name="schedule"
                  value={formData.schedule}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  placeholder="Mon, Wed, Fri - 10:00 AM"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Timezone *
                </label>
                <select
                  name="timezone"
                  value={formData.timezone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                >
                  <option value="EST">Eastern Time (EST)</option>
                  <option value="CST">Central Time (CST)</option>
                  <option value="MST">Mountain Time (MST)</option>
                  <option value="PST">Pacific Time (PST)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </div>

          {/* Meeting & Capacity Settings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--primary-color)]" />
              Meeting & Capacity
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Maximum Students *
                </label>
                <input
                  type="number"
                  name="maxStudents"
                  value={formData.maxStudents}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="100"
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                  placeholder="50"
                />
              </div>
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-blue-900">
                    Meeting Link Info
                  </h3>
                  <p className="text-sm text-blue-700 mt-1">
                    You can add the meeting link now or set it up later.
                    Individual session links can be managed in the Meetings
                    section.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center gap-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || videoUploading}
              className="px-8 py-3 bg-[var(--primary-color)] text-white rounded-xl font-medium hover:opacity-90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Live Course"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
