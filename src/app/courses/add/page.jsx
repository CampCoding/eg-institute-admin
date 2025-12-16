"use client";

import React, { useMemo, useState } from "react";
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
    .required("Lessons is required")
    .test("is-valid-lessons", "Lessons must be >= 1", (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 1;
    }),
  price: yup
    .string()
    .required("Price is required")
    .test("is-valid-price", "Price must be >= 0", (v) => {
      const n = Number(v);
      return Number.isFinite(n) && n >= 0;
    }),
  image: yup.string().default(""),
  video: yup.string().default(""),
  advertising_video: yup.string().default(""),
  type: yup.mixed().oneOf(["Online", "Offline", "Hybrid"]).required(),
  hidden: yup.mixed().oneOf(["0", "1"]).required(),
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

export default function AddCoursePage() {
  const router = useRouter();
  const { isPending, mutateAsync } = usePostCourse();
  // files optional (لو هتبعتهُم بعدين في الـ API call)
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [advertisingVideoFile, setAdvertisingVideoFile] = useState(null);
  const [imageMode, setImageMode] = useState(uploadType.link); // link | "file"
  const [videoMode, setVideoMode] = useState(uploadType.link);
  const [adVideoMode, setAdVideoMode] = useState(uploadType.link);

  const switchMode = (kind, mode) => {
    if (kind === "image") {
      setImageMode(mode);
      if (mode === "link") {
        setImageFile(null);
        // اختياري: تفضّي القيمة
        // setValue("image", "", { shouldDirty: true, shouldValidate: true });
      } else {
        // mode === "file"
        // اختياري: تفضّي اللينك لو كان مكتوب
        // setValue("image", "", { shouldDirty: true, shouldValidate: true });
      }
    }

    if (kind === "video") {
      setVideoMode(mode);
      if (mode === "link") {
        setVideoFile(null);
        // setValue("video", "", { shouldDirty: true, shouldValidate: true });
      } else {
        // setValue("video", "", { shouldDirty: true, shouldValidate: true });
      }
    }

    if (kind === "ad") {
      setAdVideoMode(mode);
      if (mode === "link") {
        setAdvertisingVideoFile(null);
        // setValue("advertising_video", "", { shouldDirty: true, shouldValidate: true });
      } else {
        // setValue("advertising_video", "", { shouldDirty: true, shouldValidate: true });
      }
    }
  };

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
      Duration: "12 weeks",
      lessons: "12",
      price: "50",
      image: "",
      video: "",
      advertising_video: "",
      type: "Online",
      hidden: "0",
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

  // اختيار صورة/فيديو للـ preview فقط (بدون upload)
  const handleImagePick = (file) => {
    if (!file.type.startsWith("image/")) return;
    setImageFile(file);
    setValue("image", URL.createObjectURL(file), {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleVideoPick = (file, type) => {
    if (!file.type.startsWith("video/")) return;
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
      type: data.type,
      course_name: data.course_name,
      course_description: data.course_description,
      overview: data.overview,
      level: data.level,
      Duration: data.Duration,
      lessons: String(data.lessons),
      price: String(data.price),
      image: data.image,
      video: data.video,
      advertising_video: data.advertising_video,
      wiil_learn: wiil_learn_str,
      feature: feature_str,
      created_at: new Date().toISOString().split("T")[0], // نفس مثال الـ API
      hidden: data.hidden,
    };

    console.log("payload to send:", payload);
    console.log("files (optional):", {
      imageFile,
      videoFile,
      advertisingVideoFile,
    });
    try {
      const response = await mutateAsync({ payload, type: "add" });
      console.log(response);
      if (response.status === "success") {
        toast.success("Course added successfully");
        reset();
        router.push("/courses");
      } else {
        toast.error(response.message);
      }
    } catch (error) {}
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
            onClick={() => router.push("/courses")}
            className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </button>
        </div>

        <BreadCrumb title="Add Course" child="Courses" parent="Home" />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold">Basic information</h2>
              <p className="text-sm text-slate-600 mt-1">
                Title, description, level, and pricing.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className={labelClass}>Course Name</label>
                  <input
                    {...register("course_name")}
                    className={inputClass}
                    required
                  />
                  {errors.course_name && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.course_name.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>Short Description</label>
                  <textarea
                    {...register("course_description")}
                    rows={3}
                    className={inputClass}
                    required
                  />
                  {errors.course_description && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.course_description.message}
                    </p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass}>
                    Long Overview (details page)
                  </label>
                  <textarea
                    {...register("overview")}
                    rows={5}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Level</label>
                  <select {...register("level")} className={inputClass}>
                    {LEVELS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Duration</label>
                  <input {...register("Duration")} className={inputClass} />
                  {errors.Duration && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.Duration.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Lessons</label>
                  <input
                    type="number"
                    min="1"
                    {...register("lessons")}
                    className={inputClass}
                  />
                  {errors.lessons && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.lessons.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Price ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("price")}
                    className={inputClass}
                  />
                  {errors.price && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.price.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className={labelClass}>Type</label>
                  <select {...register("type")} className={inputClass}>
                    <option value="Online">Online</option>
                    <option value="Offline">Offline</option>
                    <option value="Hybrid">Hybrid</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <div className="flex justify-between items-center">
                    <label className={labelClass}>Image URL or Upload</label>
                    <div className="flex justify-between items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setImageMode(uploadType.file);
                        }}
                        className={`!bg-[var(--primary-color)] ${
                          imageMode !== uploadType.link ? "" : "opacity-50"
                        }  px-2 rounded-lg shadow-md py-0.5 text-white`}
                      >
                        {" "}
                        <Upload className="text-white " />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImageMode(uploadType.link);
                        }}
                        className={`!bg-[var(--primary-color)] ${
                          imageMode === uploadType.link ? "" : "opacity-50"
                        }  px-2 rounded-lg shadow-md py-0.5 text-white`}
                      >
                        {" "}
                        <Link className="text-white " />
                      </button>
                      {/*    <button>
                    {" "}
                    <Link />
                  </button> */}
                    </div>
                  </div>

                  <div className="mt-2 flex items-center gap-3"></div>

                  {/* LINK */}
                  {imageMode === "link" && (
                    <div className="mt-2">
                      <input
                        {...register("image")}
                        placeholder="https://images.unsplash.com/..."
                        className={`${inputClass} w-full`}
                      />
                    </div>
                  )}

                  {/* FILE */}
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
              </div>
              <div className="mt-4">
                <div className="mt-2 flex items-center justify-between gap-3">
                  <label className={labelClass}>Main Video</label>
                  <div className="flex justify-between items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setVideoMode(uploadType.file);
                      }}
                      className={`!bg-[var(--primary-color)] ${
                        videoMode !== uploadType.link ? "" : "opacity-50"
                      }  px-2 rounded-lg shadow-md py-0.5 text-white`}
                    >
                      {" "}
                      <Upload className="text-white " />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoMode(uploadType.link);
                      }}
                      className={`!bg-[var(--primary-color)] ${
                        videoMode === uploadType.link ? "" : "opacity-50"
                      }  px-2 rounded-lg shadow-md py-0.5 text-white`}
                    >
                      {" "}
                      <Link className="text-white " />
                    </button>
                    {/*    <button>
                    {" "}
                    <Link />
                  </button> */}
                  </div>
                </div>

                {/* LINK */}
                {videoMode === "link" && (
                  <div className="mt-2">
                    <input
                      {...register("video")}
                      placeholder="https://cdn.example.com/intro.mp4"
                      className={`${inputClass} w-full`}
                    />
                  </div>
                )}

                {/* FILE */}
                {videoMode === "file" && (
                  <div className="mt-2 w-full">
                    <label className="flex mt-5 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                      <Upload size={16} />
                      Upload Video
                      <input
                        type="file"
                        accept="video/*"
                        className="sr-only w-full"
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
              <div className="my-2">
                <label className={labelClass}>Status</label>
                <select {...register("hidden")} className={inputClass}>
                  <option value="0">Visible</option>
                  <option value="1">Hidden</option>
                </select>
              </div>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <div className="flex justify-between items-center ">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Play className="w-5 h-5 text-[var(--primary-color)]" />
                  Advertising Video
                </h2>
                <div className="flex justify-between items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setAdVideoMode(uploadType.file);
                    }}
                    className={`!bg-[var(--primary-color)] ${
                      adVideoMode !== uploadType.link ? "" : "opacity-50"
                    }  px-2 rounded-lg shadow-md py-0.5 text-white`}
                  >
                    {" "}
                    <Upload className="text-white " />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAdVideoMode(uploadType.link);
                    }}
                    className={`!bg-[var(--primary-color)] ${
                      adVideoMode === uploadType.link ? "" : "opacity-50"
                    }  px-2 rounded-lg shadow-md py-0.5 text-white`}
                  >
                    {" "}
                    <Link className="text-white " />
                  </button>
                  {/*    <button>
                    {" "}
                    <Link />
                  </button> */}
                </div>
              </div>
              <div>
                {/* LINK */}
                {adVideoMode === "link" && (
                  <div className="mt-2">
                    <input
                      {...register("advertising_video")}
                      placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                      className={`${inputClass} w-full`}
                    />
                    <p className="text-sm text-slate-500 mt-2">
                      Supported: YouTube, Vimeo, or direct video file URLs
                    </p>
                  </div>
                )}
                {/* FILE */}
                {adVideoMode === "file" && (
                  <div className="mt-2">
                    <label className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
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
                        Advertising video selected: {advertisingVideoFile.name}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

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
                {isSubmitting ? "Preparing..." : "Add Course"}
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
        </form>
      </div>
    </div>
  );
}
