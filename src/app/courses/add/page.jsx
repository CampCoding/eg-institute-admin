"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { Loader2, Save, Plus, X, ArrowLeft, Upload, Play } from "lucide-react";
import { Upload as AntUpload, Progress, Radio, message } from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { teachers } from "@/utils/data";

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

  const [form, setForm] = useState({
    title: "",
    description: "",
    longDescription: "",
    level: LEVELS[0],
    duration: "12 weeks",
    lessons: 12,
    teacher: teachers?.[0]?.name || "Unknown",
    price: "$149",
    video: "",
    poster: "",
    color: GRADIENTS[0],
    // New advertising video fields
    advertisingVideoType: "url", // 'url' or 'upload'
    advertisingVideoUrl: "",
    advertisingVideoFile: null,
  });

  // Overview "What you'll learn" + feature cards
  const [learnItems, setLearnItems] = useState([
    "Read and write Arabic script fluently",
    "Engage in everyday Egyptian conversations",
  ]);
  const [features, setFeatures] = useState([
    { title: "Interactive Dialogues", subtitle: "Real-life conversations" },
    { title: "Audio Lessons", subtitle: "Native pronunciation" },
    { title: "Writing Practice", subtitle: "Script mastery" },
  ]);

  // Free trials list
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

  // Units / Chapters (used for Course Content)
  const [chapters, setChapters] = useState([
    { title: "Introduction", duration: "05:00" },
  ]);

  const [saving, setSaving] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoUploading, setVideoUploading] = useState(false);
  const valid = useMemo(() => !!form.title && !!form.description, [form]);

  const onChange = (key, val) => setForm((s) => ({ ...s, [key]: val }));

  // Video upload handlers
  const handleVideoTypeChange = (e) => {
    setForm((prev) => ({
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
      setForm((prev) => ({
        ...prev,
        advertisingVideoFile: file,
      }));

      message.success(`${file.name} uploaded successfully!`);
    }, 3000);

    // Prevent default upload behavior
    return false;
  };

  const removeUploadedVideo = () => {
    setForm((prev) => ({
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

  // Other handlers
  const addLearn = () => setLearnItems((s) => [...s, ""]);
  const updateLearn = (i, v) =>
    setLearnItems((s) => s.map((x, idx) => (idx === i ? v : x)));
  const removeLearn = (i) =>
    setLearnItems((s) => s.filter((_, idx) => idx !== i));

  const addFeature = () =>
    setFeatures((s) => [...s, { title: "", subtitle: "" }]);
  const updateFeature = (i, key, v) =>
    setFeatures((s) => s.map((f, idx) => (idx === i ? { ...f, [key]: v } : f)));
  const removeFeature = (i) =>
    setFeatures((s) => s.filter((_, idx) => idx !== i));

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

  const [instructor, setInstructor] = useState({
    name: teachers?.[0]?.name || "Ahmed Hassan",
    role: "Native Egyptian Arabic Teacher & Cultural Expert",
    bio: "",
    avatarBg: "#0ea5a6",
  });

  const [reviews] = useState([]); // optional to pre-seed

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;

    setSaving(true);

    // Create FormData for file upload
    const formData = new FormData();

    const payload = {
      ...form,
      id: `course-${Date.now()}`,
      overview: {
        whatYouWillLearn: learnItems.filter(Boolean),
        features: features.filter((f) => f.title || f.subtitle),
      },
      freeTrials: freeTrials.filter((t) => t.title),
      // units for "Course Content" tab
      units: chapters.map((c, i) => ({
        unitId: `u-${i + 1}`,
        name: c.title || `Unit ${i + 1}`,
        unitNumber: i + 1,
        lessonsCount: Math.max(
          1,
          Number((c.duration || "0").split(":")[0]) || 2
        ), // a tiny heuristic
        videos: form.video ? [form.video] : [],
        pdfs: [],
      })),
      // keep "sections" too if you use it elsewhere
      sections: [
        {
          id: `sec-${Date.now()}`,
          title: "Course Content",
          lessons: chapters.map((c, i) => ({
            id: `lesson-${i + 1}`,
            title: c.title || `Lesson ${i + 1}`,
            duration: c.duration || "00:00",
            videoUrl: form.video || "",
          })),
        },
      ],
      instructor,
      reviews,
    };

    // Add all form fields to FormData
    Object.keys(payload).forEach((key) => {
      if (key === "advertisingVideoFile" && form.advertisingVideoFile) {
        formData.append("advertisingVideo", form.advertisingVideoFile);
      } else if (key !== "advertisingVideoFile") {
        formData.append(
          key,
          typeof payload[key] === "object"
            ? JSON.stringify(payload[key])
            : payload[key]
        );
      }
    });

    try {
      if (typeof window !== "undefined") {
        const drafts = JSON.parse(localStorage.getItem("courseDrafts") || "[]");
        localStorage.setItem(
          "courseDrafts",
          JSON.stringify([payload, ...drafts])
        );
      }

      console.log("Creating course:", payload);
      console.log("Uploaded video file:", form.advertisingVideoFile);

      router.push("/courses");
    } catch (err) {
      console.error(err);
      message.error("Failed to save course. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

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
                  <label className="text-sm font-medium">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => onChange("title", e.target.value)}
                    placeholder="e.g., Egyptian Arabic Complete Course"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">
                    Short Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) => onChange("description", e.target.value)}
                    rows={3}
                    placeholder="A short overview that appears on cards."
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">
                    Long Overview (details page)
                  </label>
                  <textarea
                    value={form.longDescription}
                    onChange={(e) =>
                      onChange("longDescription", e.target.value)
                    }
                    rows={5}
                    placeholder="In-depth course overview for the details page."
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Level</label>
                  <select
                    value={form.level}
                    onChange={(e) => onChange("level", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)] bg-white"
                  >
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <input
                    value={form.duration}
                    onChange={(e) => onChange("duration", e.target.value)}
                    placeholder="e.g., 12 weeks"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Lessons</label>
                  <input
                    type="number"
                    min={1}
                    value={form.lessons}
                    onChange={(e) =>
                      onChange("lessons", Number(e.target.value))
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Teacher</label>
                  <select
                    value={form.teacher}
                    onChange={(e) => onChange("teacher", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)] bg-white"
                  >
                    {teachers?.map((teach) => (
                      <option key={teach?.id} value={teach?.name ?? teach?.id}>
                        {teach?.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Price</label>
                  <input
                    value={form.price}
                    onChange={(e) => onChange("price", e.target.value)}
                    placeholder="$149"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                </div>

                <div className="sm:col-span-2 grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      Video URL (optional)
                    </label>
                    <input
                      value={form.video}
                      onChange={(e) => onChange("video", e.target.value)}
                      placeholder="https://cdn.example.com/intro.mp4"
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Poster Image URL
                    </label>
                    <input
                      value={form.poster}
                      onChange={(e) => onChange("poster", e.target.value)}
                      placeholder="https://images.unsplash.com/..."
                      className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Advertising Video Section */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-[var(--primary-color)]" />
                Advertising Video
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-3">
                    Video Source
                  </label>
                  <Radio.Group
                    value={form.advertisingVideoType}
                    onChange={handleVideoTypeChange}
                    className="space-x-6"
                  >
                    <Radio value="url">Video URL</Radio>
                    <Radio value="upload">Upload Video</Radio>
                  </Radio.Group>
                </div>

                {form.advertisingVideoType === "url" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Video URL
                    </label>
                    <input
                      type="url"
                      name="advertisingVideoUrl"
                      value={form.advertisingVideoUrl}
                      onChange={(e) =>
                        onChange("advertisingVideoUrl", e.target.value)
                      }
                      className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[var(--primary-color)] focus:border-transparent"
                      placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      Supported: YouTube, Vimeo, or direct video file URLs
                    </p>
                  </div>
                )}

                {form.advertisingVideoType === "upload" && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Upload Video File
                    </label>

                    {!form.advertisingVideoFile && (
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

                    {form.advertisingVideoFile && !videoUploading && (
                      <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Play className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-medium text-green-900">
                                {form.advertisingVideoFile.name}
                              </p>
                              <p className="text-sm text-green-700">
                                {(
                                  form.advertisingVideoFile.size /
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

            {/* What you'll learn & features */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold">Overview Section</h2>
              <p className="text-sm text-slate-600 mt-1">
                What students learn & course features.
              </p>

              {/* Learn items */}
              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium">What you'll learn</span>
                  <button
                    type="button"
                    onClick={addLearn}
                    className="inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-sm hover:bg-slate-50"
                  >
                    <Plus size={14} /> Add item
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {learnItems.map((li, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        value={li}
                        onChange={(e) => updateLearn(i, e.target.value)}
                        placeholder={`Point #${i + 1}`}
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

              {/* Feature cards */}
              <div className="mt-6">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Feature cards</span>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-sm hover:bg-slate-50"
                  >
                    <Plus size={14} /> Add feature
                  </button>
                </div>
                <div className="mt-3 space-y-2">
                  {features.map((f, i) => (
                    <div
                      key={i}
                      className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]"
                    >
                      <input
                        value={f.title}
                        onChange={(e) =>
                          updateFeature(i, "title", e.target.value)
                        }
                        placeholder="Title (e.g., Audio Lessons)"
                        className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                      />
                      <input
                        value={f.subtitle}
                        onChange={(e) =>
                          updateFeature(i, "subtitle", e.target.value)
                        }
                        placeholder="Subtitle"
                        className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
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

            {/* Chapters / units */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">Course Content</h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Add units (we'll also create lessons for your "sections"
                    array).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={addChapter}
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--primary-color)] text-white px-3 py-2 text-sm hover:opacity-90"
                >
                  <Plus size={16} /> Add Unit
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {chapters.map((c, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 p-3 md:[grid-template-columns:1fr_160px_auto]"
                  >
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-slate-600">
                        Unit title
                      </label>
                      <div className="flex gap-2">
                        <label className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer w-full">
                          <Upload size={16} />
                          <span className="truncate">
                            {c.title ? c.title : `Select file or enter a title`}
                          </span>
                          <input
                            type="file"
                            className="sr-only"
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) updateChapter(i, "title", f.name);
                            }}
                          />
                        </label>
                      </div>
                      <input
                        placeholder={`Unit ${i + 1} title`}
                        value={c.title}
                        onChange={(e) =>
                          updateChapter(i, "title", e.target.value)
                        }
                        className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)] md:hidden"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-slate-600">
                        Approx. duration
                      </label>
                      <input
                        value={c.duration}
                        onChange={(e) =>
                          updateChapter(i, "duration", e.target.value)
                        }
                        placeholder="e.g., 05:00"
                        className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                      />
                    </div>

                    <div className="flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() => removeChapter(i)}
                        className="inline-flex w-full md:w-auto items-center justify-center rounded-lg border border-slate-200 px-3 py-2 hover:bg-slate-50"
                        aria-label="Remove"
                      >
                        <X size={16} />
                        <span className="ml-2 md:hidden text-sm">Remove</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructor */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold">Instructor</h2>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <input
                  value={instructor.name}
                  onChange={(e) =>
                    setInstructor((s) => ({ ...s, name: e.target.value }))
                  }
                  placeholder="Name"
                  className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                />
                <input
                  value={instructor.role}
                  onChange={(e) =>
                    setInstructor((s) => ({ ...s, role: e.target.value }))
                  }
                  placeholder="Role / Title"
                  className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                />
                <textarea
                  value={instructor.bio}
                  onChange={(e) =>
                    setInstructor((s) => ({ ...s, bio: e.target.value }))
                  }
                  rows={4}
                  placeholder="Short bio"
                  className="sm:col-span-2 rounded-lg border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="submit"
                disabled={!valid || saving || videoUploading}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--primary-color)] text-white px-4 py-2 font-medium hover:opacity-90 disabled:opacity-60"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                Save course
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
                      poster={form.poster}
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
                        form.poster ||
                        "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1400&auto=format&fit=crop"
                      }
                      alt="Poster"
                      className="h-full w-full object-cover"
                    />
                  )}
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${form.color} opacity-25`}
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                    <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                      {form.level}
                    </span>
                    <span className="text-[11px] rounded-full bg-white/90 px-2 py-1 ring-1 ring-slate-200">
                      {form.duration}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h2 className="text-base sm:text-lg font-semibold tracking-tight line-clamp-1">
                    {form.title || "Course title"}
                  </h2>
                  <p className="mt-1 text-slate-600 text-sm line-clamp-2">
                    {form.description ||
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
                      <span className="inline-flex items-center gap-1">
                        <svg viewBox="0 0 24 24" className="h-4 w-4">
                          <path
                            fill="currentColor"
                            d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.33 0-8 2.17-8 5v1h16v-1c0-2.83-3.67-5-8-5Z"
                          />
                        </svg>
                        {form.teacher}
                      </span>
                    </div>
                    <span className="font-semibold text-[var(--text-color)]">
                      {form.price}
                    </span>
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
