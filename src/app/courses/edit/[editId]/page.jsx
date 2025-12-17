"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { Loader2, Save, Plus, X, ArrowLeft, Upload, Play } from "lucide-react";
import { Upload as AntUpload, Progress, Radio, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { teachers } from "@/utils/data";
import axios from "axios";
import { BASE_URL } from "@/utils/base_url";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";

const { Dragger } = AntUpload;

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];

export default function EditCoursePage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const rawId = useMemo(
    () => (Array.isArray(params?.editId) ? params.editId[0] : params?.editId),
    [params]
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploading, setVideoUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [advertisingVideoFile, setAdvertisingVideoFile] = useState(null);

  // Base form - matching the add page structure
  const [form, setForm] = useState({
    id: "", // Will be populated from the course data
    course_name: "",
    course_description: "",
    overview: "",
    level: "Beginner",
    Duration: "12 weeks",
    lessons: "12",
    p_price: "50",
    g_price: "50",
    image: "",
    video: "",
    advertising_video: "",
    type: "Online",
    hidden: "0",
  });

  // Overview "What you'll learn"
  const [wiil_learn, setWiilLearn] = useState([]);

  // Features
  const [feature, setFeature] = useState([]);

  // Free trials list (not in API, keep for UI only)
  const [freeTrials, setFreeTrials] = useState([]);

  // Chapters (for UI only, not in API)
  const [chapters, setChapters] = useState([]);

  // Instructor (not in API, keep for UI if needed)
  const [instructor, setInstructor] = useState({
    name: teachers?.[0]?.name || "Ahmed Hassan",
    role: "Native Egyptian Arabic Teacher & Cultural Expert",
    bio: "",
  });

  const valid = useMemo(
    () => !!form.course_name && !!form.course_description,
    [form]
  );

  const onChange = (key, val) => setForm((s) => ({ ...s, [key]: val }));

  // Load existing course
  useEffect(() => {
    if (!rawId) return;

    const fetchCourse = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("AccessToken");
        const response = await axios.get(
          `${BASE_URL}/courses/select_courses.php`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (response.data?.message && Array.isArray(response.data?.message)) {
          const course = response?.data?.message?.find(
            (c) => c.course_id == rawId
          );
          console.log(course);
          if (course) {
            // Set form values matching the add page structure
            setForm({
              course_id: course?.course_id,
              course_name: course?.course_name || "",
              course_description: course?.course_descreption,
              overview: course?.overview,
              level: course?.level,
              Duration: course?.Duration,
              lessons: course?.lessons?.toString(),
              p_price: course?.private_price,
              g_price: course?.group_price,
              image: course?.image,
              video: course?.video,
              advertising_video: course?.advertising_video,
              type: course?.type,
              hidden: course?.hidden,
            });

            // Parse wiil_learn from string to array
            if (course.wiil_learn) {
              setWiilLearn(
                typeof course.wiil_learn === "string"
                  ? course.wiil_learn
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                  : course.wiil_learn
              );
            }

            // Parse feature from string to array
            if (course.feature) {
              setFeature(
                typeof course.feature === "string"
                  ? course.feature
                      .split(",")
                      .map((item) => item.trim())
                      .filter(Boolean)
                  : course.feature
              );
            }

            // You might want to parse other fields like chapters if they exist in your API
          } else {
            toast.error("Course not found");
            router.push("/courses");
          }
        }
      } catch (error) {
        console.error("Error fetching course:", error);
        toast.error("Failed to load course data");
      } finally {
        setLoading(false);
      }
    };

    fetchCourse();
  }, [rawId, router]);

  // File upload handlers
  const uploadFile = async (file, endpoint, fieldName) => {
    const formData = new FormData();
    formData.append(fieldName, file);

    try {
      const token = localStorage.getItem("AccessToken");
      const response = await axios.post(
        `https://camp-coding.tech/eg_Institute/${endpoint}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response?.status === 200) {
        return response.data;
      }
      throw new Error("Upload failed");
    } catch (error) {
      console.error(`Error uploading ${fieldName}:`, error);
      toast.error(`Failed to upload ${fieldName}`);
      return null;
    }
  };

  // Image upload handler
  const handleImageUpload = async (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      toast.error("You can only upload image files!");
      return false;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      toast.error("Image must be smaller than 5MB!");
      return false;
    }

    setImageFile(file);

    // For preview
    const imageUrl = URL.createObjectURL(file);
    onChange("image", imageUrl);

    return false;
  };

  // Video upload handler
  const handleVideoUpload = async (file, type) => {
    const isVideo = file.type.startsWith("video/");
    if (!isVideo) {
      toast.error("You can only upload video files!");
      return false;
    }

    const isLt500M = file.size / 1024 / 1024 < 500;
    if (!isLt500M) {
      toast.error("Video must be smaller than 500MB!");
      return false;
    }

    if (type === "main") {
      setVideoFile(file);
      const videoUrl = URL.createObjectURL(file);
      onChange("video", videoUrl);
    } else if (type === "advertising") {
      setAdvertisingVideoFile(file);
      const videoUrl = URL.createObjectURL(file);
      onChange("advertising_video", videoUrl);
    }

    return false;
  };

  // Will Learn handlers
  const addLearn = () => setWiilLearn((s) => [...s, ""]);
  const updateLearn = (i, v) =>
    setWiilLearn((s) => s.map((x, idx) => (idx === i ? v : x)));
  const removeLearn = (i) =>
    setWiilLearn((s) => s.filter((_, idx) => idx !== i));

  // Feature handlers
  const addFeature = () => setFeature((s) => [...s, ""]);
  const updateFeature = (i, v) =>
    setFeature((s) => s.map((x, idx) => (idx === i ? v : x)));
  const removeFeature = (i) =>
    setFeature((s) => s.filter((_, idx) => idx !== i));

  // UI-only handlers (free trials, chapters - not sent to API)
  const addTrial = () =>
    setFreeTrials((s) => [
      ...s,
      {
        id: `ft-${Date.now()}`,
        title: "",
        questions: 0,
        duration: "10 min",
        type: "MCQ",
        isFree: true,
      },
    ]);
  const updateTrial = (i, key, v) =>
    setFreeTrials((s) =>
      s.map((t, idx) => (idx === i ? { ...t, [key]: v } : t))
    );
  const removeTrial = (i) =>
    setFreeTrials((s) => s.filter((_, idx) => idx !== i));

  const addChapter = () =>
    setChapters((s) => [...s, { title: "", duration: "00:00" }]);
  const removeChapter = (i) =>
    setChapters((s) => s.filter((_, idx) => idx !== i));
  const updateChapter = (i, key, val) =>
    setChapters((s) =>
      s.map((c, idx) => (idx === i ? { ...c, [key]: val } : c))
    );

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;

    setSaving(true);

    try {
      const token = localStorage.getItem("AccessToken");

      // Upload new image if provided
      let imageUrlToSend = form.image;
      if (imageFile && typeof imageFile === "object") {
        const uploadedImageUrl = await uploadFile(
          imageFile,
          "image_uplouder.php",
          "image"
        );

        if (!uploadedImageUrl) {
          toast.error("Image upload failed. Please try again.");
          setSaving(false);
          return;
        }

        imageUrlToSend = uploadedImageUrl;
      }

      // Upload new video if provided
      let videoUrlToSend = form.video;
      if (videoFile && typeof videoFile === "object") {
        const uploadedVideoUrl = await uploadFile(
          videoFile,
          "video_uploader.php", // Update this endpoint as needed
          "video"
        );

        if (uploadedVideoUrl) {
          videoUrlToSend = uploadedVideoUrl;
        }
      }

      // Upload new advertising video if provided
      let advertisingVideoUrlToSend = form.advertising_video;
      if (advertisingVideoFile && typeof advertisingVideoFile === "object") {
        const uploadedAdVideoUrl = await uploadFile(
          advertisingVideoFile,
          "video_uploader.php", // Update this endpoint as needed
          "video"
        );

        if (uploadedAdVideoUrl) {
          advertisingVideoUrlToSend = uploadedAdVideoUrl;
        }
      }

      // Prepare payload according to API structure (same as add page)
      const payload = {
        course_id: rawId, // Important: send course_id for editing
        type: "offline",
        course_name: form.course_name,
        course_description: form.course_description,
        overview: form.overview,
        level: form.level,
        Duration: form.Duration,
        lessons: form.lessons.toString(),
        private_price: form.p_price,
        group_price: form.g_price,
        image: imageUrlToSend,
        video: videoUrlToSend,
        advertising_video: advertisingVideoUrlToSend,
        wiil_learn: wiil_learn.filter(Boolean).join(", "),
        feature: feature.filter(Boolean).join(", "),
        hidden: form.hidden || "0",
        created_at: Date.now(),
      };

      console.log("Sending payload:", payload);

      // Assuming you have an edit endpoint
      const response = await axios.post(
        `${BASE_URL}/courses/edit_courses.php`, // Update this endpoint
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Edit response:", response);

      if (response?.data?.status === "success") {
        queryClient.invalidateQueries("courses");
        toast.success(response.data.message || "Course updated successfully!");

        // Refresh courses list
        router.push("/courses");
      } else {
        toast.error(response?.data?.message || "Failed to update course");
      }
    } catch (err) {
      console.error("Error updating course:", err);
      toast.error(
        err.response?.data?.message ||
          "An error occurred while updating the course"
      );
    } finally {
      setSaving(false);
    }
  };

  // Input styling
  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]";
  const labelClass = "text-sm font-medium";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-8 w-8 text-[var(--primary-color)]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl py-4">
        {/* Top bar */}
        <div className="flex items-center mb-4 justify-between gap-2">
          <button
            type="button"
            onClick={() => router.push("/courses")}
            className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </button>
        </div>

        <BreadCrumb title="Edit Course" child="Courses" parent="Home" />

        <form
          onSubmit={handleSubmit}
          className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {/* Left: form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic info */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold">Basic information</h2>
              <p className="text-sm text-slate-600 mt-1">
                Title, description, level, and pricing.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Course Name</label>
                  <input
                    value={form.course_name}
                    onChange={(e) => onChange("course_name", e.target.value)}
                    placeholder="e.g., Egyptian Arabic Complete Course"
                    className={inputClass}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Short Description</label>
                  <textarea
                    value={form?.course_description}
                    onChange={(e) =>
                      onChange("course_description", e.target.value)
                    }
                    rows={3}
                    placeholder="A short overview that appears on cards."
                    className={inputClass}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Long Overview (details page)
                  </label>
                  <textarea
                    value={form.overview}
                    onChange={(e) => onChange("overview", e.target.value)}
                    rows={5}
                    placeholder="In-depth course overview for the details page."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Level</label>
                  <select
                    value={form.level}
                    onChange={(e) => onChange("level", e.target.value)}
                    className={inputClass}
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Duration</label>
                  <input
                    value={form.Duration}
                    onChange={(e) => onChange("Duration", e.target.value)}
                    placeholder="e.g., 12 weeks"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>Group Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.g_price}
                    onChange={(e) => onChange("g_price", e.target.value)}
                    placeholder="50"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}> Private Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.p_price}
                    onChange={(e) => onChange("p_price", e.target.value)}
                    placeholder="50"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Lessons</label>
                  <input
                    type="number"
                    min="1"
                    value={form.lessons}
                    onChange={(e) => onChange("lessons", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Image URL or Upload</label>
                  <div className="flex gap-2">
                    <input
                      value={form.image}
                      onChange={(e) => onChange("image", e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className={`${inputClass} flex-1`}
                    />
                    <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                      <Upload size={16} />
                      Upload
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(file);
                        }}
                      />
                    </label>
                  </div>
                  {imageFile && (
                    <p className="text-sm text-green-600 mt-1">
                      New image selected: {imageFile.name}
                    </p>
                  )}
                  {form.image && !imageFile && (
                    <p className="text-sm text-blue-600 mt-1">
                      Current image: {form.image.substring(0, 50)}...
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Main Video URL or Upload</label>
                  <div className="flex gap-2">
                    <input
                      value={form.video}
                      onChange={(e) => onChange("video", e.target.value)}
                      placeholder="https://cdn.example.com/intro.mp4"
                      className={`${inputClass} flex-1`}
                    />
                    <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                      <Upload size={16} />
                      Upload
                      <input
                        type="file"
                        accept="video/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleVideoUpload(file, "main");
                        }}
                      />
                    </label>
                  </div>
                  {videoFile && (
                    <p className="text-sm text-green-600 mt-1">
                      New video selected: {videoFile.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Status</label>
                  <select
                    value={form.hidden}
                    onChange={(e) => onChange("hidden", e.target.value)}
                    className={inputClass}
                  >
                    <option value="0">Visible</option>
                    <option value="1">Hidden</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Advertising Video Section */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-[var(--primary-color)]" />
                Advertising Video
              </h2>

              <div>
                <label className={labelClass}>
                  Advertising Video URL or Upload
                </label>
                <div className="flex gap-2">
                  <input
                    value={form.advertising_video}
                    onChange={(e) =>
                      onChange("advertising_video", e.target.value)
                    }
                    placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    className={`${inputClass} flex-1`}
                  />
                  <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                    <Upload size={16} />
                    Upload
                    <input
                      type="file"
                      accept="video/*"
                      className="sr-only"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleVideoUpload(file, "advertising");
                      }}
                    />
                  </label>
                </div>
                {advertisingVideoFile && (
                  <p className="text-sm text-green-600 mt-1">
                    New advertising video selected: {advertisingVideoFile.name}
                  </p>
                )}
                <p className="text-sm text-slate-500 mt-2">
                  Supported: YouTube, Vimeo, or direct video file URLs
                </p>
              </div>
            </div>

            {/* What you'll learn */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold">What You'll Learn</h2>
              <p className="text-sm text-slate-600 mt-1">
                What students will learn from this course.
              </p>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Learning Points</span>
                  <button
                    type="button"
                    onClick={addLearn}
                    className="inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-sm hover:bg-slate-50"
                  >
                    <Plus size={14} /> Add item
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {wiil_learn.map((li, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={li}
                        onChange={(e) => updateLearn(i, e.target.value)}
                        placeholder={`Learning point #${i + 1}`}
                        className="flex-1 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                      />
                      <button
                        type="button"
                        onClick={() => removeLearn(i)}
                        className="rounded-lg border px-3 hover:bg-slate-50"
                        aria-label="Remove"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold">Course Features</h2>
              <p className="text-sm text-slate-600 mt-1">
                Key features of this course.
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
                  {feature.map((f, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={f}
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
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="submit"
                disabled={!valid || saving}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--primary-color)] text-white px-4 py-2 font-medium hover:opacity-90 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {saving ? "Saving Changes..." : "Save Changes"}
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

          {/* Right: live preview */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h3 className="font-semibold">Live preview</h3>
              <p className="text-sm text-slate-600">
                Matches your courses grid style.
              </p>

              <article className="group relative mt-4 overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
                {/* Soft blobs */}
                <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />
                <div className="pointer-events-none absolute -right-10 bottom-20 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />

                <div className="relative h-44 sm:h-56 md:h-64 lg:h-72 overflow-hidden">
                  {form.video ? (
                    <video
                      src={form.video}
                      poster={form.image}
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
                        form.image ||
                        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1400&auto=format&fit=crop"
                      }
                      alt="Course"
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                      {form.level}
                    </span>
                    <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                      {form.Duration}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h2 className="text-base sm:text-lg font-semibold tracking-tight line-clamp-1">
                    {form.course_name || "Course title"}
                  </h2>
                  <p className="mt-1 text-slate-600 text-sm line-clamp-2">
                    {form.course_description ||
                      "A short course description will appear here."}
                  </p>

                  <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <span
                        className="inline-flex items-center gap-1"
                        title="Lessons"
                      >
                        <svg viewBox="0 0 24 24" className="h-4 w-4">
                          <path
                            fill="currentColor"
                            d="M4 6h16v2H4zm0 5h16v2H4zm0 5h10v2H4z"
                          />
                        </svg>
                        {form.lessons} lessons
                      </span>
                    </div>
                    <span className="font-semibold text-[var(--text-color)]"></span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
