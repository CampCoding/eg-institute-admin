"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import {
  Loader2,
  Save,
  ArrowLeft,
  Upload,
  Star,
  Tag as TagIcon,
  Link,
} from "lucide-react";
import { teachers } from "@/utils/data";

import {
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  Button,
  message,
} from "antd";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import dayjs from "dayjs";
import { uploadImage } from "../../../utils/FileUpload/FileUpload";
import usePostBlog from "../../../utils/Api/Blogs/PostBlog";
import toast from "react-hot-toast";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const TAGS = ["Featured", "Trending", "New", "None"];
const CATEGORIES = ["Language", "Culture", "Grammar", "Vocabulary", "Tips"];
const GRADIENTS = [
  "from-indigo-500 via-sky-500 to-emerald-500",
  "from-fuchsia-500 via-pink-500 to-amber-400",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-amber-500 via-orange-500 to-rose-500",
  "from-violet-500 via-purple-500 to-blue-500",
];

function slugify(s = "") {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export const blogSchema = yup.object({
  title: yup.string().trim().required("Title is required"),
  title_ar: yup.string().trim().optional(),
  excerpt: yup
    .string()
    .trim()
    .min(10, "Description is too short")
    .required("Description is required"),
  content: yup
    .string()
    .trim()
    .min(30, "Content is too short")
    .required("Content is required"),
  video_link: yup
    .string()
    .trim()
    .optional()
    .test("is-url", "Video link must be a valid URL", (v) => {
      if (!v) return true;
      try {
        new URL(v);
        return true;
      } catch {
        return false;
      }
    }),
  category: yup.string().oneOf(CATEGORIES).required("Category is required"),
  level: yup.string().oneOf(LEVELS).required("Level is required"),
  tag: yup.string().oneOf(TAGS).required("Tag is required"),
  readMins: yup
    .number()
    .typeError("Read time must be a number")
    .min(1)
    .max(120)
    .required("Read time is required"),

  cover: yup
    .string()
    .trim()
    .optional()
    .test("is-url", "Cover must be a valid URL", (v) => {
      if (!v) return true;
      if (v.startsWith("blob:")) return true;
      try {
        new URL(v);
        return true;
      } catch {
        return false;
      }
    }),
});
const uploadType = {
  link: "link",
  file: "file",
};

export default function AddBlogPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [upload, setUpload] = useState(uploadType.link);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isValid },

    reset,
  } = useForm({
    resolver: yupResolver(blogSchema),
    mode: "onTouched",
    defaultValues: {
      title: "",
      title_ar: "",
      excerpt: "",
      content: "",
      video_link: "",
      category: CATEGORIES[0],
      level: LEVELS[0],
      tag: "None",
      readMins: 6,
      cover: "",
      coverFile: null,
      coverFileName: "",
    },
  });

  const form = watch();

  // lite enable/disable submit (غير الـyup)

  // cleanup blob url
  useEffect(() => {
    return () => {
      if (form.cover?.startsWith("blob:")) URL.revokeObjectURL(form.cover);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCoverFile = (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("cover", { type: "manual", message: "File must be an image" });
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setError("cover", { type: "manual", message: "Max image size is 4MB" });
      return;
    }

    clearErrors("cover");
    
    // Revoke previous blob if any
    if (form.cover?.startsWith("blob:")) {
      URL.revokeObjectURL(form.cover);
    }

    const url = URL.createObjectURL(file);
    setValue("coverFile", file, { shouldDirty: true });
    setValue("coverFileName", file.name, { shouldDirty: true });
    setValue("cover", url, { shouldDirty: true, shouldValidate: true });
    
    // Switch to file mode if not already
    setUpload(uploadType.file);
  };

  const levelBadgeClass = (v) => {
    const x = (v || "").toLowerCase();
    if (x === "beginner")
      return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
    if (x === "intermediate")
      return "bg-blue-100 text-blue-700 ring-1 ring-blue-200";
    if (x === "advanced")
      return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
    if (x === "featured")
      return "bg-amber-200 text-amber-900 ring-1 ring-amber-300";
    if (x === "trending")
      return "bg-pink-200 text-pink-900 ring-1 ring-pink-300";
    if (x === "new")
      return "bg-violet-100 text-violet-700 ring-1 ring-violet-200";
    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  };

  const featureFrameClass =
    form.tag === "Featured"
      ? "border-[3px] border-teal-500 shadow-[0_8px_50px_-12px_rgba(20,184,166,0.35)]"
      : "border border-slate-200";

  console.log(errors);

  /*   const onSubmit = async (values) => {
    console.log(values);
    const payload = {
      title: values.title,
      arabic_title: values.title_ar,
      content: values.content,
      description: values.excerpt,
      category: values.category,
      level: values.level,
      tag: values.tag,
    };
    if (values.cover) {
      payload.image = values.cover;
    } else {
      try {
        console.log("enter");

     
        console.log(response);
        payload.image = response;
      } catch (err) {
        console.error(err);
        message.error("Failed to upload cover image");
      }
    }

    try {
      console.log(payload);

      // reset(); // لو عايز تصفر قبل الروت
    } catch (err) {
      console.error(err);
      message.error("Failed to save blog");
    } finally {
      setSaving(false);
    }
  };
 */
  const onSubmit = async (values) => {
    setSaving(true);

    const payload = {
      title: values.title,
      arabic_title: values.title_ar,
      content: values.content,
      description: values.excerpt,
      category: values.category,
      level: values.level,
      tag: values.tag,
      user_id: 1,
      //  video_link: values.video_link,
    };

    try {
      if (upload === uploadType.link) {
        // لو لينك
        payload.image = values.cover; // URL
      } else {
        // لو ملف
        const data = await uploadImage(values.coverFile);
        // حسب رد الـAPI: ممكن يكون data.url أو data مباشرة
        payload.image = data?.url ?? data;
      }

      console.log("FINAL PAYLOAD:", payload);
      const response = await usePostBlog({ payload, type: "add" });
      if (response.status === "success") {
        toast.success("Blog added successfully!");
        reset();
        window.location.href = "/blogs";
      } else {
        toast.error(response.message);
      }

      message.success("Saved!");
    } catch (err) {
      console.error(err);
      message.error("Upload failed");
    } finally {
      setSaving(false);
    }
  };
  return (
    <div className="min-h-screen mb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center mb-4 justify-between gap-2">
          <button
            type="button"
            onClick={() => router.push("/blogs")}
            className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </button>
        </div>

        <BreadCrumb title="Add Blog" child="Blog" parent="Home" />

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3"
        >
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold">Basic information</h2>
              <p className="text-sm text-slate-600 mt-1">
                Title, Description, taxonomy, and meta.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Form.Item
                    label="Title"
                    validateStatus={errors.title ? "error" : ""}
                    help={errors.title?.message}
                  >
                    <Controller
                      name="title"
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="e.g., The Art of Arabic Calligraphy"
                        />
                      )}
                    />
                  </Form.Item>
                  <p className="mt-2 text-xs text-slate-500">
                    Slug preview:{" "}
                    <span className="font-mono">
                      {slugify(form.title) || "—"}
                    </span>
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <Form.Item
                    label="Arabic Title (optional)"
                    validateStatus={errors.title_ar ? "error" : ""}
                    help={errors.title_ar?.message}
                  >
                    <Controller
                      name="title_ar"
                      control={control}
                      render={({ field }) => <Input {...field} />}
                    />
                  </Form.Item>
                </div>

                <div className="sm:col-span-2">
                  <Form.Item
                    label="Description"
                    validateStatus={errors.excerpt ? "error" : ""}
                    help={errors.excerpt?.message}
                  >
                    <Controller
                      name="excerpt"
                      control={control}
                      render={({ field }) => (
                        <Input.TextArea {...field} rows={3} />
                      )}
                    />
                  </Form.Item>
                </div>

                <div className="sm:col-span-2">
                  <Form.Item
                    label="Video Link"
                    validateStatus={errors.video_link ? "error" : ""}
                    help={errors.video_link?.message}
                  >
                    <Controller
                      name="video_link"
                      control={control}
                      render={({ field }) => (
                        <Input.TextArea
                          {...field}
                          rows={2}
                          placeholder="https://youtube.com/..."
                        />
                      )}
                    />
                  </Form.Item>
                </div>

                <div>
                  <Form.Item
                    label="Category"
                    validateStatus={errors.category ? "error" : ""}
                    help={errors.category?.message}
                  >
                    <Controller
                      name="category"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onChange={field.onChange}
                          options={CATEGORIES.map((c) => ({
                            value: c,
                            label: c,
                          }))}
                        />
                      )}
                    />
                  </Form.Item>
                </div>

                <div>
                  <Form.Item
                    label="Level / Label"
                    validateStatus={errors.level ? "error" : ""}
                    help={errors.level?.message}
                  >
                    <Controller
                      name="level"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onChange={field.onChange}
                          options={LEVELS.map((l) => ({ value: l, label: l }))}
                        />
                      )}
                    />
                  </Form.Item>
                </div>

                <div>
                  <Form.Item
                    label={
                      <span className="inline-flex items-center gap-1">
                        Tag <TagIcon size={14} />
                      </span>
                    }
                    validateStatus={errors.tag ? "error" : ""}
                    help={errors.tag?.message}
                  >
                    <Controller
                      name="tag"
                      control={control}
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onChange={field.onChange}
                          options={TAGS.map((t) => ({ value: t, label: t }))}
                        />
                      )}
                    />
                  </Form.Item>
                </div>

                {/* 
                <div className="sm:col-span-2">
                  <Form.Item
                    label="Read time (minutes)"
                    validateStatus={errors.readMins ? "error" : ""}
                    help={errors.readMins?.message}
                  >
                    <Controller
                      name="readMins"
                      control={control}
                      render={({ field }) => (
                        <InputNumber
                          min={1}
                          max={120}
                          className="w-full"
                          value={field.value}
                          onChange={(v) => field.onChange(v ?? 1)}
                        />
                      )}
                    />
                  </Form.Item>
                </div> */}
              </div>
            </div>

            {/* Media */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Cover image</h2>
                <div className="flex justify-between items-center gap-1">
                  <button
                    type="button"
                    onClick={() => {
                      setUpload(uploadType.file);
                    }}
                    className={`!bg-[var(--primary-color)] ${
                      upload !== uploadType.link ? "" : "opacity-50"
                    }  px-2 rounded-lg shadow-md py-0.5 text-white`}
                  >
                    {" "}
                    <Upload className="text-white " />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setUpload(uploadType.link);
                    }}
                    className={`!bg-[var(--primary-color)] ${
                      upload === uploadType.link ? "" : "opacity-50"
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
              <p className="text-sm text-slate-600 mt-1">
                Upload an image or paste a URL.
              </p>
              <div className=""></div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {upload !== uploadType.link ? (
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium mr-2">
                      Or upload file
                    </label>
                    <label className="mt-1 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                      <Upload size={16} />
                      <span className="truncate">
                        {form.coverFileName || "Choose image file"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => handleCoverFile(e.target.files?.[0])}
                      />
                    </label>
                  </div>
                ) : (
                  <>
                    <div className="sm:col-span-2">
                      <Form.Item
                        label="Image URL"
                        validateStatus={errors.cover ? "error" : ""}
                        help={errors.cover?.message}
                      >
                        <Controller
                          name="cover"
                          control={control}
                          render={({ field }) => <Input {...field} />}
                        />
                      </Form.Item>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold">Content</h2>
              <p className="text-sm text-slate-600 mt-1">
                Write the main article body.
              </p>

              <Form.Item
                validateStatus={errors.content ? "error" : ""}
                help={errors.content?.message}
              >
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <Input.TextArea
                      {...field}
                      rows={10}
                      placeholder="Start writing..."
                    />
                  )}
                />
              </Form.Item>
            </div>

            {/* Actions */}
            <div className="mt-4 relative z-20 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Button
                htmlType="submit"
                type="primary"
                disabled={!isValid || isSubmitting}
                className="!rounded-xl !bg-[var(--primary-color)] w-full sm:w-auto"
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <Save size={18} />
                )}
                <span className="ml-2">Save blog</span>
              </Button>

              <Button
                className="!rounded-xl w-full sm:w-auto"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </div>

          {/* Right: live preview */}
          <div className="lg:sticky lg:top-24">
            <div className="rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/60 p-6 shadow-xl shadow-slate-200/50">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    Live preview
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    How it will appear in the grid
                  </p>
                </div>
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <article
                className={`group relative overflow-hidden rounded-3xl bg-white transition-all duration-500 hover:-translate-y-1 ${
                  form.tag === "Featured"
                    ? "ring-2 ring-teal-500/50 shadow-2xl shadow-teal-500/20"
                    : "border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-slate-200/60"
                }`}
              >
                <div className="relative h-48 sm:h-60 overflow-hidden">
                  <img
                    src={
                      form.cover ||
                      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=1200&auto=format&fit=crop"
                    }
                    alt="Cover"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  {/* Badges Container */}
                  <div className="absolute top-4 left-4 flex flex-wrap gap-2 transition-transform duration-500 group-hover:translate-y-1">
                    {form.tag && form.tag !== "None" && (
                      <span
                        className={`backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${levelBadgeClass(
                          form.tag
                        )}`}
                      >
                        {form.tag}
                      </span>
                    )}
                    <span
                      className={`backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${levelBadgeClass(
                        form.level
                      )}`}
                    >
                      {form.level}
                    </span>
                  </div>

                  {form.tag === "Featured" && (
                    <div className="absolute right-4 top-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white p-2 shadow-lg animate-bounce-suble">
                      <Star size={16} fill="currentColor" />
                    </div>
                  )}
                  
                  {/* Category Badge - Floating Bottom */}
                  <div className="absolute bottom-4 left-4">
                    <span className="px-2 py-1 rounded-lg bg-teal-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                      {form.category}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight line-clamp-2 group-hover:text-teal-600 transition-colors duration-300">
                      {form.title || "Untitled Masterpiece"}
                    </h2>
                    {form.title_ar && (
                      <div className="text-teal-600/80 text-sm font-semibold dir-rtl line-clamp-1 italic">
                        {form.title_ar}
                      </div>
                    )}
                  </div>

                  <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed font-normal">
                    {form.excerpt || "Your compelling story starts here. This summary will draw readers in..."}
                  </p>

                  <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {(form.author || "A")[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">
                          {form.author || "Staff Writer"}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {dayjs().format("MMM DD, YYYY")}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-slate-400">
                       <span className="flex items-center gap-1 text-[11px] font-semibold">
                         <Loader2 size={12} className="animate-spin-slow" />
                         {form.readMins || 5} min
                       </span>
                    </div>
                  </div>
                </div>
              </article>
              
              <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-white shadow-sm text-teal-600">
                    <TagIcon size={16} />
                  </div>
                  <span className="text-sm font-bold text-slate-700">Display Settings</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Shadow</div>
                  <div className="text-[10px] text-slate-700 font-bold text-right">{form.tag === "Featured" ? "Heavy" : "Light"}</div>
                  <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Animation</div>
                  <div className="text-[10px] text-slate-700 font-bold text-right">Slide-up</div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
