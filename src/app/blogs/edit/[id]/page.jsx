"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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

import { Form, Input, Select, Button, message } from "antd";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import dayjs from "dayjs";
import toast from "react-hot-toast";

import { uploadImage } from "@/utils/FileUpload/FileUpload";
import usePostBlog from "@/utils/Api/Blogs/PostBlog";
import useGetBlogById from "../../../../utils/Api/Blogs/GetBlogById";
import { blogSchema } from "../../add/page";

const LEVELS = ["Beginner", "Intermediate", "Advanced"];
const TAGS = ["Featured", "Trending", "New", "None"];
const CATEGORIES = ["Language", "Culture", "Grammar", "Vocabulary", "Tips"];

function slugify(s = "") {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

const uploadType = {
  link: "link",
  file: "file",
};

export default function EditBlogPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [upload, setUpload] = useState(uploadType.link);

  const { id } = useParams();
  const { data, isLoading, isError, error } = useGetBlogById({ id });
  console.log({ isLoading, isError, error });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isValid },
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

  // ✅ WATCH FIELDS (important for live preview re-render)
  const title = watch("title");
  const title_ar = watch("title_ar");
  const excerpt = watch("excerpt");
  const content = watch("content");
  const video_link = watch("video_link");
  const category = watch("category");
  const level = watch("level");
  const tag = watch("tag");
  const readMins = watch("readMins");
  const cover = watch("cover");
  const coverFileName = watch("coverFileName");

  useEffect(() => {
    const msg = data?.message;
    if (!msg) return;

    const payload = {
      title: msg?.title ?? "",
      title_ar: msg?.arabic_title ?? "",
      excerpt: msg?.description ?? "",
      content: msg?.content ?? "",
      video_link: msg?.video_link ?? "",
      category: CATEGORIES[Number(msg?.category)] ?? CATEGORIES[0],
      level: msg?.level ?? LEVELS[0],
      tag: TAGS.includes(msg?.tag) ? msg?.tag : "None",
      readMins: Number(msg?.readMins ?? 6),
      cover: msg?.image ?? "",
      coverFile: null,
      coverFileName: "",
    };

    reset(payload);
  }, [data, reset]);

  // ✅ cleanup blob url
  useEffect(() => {
    return () => {
      if (cover?.startsWith("blob:")) URL.revokeObjectURL(cover);
    };
  }, [cover]);

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

    // revoke old blob if any
    if (cover?.startsWith("blob:")) {
      URL.revokeObjectURL(cover);
    }

    const url = URL.createObjectURL(file);

    setValue("coverFile", file, { shouldDirty: true });
    setValue("coverFileName", file.name, { shouldDirty: true });

    // ✅ shouldTouch is important so RHF updates watchers reliably
    setValue("cover", url, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });

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
      // video_link: values.video_link,
    };

    try {
      if (upload === uploadType.link) {
        payload.image = values.cover; // URL
      } else {
        const uploaded = await uploadImage(values.coverFile);
        payload.image = uploaded?.url ?? uploaded;
      }

      const response = await usePostBlog({ payload, type: "edit", id });

      if (response.status === "success") {
        toast.success("Blog updated successfully!");
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

  if (isLoading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="inline-flex items-center gap-2 text-slate-600">
          <Loader2 className="animate-spin" /> Loading Students.....
        </div>
      </div>
    );
  }

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

        <BreadCrumb title="Edit Blog" child="Edit" parent="Blogs" />

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
                    <span className="font-mono">{slugify(title) || "—"}</span>
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
              </div>
            </div>

            {/* Media */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Cover image</h2>
                <div className="flex justify-between items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setUpload(uploadType.file)}
                    className={`!bg-[var(--primary-color)] ${
                      upload !== uploadType.link ? "" : "opacity-50"
                    } px-2 rounded-lg shadow-md py-0.5 text-white`}
                  >
                    <Upload className="text-white" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setUpload(uploadType.link)}
                    className={`!bg-[var(--primary-color)] ${
                      upload === uploadType.link ? "" : "opacity-50"
                    } px-2 rounded-lg shadow-md py-0.5 text-white`}
                  >
                    <Link className="text-white" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-600 mt-1">
                Upload an image or paste a URL.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                {upload !== uploadType.link ? (
                  <div className="sm:col-span-2">
                    <label className="text-sm font-medium mr-2">
                      Or upload file
                    </label>

                    <label className="mt-1 inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer">
                      <Upload size={16} />
                      <span className="truncate">
                        {coverFileName || "Choose image file"}
                      </span>

                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          handleCoverFile(file);
                          e.target.value = ""; // ✅ allow re-select same file
                        }}
                      />
                    </label>
                  </div>
                ) : (
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
                  tag === "Featured"
                    ? "ring-2 ring-teal-500/50 shadow-2xl shadow-teal-500/20"
                    : "border border-slate-100 shadow-lg shadow-slate-200/40 hover:shadow-xl hover:shadow-slate-200/60"
                }`}
              >
                <div className="relative h-48 sm:h-60 overflow-hidden">
                  <img
                    key={cover || "fallback"} // ✅ force img refresh
                    src={
                      cover ||
                      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=1200&auto=format&fit=crop"
                    }
                    alt="Cover"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="absolute top-4 left-4 flex flex-wrap gap-2 transition-transform duration-500 group-hover:translate-y-1">
                    {tag && tag !== "None" && (
                      <span
                        className={`backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${levelBadgeClass(
                          tag
                        )}`}
                      >
                        {tag}
                      </span>
                    )}

                    <span
                      className={`backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${levelBadgeClass(
                        level
                      )}`}
                    >
                      {level}
                    </span>
                  </div>

                  {tag === "Featured" && (
                    <div className="absolute right-4 top-4 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white p-2 shadow-lg animate-bounce-suble">
                      <Star size={16} fill="currentColor" />
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4">
                    <span className="px-2 py-1 rounded-lg bg-teal-500/90 backdrop-blur-sm text-white text-[10px] font-bold uppercase tracking-widest shadow-lg">
                      {category}
                    </span>
                  </div>
                </div>

                <div className="p-5 space-y-3">
                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight line-clamp-2 group-hover:text-teal-600 transition-colors duration-300">
                      {title || "Untitled Masterpiece"}
                    </h2>

                    {title_ar && (
                      <div className="text-teal-600/80 text-sm font-semibold dir-rtl line-clamp-1 italic text-right">
                        {title_ar}
                      </div>
                    )}
                  </div>

                  <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed font-normal">
                    {excerpt ||
                      "Your compelling story starts here. This summary will draw readers in..."}
                  </p>

                  <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-md">
                        {(title || "A")[0]}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">
                          Staff Writer
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {dayjs().format("MMM DD, YYYY")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="flex items-center gap-1 text-[11px] font-semibold">
                        <Loader2 size={12} className="animate-spin-slow" />
                        {readMins || 5} min
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
