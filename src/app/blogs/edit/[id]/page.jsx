"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import {
  Loader2,
  Save,
  ArrowLeft,
  Upload,
  Star,
  Tag as TagIcon,
} from "lucide-react";
import { teachers } from "@/utils/data"; // authors list

/** Keep this seed list in-sync with Blogs page.
 *  If you later move it to "@/utils/blogs", import it here and delete this constant.
 */
const SEED_BLOGS = [
  {
    id: "b1",
    slug: "10-essential-arabic-phrases",
    title: "10 Essential Arabic Phrases Every Beginner Should Know",
    title_ar: "عشر عبارات أساسية في اللغة العربية",
    excerpt:
      "Master these fundamental phrases and start your Arabic journey with confidence. Perfect for absolute beginners.",
    cover:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=1200&auto=format&fit=crop",
    level: "Beginner",
    tag: "Trending",
    category: "Language",
    author: { name: "Dr. Amina Hassan", name_ar: "د. أمينة حسن", avatar: "" },
    date: "2024-03-15",
    readMins: 5,
    views: 2300,
    likes: 89,
    comments: 23,
    featured: false,
    gradient: "from-indigo-500 via-sky-500 to-emerald-500",
  },
  {
    id: "b2",
    slug: "art-of-arabic-calligraphy-visual-journey",
    title: "The Art of Arabic Calligraphy: A Visual Journey",
    title_ar: "فن الخط العربي: رحلة بصرية",
    excerpt:
      "Explore the mesmerizing world of Arabic calligraphy and its profound cultural significance throughout history.",
    cover:
      "https://images.unsplash.com/photo-1587586115507-8f5e0d5f0c76?q=80&w=1200&auto=format&fit=crop",
    level: "Culture",
    tag: "Featured",
    category: "Culture",
    author: { name: "Ahmed Al-Khattat", name_ar: "أحمد الخطاط", avatar: "" },
    date: "2024-03-12",
    readMins: 8,
    views: 4100,
    likes: 156,
    comments: 45,
    featured: true,
    gradient: "from-fuchsia-500 via-pink-500 to-amber-400",
  },
  {
    id: "b3",
    slug: "advanced-grammar-verb-conjugations",
    title: "Advanced Grammar: Mastering Arabic Verb Conjugations",
    title_ar: "القواعد المتقدمة: إتقان تصريف الأفعال العربية",
    excerpt:
      "Dive deep into Arabic verb patterns and conjugations with practical examples and memory techniques.",
    cover:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=1200&auto=format&fit=crop",
    level: "Advanced",
    tag: "New",
    category: "Grammar",
    author: {
      name: "Prof. Sarah Mahmoud",
      name_ar: "أ. سارة محمود",
      avatar: "",
    },
    date: "2024-03-10",
    readMins: 12,
    views: 1800,
    likes: 67,
    comments: 31,
    featured: false,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
  },
];

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

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams(); // /blogs/edit/[id]
  const paramKey = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [form, setForm] = useState({
    id: "",
    slug: "",
    title: "",
    title_ar: "",
    excerpt: "",
    content: "",
    video_link: "",
    category: CATEGORIES[0],
    level: LEVELS[0],
    tag: TAGS[3], // "None"
    readMins: 6,
    author: "",
    date: new Date().toISOString().slice(0, 10),
    cover: "",
    coverFileName: "",
    gradient: GRADIENTS[0],
    featured: false,
    views: 0,
    likes: 0,
    comments: 0,
  });

  const [saving, setSaving] = useState(false);
  const valid = useMemo(
    () => form.title.trim().length > 0 && form.excerpt.trim().length > 0,
    [form.title, form.excerpt]
  );

  // Load blog by id OR slug from localStorage, falling back to seeds.
  useEffect(() => {
    try {
      if (typeof window === "undefined" || !paramKey) return;

      const drafts = JSON.parse(localStorage.getItem("blogDrafts") || "[]");
      const fromDrafts =
        drafts.find((b) => b.id === paramKey) ||
        drafts.find((b) => b.slug === paramKey);

      const source = fromDrafts
        ? fromDrafts
        : SEED_BLOGS.find((b) => b.id === paramKey || b.slug === paramKey) ||
          null;

      if (!source) {
        setNotFound(true);
      } else {
        setForm({
          id: source.id,
          slug: source.slug,
          title: source.title || "",
          title_ar: source.title_ar || "",
          excerpt: source.excerpt || "",
          content: source.content || "",
          category: source.category || CATEGORIES[0],
          level: source.level || LEVELS[0],
          tag:
            typeof source.tag === "string"
              ? source.tag
              : source.featured
              ? "Featured"
              : "None",
          readMins: typeof source.readMins === "number" ? source.readMins : 6,
          author:
            source.author?.name ||
            source.author ||
            teachers?.[0]?.name ||
            "Unknown",
          date: (source.date || new Date().toISOString().slice(0, 10)).slice(
            0,
            10
          ),
          cover: source.cover || "",
          coverFileName: "",
          gradient: source.gradient || GRADIENTS[0],
          featured: !!source.featured,
          views: source.views ?? 0,
          likes: source.likes ?? 0,
          comments: source.comments ?? 0,
        });
      }
    } catch (e) {
      console.error(e);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [paramKey]);

  const onChange = (key, val) => setForm((s) => ({ ...s, [key]: val }));

  const handleCoverFile = (file) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setForm((s) => ({ ...s, cover: url, coverFileName: file.name }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;
    setSaving(true);

    const updated = {
      ...form,
      slug: slugify(form.title) || form.slug || form.id,
      featured: form.tag === "Featured",
      // keep author shape consistent with list page
      author:
        typeof form.author === "string" ? { name: form.author } : form.author,
      updatedAt: new Date().toISOString(),
    };

    try {
      if (typeof window !== "undefined") {
        const drafts = JSON.parse(localStorage.getItem("blogDrafts") || "[]");

        // If editing a seed blog first time, this will insert it into drafts.
        const idx = drafts.findIndex((b) => b.id === form.id);
        let next = drafts;
        if (idx >= 0) next[idx] = updated;
        else next = [updated, ...drafts];

        localStorage.setItem("blogDrafts", JSON.stringify(next));
      }
      router.push("/blogs");
    } catch (err) {
      console.error(err);
      alert("Failed to update blog. Check console for details.");
    } finally {
      setSaving(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <div className="inline-flex items-center gap-2 text-slate-600">
          <Loader2 className="animate-spin" /> Loading blog…
        </div>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <button
            type="button"
            onClick={() => router.push("/blogs")}
            className="inline-flex items-center rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
          >
            <ArrowLeft size={16} className="mr-1" />
            Back
          </button>
          <div className="mt-6 rounded-2xl bg-white border border-slate-200 p-6">
            <h2 className="text-lg font-semibold">Blog not found</h2>
            <p className="text-slate-600 mt-1">
              We couldn’t find a blog with ID/slug: <b>{paramKey}</b>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl  py-4">
        {/* Top bar */}
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

        <BreadCrumb title="Edit Blog" child="Blog" parent="Home" />

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
                Title, Description, taxonomy, and meta.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => onChange("title", e.target.value)}
                    placeholder="e.g., The Art of Arabic Calligraphy"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">
                    Arabic Title (optional)
                  </label>
                  <input
                    value={form.title_ar}
                    onChange={(e) => onChange("title_ar", e.target.value)}
                    placeholder="العنوان بالعربية"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={form.excerpt}
                    onChange={(e) => onChange("excerpt", e.target.value)}
                    rows={3}
                    placeholder="A short summary that appears on the card."
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Video Link</label>
                  <textarea
                    value={form.video_link}
                    onChange={(e) => onChange("video_link", e.target.value)}
                    rows={3}
                    placeholder="A video about this blog."
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => onChange("category", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)] bg-white"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Level / Label</label>
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
                  <label className="text-sm font-medium flex items-center gap-1">
                    Tag <TagIcon size={14} />
                  </label>
                  <select
                    value={form.tag}
                    onChange={(e) => onChange("tag", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)] bg-white"
                  >
                    {TAGS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Author</label>
                  <input
                    value={form.author}
                    onChange={(e) => onChange("author", e.target.value)}
                    className=" w-full rounded-xl border border-slate-200 px-3 py-[6px] outline-none focus:ring-2 ring-[var(--primary-color)] bg-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Publish date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => onChange("date", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)] bg-white"
                  />
                </div>
              </div>
            </div>

            {/* Media */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold">Cover image</h2>
              <p className="text-sm text-slate-600 mt-1">
                Upload an image or paste a URL. A soft gradient overlay is
                applied in the card.
              </p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Image URL</label>
                  <input
                    value={form.cover}
                    onChange={(e) => onChange("cover", e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Or upload file</label>
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
              </div>
            </div>

            {/* Content */}
            <div className="rounded-2xl bg-white border border-slate-200 p-5">
              <h2 className="text-lg font-semibold">Content</h2>
              <p className="text-sm text-slate-600 mt-1">
                Write or update the main article body.
              </p>
              <textarea
                value={form.content}
                onChange={(e) => onChange("content", e.target.value)}
                rows={10}
                placeholder="Start writing your blog post..."
                className="mt-3 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
              />
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
                Update blog
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
                Matches your blogs grid card.
              </p>

              <article
                className={`group relative mt-4 overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 ${featureFrameClass}`}
              >
                {/* soft blobs */}
                <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />
                <div className="pointer-events-none absolute -right-10 bottom-20 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />

                {/* cover */}
                <div className="relative h-44 sm:h-56 overflow-hidden">
                  {form.cover ? (
                    <img
                      src={form.cover}
                      alt="Cover"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <img
                      src="https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?q=80&w=1200&auto=format&fit=crop"
                      alt="Cover"
                      className="h-full w-full object-cover"
                    />
                  )}
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

                {/* body */}
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

                  {/* meta */}
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                    <div className="inline-flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-slate-200 grid place-items-center text-[10px] font-semibold">
                        {
                          (typeof form.author === "string"
                            ? form.author
                            : form.author?.name || "A")[0]
                        }
                      </div>
                      <div className="flex flex-col leading-tight">
                        <span className="font-medium">
                          {typeof form.author === "string"
                            ? form.author
                            : form.author?.name || "Author"}
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
                        <svg viewBox="0 0 24 24" className="h-4 w-4">
                          <path
                            fill="currentColor"
                            d="M19 3h-1V1h-2v2H8V1H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 16H5V8h14v11Z"
                          />
                        </svg>
                        {form.date}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <svg viewBox="0 0 24 24" className="h-4 w-4">
                          <path
                            fill="currentColor"
                            d="M12 8v5l4 2 .75-1.86-2.75-1.39V8z"
                          />
                        </svg>
                        {form.readMins} min read
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <svg viewBox="0 0 24 24" className="h-4 w-4">
                          <path
                            fill="currentColor"
                            d="M12 6c-5 0-9 3.58-9 8 0 1.93 1.05 3.68 2.78 5 .3.24.73.27 1.07.08l2.63-1.5c.28-.16.47-.46.5-.78l.13-1.3c.02-.24.14-.45.32-.6.37-.3.83-.47 1.33-.47 1.73 0 3.13-1.4 3.13-3.13S13.73 8.67 12 8.67c-.66 0-1.27.2-1.78.53-.36.22-.83.18-1.14-.1l-1.24-1.1c-.34-.31-.35-.85-.02-1.17C8.44 5.52 10.14 5 12 5c3.87 0 7 2.46 7 5.5S15.87 16 12 16"
                          />
                        </svg>
                        {form.views ?? 0}
                      </span>
                    </div>
                  </div>

                  {/* actions (preview only) */}
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      className="flex-1 rounded-xl bg-[var(--primary-color)] text-white py-2 text-sm font-medium opacity-80 cursor-default"
                    >
                      Read
                    </button>
                    <button
                      type="button"
                      className="size-10 rounded-xl border border-slate-200 grid place-items-center bg-white text-slate-400 cursor-default"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5">
                        <path
                          fill="currentColor"
                          d="M12.1 21.35 10 19.28C5.4 15.36 2 12.28 2 8.5A4.5 4.5 0 0 1 6.5 4 5.5 5.5 0 0 1 12 6.09 5.5 5.5 0 0 1 17.5 4 4.5 4.5 0 0 1 22 8.5c0 3.78-3.4 6.86-8 10.78l-1.9 2.07z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="size-10 rounded-xl border border-slate-200 grid place-items-center bg-white text-slate-400 cursor-default"
                    >
                      <svg viewBox="0 0 24 24" className="h-5 w-5">
                        <path
                          fill="currentColor"
                          d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"
                        />
                      </svg>
                    </button>
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
