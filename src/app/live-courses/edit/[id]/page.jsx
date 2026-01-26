"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import {
  Loader2,
  Save,
  Plus,
  X,
  ArrowLeft,
  Upload,
  Play,
  Link,
  Calendar,
  Clock,
  Users,
  Video,
  Globe,
  DollarSign,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";
import { Spin } from "antd";
import { BASE_URL } from "../../../../utils/base_url";

const LEVELS = ["beginner", "intermediate", "advanced"];

const uploadType = {
  link: "link",
  file: "file",
};

export default function EditLiveCoursePage() {
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  const [loading, setLoading] = useState(false);
  const [courseLoading, setCourseLoading] = useState(true);

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [advertisingVideoFile, setAdvertisingVideoFile] = useState(null);
  const [imageMode, setImageMode] = useState(uploadType.link);
  const [videoMode, setVideoMode] = useState(uploadType.link);
  const [adVideoMode, setAdVideoMode] = useState(uploadType.link);

  // Learning points and features as arrays
  const [learnPoints, setLearnPoints] = useState([]);
  const [features, setFeatures] = useState([]);

  const [formData, setFormData] = useState({
    course_id: "",
    type: "online",
    course_name: "",
    course_description: "",
    overview: "",
    level: "beginner",
    Duration: "",
    lessons: "",
    group_price: "",
    private_price: "",
    image: "",
    video: "",
    advertising_video: "",
    hidden: "0",
  });

  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;

  useEffect(() => {
    if (courseId) {
      fetchCourse();
    }
  }, [courseId]);

  const fetchCourse = async () => {
    setCourseLoading(true);
    try {
      const response = await axios.get(
        `${BASE_URL}/courses/select_live_courses.php`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data.status === "success") {
        const course = response?.data.message.find(
          (c) => String(c.course_id) === String(courseId)
        );

        if (course) {
          setFormData({
            course_id: course.course_id,
            type: course.type || "online",
            course_name: course.course_name || "",
            course_description: course.course_descreption || "",
            overview: course.overview || "",
            level: course.level || "beginner",
            Duration: course.Duration || "",
            lessons: course.lessons || "",
            group_price: course.group_price || "",
            private_price: course.private_price || "",
            image: course.image || "",
            video: course.video || "",
            advertising_video: course.advertising_video || "",
            hidden: course.hidden || "0",
          });

          // Parse wiil_learn and feature strings into arrays
          if (course.wiil_learn) {
            const points = course.wiil_learn
              .split("**CAMP**")
              .filter(Boolean)
              .map((item) => item.trim());
            setLearnPoints(points);
          }

          if (course.feature) {
            const feats = course.feature
              .split("**CAMP**")
              .filter(Boolean)
              .map((item) => item.trim());
            setFeatures(feats);
          }
        } else {
          toast.error("Course not found");
          router.push("/live-courses");
        }
      } else {
        toast.error("Failed to fetch course data");
      }
    } catch (error) {
      console.error("Error fetching course:", error);
      toast.error("Failed to load course data.");
    } finally {
      setCourseLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Learning Points handlers
  const addLearnPoint = () => {
    setLearnPoints([...learnPoints, ""]);
  };

  const updateLearnPoint = (index, value) => {
    const updated = [...learnPoints];
    updated[index] = value;
    setLearnPoints(updated);
  };

  const removeLearnPoint = (index) => {
    setLearnPoints(learnPoints.filter((_, i) => i !== index));
  };

  // Features handlers
  const addFeature = () => {
    setFeatures([...features, ""]);
  };

  const updateFeature = (index, value) => {
    const updated = [...features];
    updated[index] = value;
    setFeatures(updated);
  };

  const removeFeature = (index) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  const handleImagePick = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setImageFile(file);
    setFormData((prev) => ({
      ...prev,
      image: URL.createObjectURL(file),
    }));
  };

  const handleVideoPick = (file, type) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    const isLt500M = file.size / 1024 / 1024 < 500;
    if (!isLt500M) {
      toast.error("Video must be smaller than 500MB!");
      return;
    }

    const url = URL.createObjectURL(file);

    if (type === "main") {
      setVideoFile(file);
      setFormData((prev) => ({ ...prev, video: url }));
    } else {
      setAdvertisingVideoFile(file);
      setFormData((prev) => ({ ...prev, advertising_video: url }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert arrays to **CAMP** separated strings
      const wiil_learn_str = learnPoints.filter(Boolean).join("**CAMP**");
      const feature_str = features.filter(Boolean).join("**CAMP**");

      const payload = {
        course_id: parseInt(formData.course_id),
        type: formData.type,
        course_name: formData.course_name,
        course_description: formData.course_description,
        overview: formData.overview,
        level: formData.level,
        Duration: formData.Duration,
        lessons: formData.lessons,
        group_price: formData.group_price,
        private_price: formData.private_price,
        image: formData.image,
        video: formData.video,
        advertising_video: formData.advertising_video,
        wiil_learn: wiil_learn_str,
        feature: feature_str,
        hidden: formData.hidden,
      };

      console.log("Update payload:", payload);

      const response = await axios.post(
        `${BASE_URL}/courses/edit_courses.php`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.data?.status === "success") {
        toast.success("Course updated successfully!");
        router.push("/live-courses");
      } else {
        toast.error(response?.data?.message || "Failed to update course");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      toast.error("Failed to update course. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]";
  const labelClass = "text-sm font-medium";

  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Spin size="large" />
          <p className="text-slate-600 mt-4">Loading course...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl py-4">
        <div className="flex items-center mb-4 justify-between gap-2">
          <button
            type="button"
            onClick={() => router.push("/live-courses")}
            className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </button>
        </div>

        <BreadCrumb
          title="Edit Live Course"
          child="Live Courses"
          parent="Home"
        />

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Video className="w-5 h-5 text-[var(--primary-color)]" />
                Course Information
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Update the basic details of your live course.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Course Title *</label>
                  <input
                    name="course_name"
                    value={formData.course_name}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="e.g., Advanced React Development"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Short Description *</label>
                  <textarea
                    name="course_description"
                    value={formData.course_description}
                    onChange={handleInputChange}
                    rows={3}
                    className={inputClass}
                    placeholder="Describe what students will learn in this live course"
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Detailed Overview</label>
                  <textarea
                    name="overview"
                    value={formData.overview}
                    onChange={handleInputChange}
                    rows={5}
                    className={inputClass}
                    placeholder="Detailed course overview for the course page"
                  />
                </div>

                <div>
                  <label className={labelClass}>Course Type *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Level *</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l.charAt(0).toUpperCase() + l.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Duration *</label>
                  <input
                    name="Duration"
                    value={formData.Duration}
                    onChange={handleInputChange}
                    className={inputClass}
                    placeholder="e.g., 8 weeks"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Total Lessons *</label>
                  <input
                    type="number"
                    onWheel={(e) => e.target.blur()}
                    name="lessons"
                    value={formData.lessons}
                    onChange={handleInputChange}
                    min="1"
                    className={inputClass}
                    placeholder="16"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    name="hidden"
                    value={formData.hidden}
                    onChange={handleInputChange}
                    className={inputClass}
                  >
                    <option value="0">Visible (Active)</option>
                    <option value="1">Hidden (Inactive)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[var(--primary-color)]" />
                Pricing
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Set the pricing for your course.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Group Price ($) *</label>
                  <input
                    type="number"
                    onWheel={(e) => e.target.blur()}
                    name="group_price"
                    value={formData.group_price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={inputClass}
                    placeholder="199"
                    required
                  />
                </div>

                <div>
                  <label className={labelClass}>Private Price ($) *</label>
                  <input
                    type="number"
                    onWheel={(e) => e.target.blur()}
                    name="private_price"
                    value={formData.private_price}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className={inputClass}
                    placeholder="299"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Media Section */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Play className="w-5 h-5 text-[var(--primary-color)]" />
                Media
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Update course images and videos.
              </p>

              <div className="mt-4 space-y-6">
                {/* Course Image */}
                <div>
                  <div className="flex justify-between items-center">
                    <label className={labelClass}>Course Image</label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setImageMode(uploadType.file)}
                        className={`!bg-[var(--primary-color)] ${
                          imageMode === uploadType.file ? "" : "opacity-50"
                        } px-2 rounded-lg shadow-md py-0.5 text-white`}
                      >
                        <Upload className="text-white" size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setImageMode(uploadType.link)}
                        className={`!bg-[var(--primary-color)] ${
                          imageMode === uploadType.link ? "" : "opacity-50"
                        } px-2 rounded-lg shadow-md py-0.5 text-white`}
                      >
                        <Link className="text-white" size={16} />
                      </button>
                    </div>
                  </div>

                  {imageMode === "link" && (
                    <div className="mt-2">
                      <input
                        name="image"
                        value={formData.image}
                        onChange={handleInputChange}
                        placeholder="https://example.com/image.jpg"
                        className={`${inputClass} w-full`}
                      />
                    </div>
                  )}

                  {imageMode === "file" && (
                    <div className="mt-2">
                      <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                        <Upload size={16} />
                        Upload Image
                        <input
                          type="file"
                          accept="image/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImagePick(file);
                          }}
                        />
                      </label>
                      {imageFile && (
                        <p className="text-sm text-green-600 mt-2">
                          Image selected: {imageFile.name}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Image Preview */}
                  {formData.image && (
                    <div className="mt-3">
                      <img
                        src={formData.image}
                        alt="Course preview"
                        className="h-32 w-auto rounded-lg object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Main Video */}
                <div>
                  <div className="flex justify-between items-center">
                    <label className={labelClass}>Main Video</label>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => setVideoMode(uploadType.file)}
                        className={`!bg-[var(--primary-color)] ${
                          videoMode === uploadType.file ? "" : "opacity-50"
                        } px-2 rounded-lg shadow-md py-0.5 text-white`}
                      >
                        <Upload className="text-white" size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setVideoMode(uploadType.link)}
                        className={`!bg-[var(--primary-color)] ${
                          videoMode === uploadType.link ? "" : "opacity-50"
                        } px-2 rounded-lg shadow-md py-0.5 text-white`}
                      >
                        <Link className="text-white" size={16} />
                      </button>
                    </div>
                  </div>

                  {videoMode === "link" && (
                    <div className="mt-2">
                      <input
                        name="video"
                        value={formData.video}
                        onChange={handleInputChange}
                        placeholder="https://cdn.example.com/video.mp4"
                        className={`${inputClass} w-full`}
                      />
                    </div>
                  )}

                  {videoMode === "file" && (
                    <div className="mt-2">
                      <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                        <Upload size={16} />
                        Upload Video
                        <input
                          type="file"
                          accept="video/*"
                          className="sr-only"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleVideoPick(file, "main");
                          }}
                        />
                      </label>
                      {videoFile && (
                        <p className="text-sm text-green-600 mt-2">
                          Video selected: {videoFile.name}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Advertising Video */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Play className="w-5 h-5 text-[var(--primary-color)]" />
                  Advertising Video
                </h2>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setAdVideoMode(uploadType.file)}
                    className={`!bg-[var(--primary-color)] ${
                      adVideoMode === uploadType.file ? "" : "opacity-50"
                    } px-2 rounded-lg shadow-md py-0.5 text-white`}
                  >
                    <Upload className="text-white" size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdVideoMode(uploadType.link)}
                    className={`!bg-[var(--primary-color)] ${
                      adVideoMode === uploadType.link ? "" : "opacity-50"
                    } px-2 rounded-lg shadow-md py-0.5 text-white`}
                  >
                    <Link className="text-white" size={16} />
                  </button>
                </div>
              </div>

              {adVideoMode === "link" && (
                <div className="mt-4">
                  <input
                    name="advertising_video"
                    value={formData.advertising_video}
                    onChange={handleInputChange}
                    placeholder="https://youtube.com/watch?v=... or direct video URL"
                    className={`${inputClass} w-full`}
                  />
                  <p className="text-sm text-slate-500 mt-2">
                    Supported: YouTube, Vimeo, or direct video URLs
                  </p>
                </div>
              )}

              {adVideoMode === "file" && (
                <div className="mt-4">
                  <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                    <Upload size={16} />
                    Upload Advertising Video
                    <input
                      type="file"
                      accept="video/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleVideoPick(file, "advertising");
                      }}
                    />
                  </label>
                  {advertisingVideoFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Video selected: {advertisingVideoFile.name}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* What You'll Learn */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold">What You'll Learn</h2>
              <p className="text-sm text-slate-600 mt-1">
                Key learning outcomes for students.
              </p>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Learning Points</span>
                  <button
                    type="button"
                    onClick={addLearnPoint}
                    className="inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-sm hover:bg-slate-50"
                  >
                    <Plus size={14} /> Add item
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {learnPoints.map((point, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={point}
                        onChange={(e) => updateLearnPoint(i, e.target.value)}
                        placeholder={`Learning point #${i + 1}`}
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                      />
                      <button
                        type="button"
                        onClick={() => removeLearnPoint(i)}
                        className="rounded-lg border px-3 hover:bg-slate-50"
                        aria-label="Remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {learnPoints.length === 0 && (
                    <p className="text-sm text-slate-500 italic">
                      No learning points added yet. Click "Add item" to add one.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Course Features */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold">Course Features</h2>
              <p className="text-sm text-slate-600 mt-1">
                Highlight key features of this live course.
              </p>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Feature List</span>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-sm hover:bg-slate-50"
                  >
                    <Plus size={14} /> Add feature
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {features.map((feature, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={feature}
                        onChange={(e) => updateFeature(i, e.target.value)}
                        placeholder={`Feature #${i + 1}`}
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(i)}
                        className="rounded-lg border px-3 hover:bg-slate-50"
                        aria-label="Remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                  {features.length === 0 && (
                    <p className="text-sm text-slate-500 italic">
                      No features added yet. Click "Add feature" to add one.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--primary-color)] text-white px-4 py-2 font-medium hover:opacity-90 disabled:opacity-60"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {loading ? "Updating..." : "Update Course"}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Live Preview */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h3 className="font-semibold">Live Preview</h3>
              <p className="text-sm text-slate-600">
                See how your course will appear.
              </p>

              <article className="group relative mt-4 overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
                <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />
                <div className="pointer-events-none absolute -right-10 bottom-20 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />

                <div className="relative h-44 sm:h-56 md:h-64 lg:h-72 overflow-hidden">
                  {formData.video && !formData.video.startsWith("blob:") ? (
                    <video
                      src={formData.video}
                      poster={formData.image}
                      className="h-full w-full object-cover"
                      autoPlay
                      muted
                      loop
                      playsInline
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={
                        formData.image ||
                        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop"
                      }
                      alt="Course"
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src =
                          "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop";
                      }}
                    />
                  )}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200 capitalize">
                      {formData.level}
                    </span>
                    <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                      {formData.type === "online" ? "🔴 Live" : "📍 Offline"}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`text-[11px] rounded-full px-2 py-1 ring-1 font-medium ${
                        formData.hidden === "0"
                          ? "bg-green-100 text-green-700 ring-green-200"
                          : "bg-gray-100 text-gray-700 ring-gray-200"
                      }`}
                    >
                      {formData.hidden === "0" ? "✓ Active" : "Hidden"}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h2 className="text-base sm:text-lg font-semibold tracking-tight line-clamp-1">
                    {formData.course_name || "Course Title"}
                  </h2>
                  <p className="mt-1 text-slate-600 text-sm line-clamp-2">
                    {formData.course_description ||
                      "A short course description will appear here."}
                  </p>

                  <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formData.Duration || "Duration"}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        {formData.lessons || "0"} lessons
                      </span>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          Group: ${formData.group_price || "0"}
                        </span>
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                          Private: ${formData.private_price || "0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Learning Points Preview */}
                  {learnPoints.length > 0 && (
                    <div className="mt-4 pt-3 border-t">
                      <p className="text-xs font-medium text-slate-700 mb-2">
                        What you'll learn:
                      </p>
                      <ul className="space-y-1">
                        {learnPoints.slice(0, 3).map((point, idx) => (
                          <li
                            key={idx}
                            className="text-xs text-slate-600 flex items-start gap-1"
                          >
                            <span className="text-green-500 mt-0.5">✓</span>
                            <span className="line-clamp-1">
                              {point || `Learning point ${idx + 1}`}
                            </span>
                          </li>
                        ))}
                        {learnPoints.length > 3 && (
                          <li className="text-xs text-slate-500">
                            +{learnPoints.length - 3} more...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {/* Features Preview */}
                  {features.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      {features.slice(0, 3).map((feature, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                        >
                          {feature || `Feature ${idx + 1}`}
                        </span>
                      ))}
                      {features.length > 3 && (
                        <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                          +{features.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </article>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
