"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
} from "lucide-react";

import { useForm, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import usePostCourse from "../../../utils/Api/Courses/PostCourse";
import toast from "react-hot-toast";

const LEVELS = ["Beginner", "Intermediate", "Advanced", "All Levels"];

const schema = yup.object({
  course_name: yup.string().trim().required("Course name is required"),
  course_description: yup
    .string()
    .trim()
    .required("Short description is required"),
  overview: yup.string().default(""),
  level: yup
    .mixed()
    .oneOf([...LEVELS])
    .required(),
  Duration: yup.string().trim().required("Duration is required"),
  lessons: yup
    .string()
    .required("Total sessions is required")
    .test("is-valid-lessons", "Sessions must be >= 1", (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 1;
    }),
  p_price: yup
    .string()
    .required("Private price is required")
    .test("is-valid-price", "Price must be >= 0", (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 0;
    }),
  g_price: yup
    .string()
    .required("Group price is required")
    .test("is-valid-price", "Price must be >= 0", (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 0;
    }),
  image: yup.string().default(""),
  video: yup.string().default(""),
  advertising_video: yup.string().default(""),
  hidden: yup.mixed().oneOf(["0", "1"]).required(),
  // Live course specific fields
  timezone: yup.string().trim().required("Timezone is required"),
  maxStudents: yup
    .string()
    .required("Maximum students is required")
    .test("is-valid-number", "Must be >= 1", (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 1;
    }),
  sessionDuration: yup.string().required("Session duration is required"),
  meetingLink: yup.string().url("Must be a valid URL").default(""),
  wiil_learn: yup
    .array()
    .of(yup.object({ value: yup.string().trim().default("") }))
    .default([]),
  feature: yup
    .array()
    .of(yup.object({ value: yup.string().trim().default("") }))
    .default([]),
});

const uploadType = {
  link: "link",
  file: "file",
};

export default function AddLiveCoursePage() {
  const router = useRouter();
  const { isPending, mutateAsync } = usePostCourse();

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [advertisingVideoFile, setAdvertisingVideoFile] = useState(null);
  const [imageMode, setImageMode] = useState(uploadType.link);
  const [videoMode, setVideoMode] = useState(uploadType.link);
  const [adVideoMode, setAdVideoMode] = useState(uploadType.link);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: yupResolver(schema),
    mode: "onChange",
    defaultValues: {
      course_name: "",
      course_description: "",
      overview: "",
      level: "Beginner",
      Duration: "8 weeks",
      lessons: "16",
      p_price: "299",
      g_price: "199",
      image: "",
      video: "",
      advertising_video: "",
      hidden: "0",
      schedule: "",
      timezone: "EST",
      maxStudents: "50",
      sessionDuration: "60",
      meetingLink: "",
      wiil_learn: [],
      feature: [],
    },
  });

  const {
    fields: learnFields,
    append: appendLearn,
    remove: removeLearn,
  } = useFieldArray({
    control,
    name: "wiil_learn",
  });

  const {
    fields: featureFields,
    append: appendFeature,
    remove: removeFeature,
  } = useFieldArray({
    control,
    name: "feature",
  });

  const form = watch();
  const valid = useMemo(() => isValid, [isValid]);

  const handleImagePick = (file) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    setImageFile(file);
    setValue("image", URL.createObjectURL(file), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleVideoPick = (file, type) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a video file");
      return;
    }

    // Check file size (500MB limit)
    const isLt500M = file.size / 1024 / 1024 < 500;
    if (!isLt500M) {
      toast.error("Video must be smaller than 500MB!");
      return;
    }

    const url = URL.createObjectURL(file);

    if (type === "main") {
      setVideoFile(file);
      setValue("video", url, { shouldDirty: true, shouldValidate: true });
    } else {
      setAdvertisingVideoFile(file);
      setValue("advertising_video", url, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  };

  const onSubmit = async (data) => {
    const wiil_learn_str = data.wiil_learn
      .map((x) => x.value?.trim())
      .filter(Boolean)
      .join(", ");

    const feature_str = data.feature
      .map((x) => x.value?.trim())
      .filter(Boolean)
      .join(", ");

    const payload = {
      type: "online", // 👈 Main difference from regular courses
      course_name: data.course_name,
      course_description: data.course_description,
      overview: data.overview,
      level: data.level,
      Duration: data.Duration,
      lessons: String(data.lessons),
      private_price: String(data.p_price),
      group_price: String(data.g_price),
      image: data.image,
      video: data.video,
      advertising_video: data.advertising_video,
      wiil_learn: wiil_learn_str,
      feature: feature_str,
      created_at: new Date().toISOString().split("T")[0],
      hidden: data.hidden,
      // Live course specific fields
      schedule: data.schedule,
      timezone: data.timezone,
      max_students: String(data.maxStudents),
      session_duration: String(data.sessionDuration),
      meeting_link: data.meetingLink || "",
    };

    console.log("Live course payload:", payload);
    console.log("files (optional):", {
      imageFile,
      videoFile,
      advertisingVideoFile,
    });

    try {
      const response = await mutateAsync({ payload, type: "add" });
      console.log(response);
      if (response.status === "success") {
        toast.success("Live course added successfully");
        reset();
        router.push("/live-courses");
      } else {
        toast.error(response.message);
      }
    } catch (error) {
      toast.error("Failed to create live course");
    }
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]";
  const labelClass = "text-sm font-medium";

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
          title="Add Live Course"
          child="Live Courses"
          parent="Home"
        />

        <form
          onSubmit={handleSubmit(onSubmit)}
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
                Basic details about your live course.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Course Title *</label>
                  <input
                    {...register("course_name")}
                    className={inputClass}
                    placeholder="e.g., Advanced React Development"
                    required
                  />
                  {errors.course_name && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.course_name.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Short Description *</label>
                  <textarea
                    {...register("course_description")}
                    rows={3}
                    className={inputClass}
                    placeholder="Describe what students will learn in this live course"
                    required
                  />
                  {errors.course_description && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.course_description.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Detailed Overview</label>
                  <textarea
                    {...register("overview")}
                    rows={5}
                    className={inputClass}
                    placeholder="Detailed course overview for the course page"
                  />
                </div>

                <div>
                  <label className={labelClass}>Instructor *</label>
                  <input
                    {...register("teacher")}
                    className={inputClass}
                    placeholder="Instructor name"
                  />
                </div>

                <div>
                  <label className={labelClass}>Level *</label>
                  <select {...register("level")} className={inputClass}>
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Duration *</label>
                  <input
                    {...register("Duration")}
                    className={inputClass}
                    placeholder="e.g., 8 weeks"
                  />
                  {errors.Duration && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.Duration.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Total Sessions *</label>
                  <input
                    type="number"
                    onWheel={(e) => e.target.blur()}
                    min="1"
                    {...register("lessons")}
                    className={inputClass}
                    placeholder="16"
                  />
                  {errors.lessons && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.lessons.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Private Price ($) *</label>
                  <input
                    type="number"
                    onWheel={(e) => e.target.blur()}
                    min="0"
                    step="0.01"
                    {...register("p_price")}
                    className={inputClass}
                    placeholder="299"
                  />
                  {errors.p_price && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.p_price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Group Price ($) *</label>
                  <input
                    type="number"
                    onWheel={(e) => e.target.blur()}
                    min="0"
                    step="0.01"
                    {...register("g_price")}
                    className={inputClass}
                    placeholder="199"
                  />
                  {errors.g_price && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.g_price.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
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
                        {...register("image")}
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
                </div>

                <div className="sm:col-span-2">
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
                        {...register("video")}
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

                <div className="sm:col-span-2">
                  <label className={labelClass}>Status</label>
                  <select {...register("hidden")} className={inputClass}>
                    <option value="0">Visible</option>
                    <option value="1">Hidden</option>
                  </select>
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
                    {...register("advertising_video")}
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

            {/* Session Settings */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[var(--primary-color)]" />
                Session Settings
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Configure live session schedule and duration.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Session Duration *</label>
                  <select
                    {...register("sessionDuration")}
                    className={inputClass}
                    required
                  >
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">60 minutes</option>
                    <option value="90">90 minutes</option>
                    <option value="120">120 minutes</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Timezone *</label>
                  <select
                    {...register("timezone")}
                    className={inputClass}
                    required
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

            {/* Meeting & Capacity */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="w-5 h-5 text-[var(--primary-color)]" />
                Meeting & Capacity
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass}>Maximum Students *</label>
                  <input
                    type="number"
                    onWheel={(e) => e.target.blur()}
                    min="1"
                    max="100"
                    {...register("maxStudents")}
                    className={inputClass}
                    placeholder="50"
                    required
                  />
                  {errors.maxStudents && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.maxStudents.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Meeting Link (Optional)</label>
                  <input
                    type="url"
                    {...register("meetingLink")}
                    className={inputClass}
                    placeholder="https://zoom.us/j/..."
                  />
                  {errors.meetingLink && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.meetingLink.message}
                    </p>
                  )}
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
                    onClick={() => appendLearn({ value: "" })}
                    className="inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-sm hover:bg-slate-50"
                  >
                    <Plus size={14} /> Add item
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {learnFields.map((f, i) => (
                    <div key={f.id} className="flex gap-2">
                      <input
                        {...register(`wiil_learn.${i}.value`)}
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
                    onClick={() => appendFeature({ value: "" })}
                    className="inline-flex items-center gap-2 rounded-lg border px-2 py-1 text-sm hover:bg-slate-50"
                  >
                    <Plus size={14} /> Add feature
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  {featureFields.map((f, i) => (
                    <div key={f.id} className="flex gap-2">
                      <input
                        {...register(`feature.${i}.value`)}
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

            {/* Submit Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <button
                type="submit"
                disabled={!valid || isSubmitting}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[var(--primary-color)] text-white px-4 py-2 font-medium hover:opacity-90 disabled:opacity-60"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                {isSubmitting ? "Creating..." : "Create Live Course"}
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
                        "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1400&auto=format&fit=crop"
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
                      🔴 Live
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <h2 className="text-base sm:text-lg font-semibold tracking-tight line-clamp-1">
                    {form.course_name || "Live Course Title"}
                  </h2>
                  <p className="mt-1 text-slate-600 text-sm line-clamp-2">
                    {form.course_description ||
                      "A short course description will appear here."}
                  </p>

                  <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {form.lessons} sessions
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {form.sessionDuration} min
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        Max {form.maxStudents} students
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t">
                      <span className="text-xs text-slate-500">
                        {form.schedule || "Schedule TBA"}
                      </span>
                      <span className="font-semibold text-[var(--text-color)]">
                        ${form.g_price}
                      </span>
                    </div>
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
