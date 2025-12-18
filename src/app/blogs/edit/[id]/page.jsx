"use client";

import React, { useEffect, useMemo, useState } from "react";
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
import { uploadImage } from "@/utils/FileUpload/FileUpload";
import usePostBlog from "@/utils/Api/Blogs/PostBlog";
import toast from "react-hot-toast";
import useGetBlogById from "../../../../utils/Api/Blogs/GetBlogById";
import { blogSchema } from "../../add/page";

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
    console.log(payload);

    reset(payload);
  }, [data, reset]);

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
    if (form.cover?.startsWith("blob:")) URL.revokeObjectURL(form.cover);

    const url = URL.createObjectURL(file);
    setValue("coverFile", file, { shouldDirty: true });
    setValue("coverFileName", file.name, { shouldDirty: true });
    setValue("cover", url, { shouldDirty: true, shouldValidate: true });
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
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h3 className="font-semibold">Live preview</h3>
              <p className="text-sm text-slate-600">
                Matches your blogs grid card.
              </p>

              <article
                className={`group relative mt-4 overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 ${
                  form.tag === "Featured"
                    ? "border-[3px] border-teal-500 shadow-[0_8px_50px_-12px_rgba(20,184,166,0.35)]"
                    : "border border-slate-200"
                }`}
              >
                <div className="relative h-44 sm:h-56 overflow-hidden">
                  <img
                    src={
                      form.cover ||
                      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=1200&auto=format&fit=crop"
                    }
                    alt="Cover"
                    className="h-full w-full object-cover"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-r ${form.gradient} opacity-25`}
                  />

                  <div className="absolute top-3 left-3 flex gap-2">
                    {form.tag !== "None" && (
                      <span
                        className={`text-[11px] rounded-full px-2 py-1 ${levelBadgeClass(
                          form.tag
                        )}`}
                      >
                        {form.tag}
                      </span>
                    )}
                    <span
                      className={`text-[11px] rounded-full px-2 py-1 ${levelBadgeClass(
                        form.level
                      )}`}
                    >
                      {form.level}
                    </span>
                  </div>

                  {form.tag === "Featured" && (
                    <div className="absolute right-3 top-3 rounded-full bg-black/50 text-white p-1">
                      <Star size={16} />
                    </div>
                  )}
                </div>

                <div className="p-4">
                  <h2 className="text-base sm:text-lg font-semibold tracking-tight line-clamp-2">
                    {form.title || "Blog title"}
                  </h2>
                  {form.title_ar && (
                    <div className="mt-1 text-teal-700 text-sm font-medium line-clamp-1">
                      {form.title_ar}
                    </div>
                  )}
                  <p className="mt-2 text-slate-600 text-sm line-clamp-2">
                    {form.excerpt || "A short summary will appear here."}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-200 grid place-items-center text-[10px] font-semibold">
                        {(form.author || "A")[0]}
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="font-medium">
                          {form.author || "Author"}
                        </span>
                        {form.category && (
                          <span className="text-[11px] text-slate-500">
                            {form.category}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-auto flex items-center gap-3 text-xs sm:text-[13px]">
                      <span className="inline-flex items-center gap-1">
                        {form.date ? dayjs(form.date).format("YYYY-MM-DD") : ""}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        {form.readMins} min read
                      </span>
                      <span className="inline-flex items-center gap-1">0</span>
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
