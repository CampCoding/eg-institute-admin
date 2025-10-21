"use client";
import React, { useEffect, useMemo, useState } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { useRouter } from "next/navigation";
import { Bookmark, Trash, Edit } from "lucide-react";
import DeleteModal from "../../components/DeleteModal/DeleteModal";

// If you have a real blogs file, import it and remove the mock below.
// import { blogs as initialBlogs } from "@/utils/blogs";

const initialBlogs = [
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
    author: { name: "Prof. Sarah Mahmoud", name_ar: "أ. سارة محمود", avatar: "" },
    date: "2024-03-10",
    readMins: 12,
    views: 1800,
    likes: 67,
    comments: 31,
    featured: false,
  },
];

export default function BlogsPage() {
  const router = useRouter();

  // live blogs list (initial + localStorage drafts, de-duplicated by id)
  const [blogs, setBlogs] = useState(initialBlogs);

  const [searchTerm, setSearchTerm] = useState("");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState(null);

  // hydrate from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const drafts = JSON.parse(localStorage.getItem("blogDrafts") || "[]");
      if (Array.isArray(drafts) && drafts.length) {
        const map = new Map(initialBlogs.map((b) => [b.id, b]));
        drafts.forEach((d) => map.set(d.id, d)); // prefer drafts when ids collide
        setBlogs(Array.from(map.values()));
      } else {
        setBlogs(initialBlogs);
      }
    } catch {
      setBlogs(initialBlogs);
    }
  }, []);

  // filter
  const filteredBlogs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return blogs;
    return blogs.filter((b) => {
      return (
        b.title?.toLowerCase().includes(q) ||
        b.title_ar?.toLowerCase().includes(q) ||
        b.excerpt?.toLowerCase().includes(q) ||
        b.category?.toLowerCase().includes(q) ||
        b.level?.toLowerCase().includes(q) ||
        b.author?.name?.toLowerCase().includes(q)
      );
    });
  }, [searchTerm, blogs]);

  // delete selected blog (state + localStorage)
  function handleSubmit() {
    if (!selectedBlog) return;
    const toDeleteId = selectedBlog.id;

    // update state
    setBlogs((prev) => prev.filter((b) => b.id !== toDeleteId));

    // update localStorage
    try {
      const drafts = JSON.parse(localStorage.getItem("blogDrafts") || "[]");
      const next = drafts.filter((b) => b.id !== toDeleteId);
      localStorage.setItem("blogDrafts", JSON.stringify(next));
    } catch {}

    setOpenDeleteModal(false);
    setSelectedBlog(null);
  }

  const levelBadgeClass = (levelOrTag) => {
    const v = (levelOrTag || "").toLowerCase();
    if (v === "beginner")
      return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
    if (v === "advanced")
      return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
    if (v === "culture")
      return "bg-violet-100 text-violet-700 ring-1 ring-violet-200";
    if (v === "featured")
      return "bg-amber-200 text-amber-900 ring-1 ring-amber-300";
    if (v === "trending")
      return "bg-pink-200 text-pink-900 ring-1 ring-pink-300";
    if (v === "new")
      return "bg-violet-100 text-violet-700 ring-1 ring-violet-200";
    return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
  };

  const featureFrameClass = (featured) =>
    featured
      ? "border-[3px] border-teal-500 shadow-[0_8px_50px_-12px_rgba(20,184,166,0.35)]"
      : "border border-slate-200";

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return (
    <div className="min-h-screen">
      <BreadCrumb title="All Blogs" child="Blog" parent="Home" />

      {/* Search */}
      <div className="mt-4 w-full">
        <div className="flex items-center gap-2 rounded-2xl bg-white px-3 py-2 max-w-full ring-1 ring-slate-200">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-slate-500">
            <path
              fill="currentColor"
              d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.71.71l.27.28v.79l5 5 1.5-1.5-5-5Zm-6 0A4.5 4.5 0 1 1 14 9.5 4.5 4.5 0 0 1 9.5 14Z"
            />
          </svg>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search blogs"
            className="bg-transparent outline-none text-sm w-full placeholder:text-slate-500"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid mt-5 gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {filteredBlogs.map((b) => (
          <article
            key={b.id}
            className={`group relative overflow-hidden rounded-2xl bg-white shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${featureFrameClass(
              b.featured
            )}`}
          >
            {/* soft blobs */}
            <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />
            <div className="pointer-events-none absolute -right-10 bottom-20 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />

            {/* cover */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={b.cover}
                alt={b.title}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {b.featured && (
                <div className="absolute inset-0 ring-1 ring-teal-500/30 rounded-sm pointer-events-none" />
              )}

              {/* top badges */}
              <div className="absolute top-3 left-3 flex gap-2">
                {b.tag && (
                  <span
                    className={`text-[11px] rounded-full px-2 py-1 ${levelBadgeClass(b.tag)}`}
                  >
                    {b.tag}
                  </span>
                )}
                {b.level && (
                  <span
                    className={`text-[11px] rounded-full px-2 py-1 ${levelBadgeClass(b.level)}`}
                  >
                    {b.level}
                  </span>
                )}
              </div>

              {/* bookmark corner (decorative) */}
              <div className="absolute right-3 top-3 rounded-full bg-black/50 text-white p-1 opacity-0 group-hover:opacity-100 transition">
                <Bookmark size={16} />
              </div>
            </div>

            {/* body */}
            <div className="p-4">
              <h2 className="text-base sm:text-lg font-semibold tracking-tight line-clamp-2">
                {b.title}
              </h2>
              {b.title_ar && (
                <div className="mt-1 text-teal-700 text-sm font-medium line-clamp-1">
                  {b.title_ar}
                </div>
              )}
              <p className="mt-2 text-slate-600 text-sm line-clamp-2">{b.excerpt}</p>

              {/* meta */}
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <div className="inline-flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-slate-200 grid place-items-center text-[10px] font-semibold">
                    {b.author?.name?.[0] ?? "A"}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="font-medium">{b.author?.name}</span>
                    {b.author?.name_ar && (
                      <span className="text-[11px] text-slate-500">{b.author.name_ar}</span>
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
                    {formatDate(b.date)}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <svg viewBox="0 0 24 24" className="h-4 w-4">
                      <path fill="currentColor" d="M12 8v5l4 2 .75-1.86-2.75-1.39V8z" />
                    </svg>
                    {b.readMins} min read
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <svg viewBox="0 0 24 24" className="h-4 w-4">
                      <path
                        fill="currentColor"
                        d="M12 6c-5 0-9 3.58-9 8 0 1.93 1.05 3.68 2.78 5 .3.24.73.27 1.07.08l2.63-1.5c.28-.16.47-.46.5-.78l.13-1.3c.02-.24.14-.45.32-.6.37-.3.83-.47 1.33-.47 1.73 0 3.13-1.4 3.13-3.13S13.73 8.67 12 8.67c-.66 0-1.27.2-1.78.53-.36.22-.83.18-1.14-.1l-1.24-1.1c-.34-.31-.35-.85-.02-1.17C8.44 5.52 10.14 5 12 5c3.87 0 7 2.46 7 5.5S15.87 16 12 16"
                      />
                    </svg>
                    {Intl.NumberFormat().format(b.views)}
                  </span>
                </div>
              </div>

              {/* actions */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={() => router.push(`/blogs/edit/${b?.id}`)}
                  className="size-10 rounded-xl border border-slate-200 grid place-items-center hover:bg-slate-50"
                  aria-label="Edit blog"
                >
                  <Edit size={18} />
                </button>

                <button
                  onClick={() => {
                    setSelectedBlog(b);
                    setOpenDeleteModal(true);
                  }}
                  className="size-10 rounded-xl border border-slate-200 grid place-items-center hover:bg-slate-50"
                  aria-label="Delete blog"
                >
                  <Trash size={18} />
                </button>
              </div>
            </div>

            {/* focus ring */}
            <span className="absolute pointer-events-none inset-0 ring-0 ring-[var(--primary-color)] rounded-2xl opacity-0 group-hover:opacity-100 group-hover:ring-4 transition-all duration-300"></span>
          </article>
        ))}
      </div>

      <DeleteModal
        handleSubmit={handleSubmit}
        title="Delete this blog"
        description={`Do you want to delete "${selectedBlog?.title}"?`}
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
      />
    </div>
  );
}
