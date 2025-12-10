"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { Loader2, Save, Plus, X, ArrowLeft, Upload, Play } from "lucide-react";
import { Upload as AntUpload, Progress, Radio, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { teachers } from "@/utils/data";
import axios from "axios";
import { BASE_URL } from "@/utils/base_url";
import toast from "react-hot-toast";

const { Dragger } = AntUpload;

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];
const GRADIENTS = [
  "from-indigo-500 via-sky-500 to-emerald-500",
  "from-fuchsia-500 via-pink-500 to-amber-400",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-amber-500 via-orange-500 to-rose-500",
  "from-violet-500 via-purple-500 to-blue-500",
];

export default function AddCoursePage() {
  const router = useRouter();
  const [addLoading, setAddLoading] = useState(false);

  const [form, setForm] = useState({
    course_name: "",
    course_description: "",
    overview: "",
    level: "Beginner",
    Duration: "12 weeks",
    lessons: "12",
    price: "50",
    image: "",
    video: "",
    advertising_video: "",
    type: "Online",
    hidden: "0"
  });

  // Overview "What you'll learn" - API expects a string, not array
  const [wiil_learn, setWiilLearn] = useState([
    "Read and write Arabic script fluently",
    "Engage in everyday Egyptian conversations",
  ]);
  
  // Features - API expects a string, not array of objects
  const [feature, setFeature] = useState([
    "Interactive Dialogues",
    "Audio Lessons with native pronunciation",
    "Writing Practice for script mastery",
  ]);

  // Free trials list (not in API, keep for UI only)
  const [freeTrials, setFreeTrials] = useState([
    {
      id: "ft-1",
      title: "Egyptian Arabic Basics - Free Trial",
      questions: 20,
      duration: "25 min",
      type: "MCQ",
      isFree: true,
    },
  ]);

  // Chapters (for UI only, not in API)
  const [chapters, setChapters] = useState([
    { title: "Introduction", duration: "05:00" },
  ]);

  const [saving, setSaving] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploading, setVideoUploading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [advertisingVideoFile, setAdvertisingVideoFile] = useState(null);

  const valid = useMemo(() => !!form.course_name && !!form.course_description, [form]);

  const onChange = (key, val) => setForm((s) => ({ ...s, [key]: val }));

  // File upload handlers
  const uploadFile = async (file, endpoint, fieldName) => {
    const formData = new FormData();
    formData.append(fieldName, file);
    
    try {
      const token = localStorage.getItem("AccessToken");
      const response = await axios.post(`${BASE_URL}/${endpoint}`, formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      
      if (response?.data?.status === "success") {
        return response.data.url; // Assuming API returns { status: "success", url: "path/to/file" }
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
    
    return false; // Prevent default upload
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

  // Video type change handler
  const handleVideoTypeChange = (e) => {
    setForm((prev) => ({
      ...prev,
      advertisingVideoType: e.target.value,
      advertising_video: "",
    }));
    setAdvertisingVideoFile(null);
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

  // Instructor (not in API, keep for UI if needed)
  const [instructor, setInstructor] = useState({
    name: teachers?.[0]?.name || "Ahmed Hassan",
    role: "Native Egyptian Arabic Teacher & Cultural Expert",
    bio: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;

    setSaving(true);
    setAddLoading(true);

    try {
      // Upload files first if they exist
      let imageUrl = form.image;
      let videoUrl = form.video;
      let advertisingVideoUrl = form.advertising_video;

      // Upload image file
      if (imageFile && typeof imageFile === 'object') {
        const uploadedImageUrl = await uploadFile(imageFile, 'upload_image.php', 'image');
        if (uploadedImageUrl) imageUrl = uploadedImageUrl;
      }

      // Upload main video file
      if (videoFile && typeof videoFile === 'object') {
        const uploadedVideoUrl = await uploadFile(videoFile, 'upload_video.php', 'video');
        if (uploadedVideoUrl) videoUrl = uploadedVideoUrl;
      }

      // Upload advertising video file
      if (advertisingVideoFile && typeof advertisingVideoFile === 'object') {
        const uploadedAdVideoUrl = await uploadFile(advertisingVideoFile, 'upload_video.php', 'video');
        if (uploadedAdVideoUrl) advertisingVideoUrl = uploadedAdVideoUrl;
      }

      // Prepare payload according to API structure
      const payload = {
        type: form.type || "Online",
        course_name: form.course_name,
        course_description: form.course_description,
        overview: form.overview,
        level: form.level,
        Duration: form.Duration,
        lessons: form.lessons.toString(), // API expects string
        price: form.price,
        image: imageUrl,
        video: videoUrl,
        advertising_video: advertisingVideoUrl,
        wiil_learn: wiil_learn?.filter(Boolean).join(", "), // Convert array to string
        feature: feature.filter(Boolean).join(", "), // Convert array to string
        hidden: form.hidden || "0"
        // Note: created_at should be handled by the API/server
      };

      console.log("Sending payload:", payload);

      const token = localStorage.getItem("AccessToken");
      const response = await axios.post(
        `${BASE_URL}/courses/add_course.php`,
        payload,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );
     console.log(response);
      if (response?.data?.status === "success") {
        toast.success(response.data.message || "Course added successfully!");
        
        // Refresh courses list if needed
        try {
          await axios.get(`${BASE_URL}/courses/select_live_courses.php`, {
            headers: {
              "Authorization": `Bearer ${token}`
            }
          });
        } catch (refreshError) {
          console.log("Refresh courses error:", refreshError);
        }
        
        // Reset form and redirect
        setForm({
          course_name: "",
          course_description: "",
          overview: "",
          level: "Beginner",
          Duration: "12 weeks",
          lessons: "12",
          price: "50",
          image: "",
          video: "",
          advertising_video: "",
          type: "Online",
          hidden: "0"
        });
        setWiilLearn(["Read and write Arabic script fluently", "Engage in everyday Egyptian conversations"]);
        setFeature(["Interactive Dialogues", "Audio Lessons with native pronunciation", "Writing Practice for script mastery"]);
        setImageFile(null);
        setVideoFile(null);
        setAdvertisingVideoFile(null);
        
        // Redirect to courses page
        router.push("/courses");
      } else {
        toast.error(response?.data?.message || "Failed to add course");
      }
    } catch (err) {
      console.error("Error adding course:", err);
      toast.error(err.response?.data?.message || "An error occurred while adding the course");
    } finally {
      setSaving(false);
      setAddLoading(false);
    }
  };

  // Input styling
  const inputClass = "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]";
  const labelClass = "text-sm font-medium";

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

        <BreadCrumb title="Add Course" child="Courses" parent="Home" />

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
                    value={form.course_description}
                    onChange={(e) => onChange("course_description", e.target.value)}
                    rows={3}
                    placeholder="A short overview that appears on cards."
                    className={inputClass}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Long Overview (details page)</label>
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
                  <label className={labelClass}>Lessons</label>
                  <input
                    type="number"
                    min="1"
                    value={form.lessons}
                    onChange={(e) => onChange("lessons", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => onChange("price", e.target.value)}
                    placeholder="50"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => onChange("type", e.target.value)}
                    className={inputClass}
                  >
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
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
                      Image selected: {imageFile.name}
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
                      Video selected: {videoFile.name}
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
                <label className={labelClass}>Advertising Video URL or Upload</label>
                <div className="flex gap-2">
                  <input
                    value={form.advertising_video}
                    onChange={(e) => onChange("advertising_video", e.target.value)}
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
                    Advertising video selected: {advertisingVideoFile.name}
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
                  {wiil_learn?.map((li, i) => (
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
                disabled={!valid || saving || addLoading}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--primary-color)] text-white px-4 py-2 font-medium hover:opacity-90 disabled:opacity-60"
              >
                {(saving || addLoading) ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {saving || addLoading ? "Adding Course..." : "Add Course"}
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
                    <span className="font-semibold text-[var(--text-color)]">
                      ${form.price}
                    </span>
                  </div>
                </div>
              </article>
            </div>
          </div>

          <button>حفظ</button>
        </form>
      </div>
    </div>
  );
}