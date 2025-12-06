"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { Rate } from "antd";

const CATEGORIES = ["Fiction", "Science", "History", "Biography", "Philosophy"];


export default function SuppliesForm() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState(1);
  const [form, setForm] = useState({
    title: "",
    description: "",
    author: "",
    old_price: "",
    new_price: "",
    category: CATEGORIES[0],
    coverImage: "",
  });
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState(CATEGORIES); // Updated categories state
  const [chapters, setChapters] = useState([
    { title: "Chapter 1", pageCount: "20" },
  ]);
  const [saving, setSaving] = useState(false);
  const valid = form.title && form.description && form.author && form.price;

  const onChange = (key, val) => setForm((s) => ({ ...s, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!valid) return;

    setSaving(true);
    const payload = {
      ...form,
      id: `book-${Date.now()}`,
      chapters,
    };

    try {
      if (typeof window !== "undefined") {
        const drafts = JSON.parse(localStorage.getItem("bookDrafts") || "[]");
        localStorage.setItem("bookDrafts", JSON.stringify([payload, ...drafts]));
      }

      router.push("/books");
    } catch (err) {
      console.error(err);
      alert("Failed to save the book. Check the console for details.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <form onSubmit={handleSubmit} className="mt-6 p-4 border border-slate-200 rounded-2xl">
        {/* Left: form */}
        <div className="xl:col-span-2 space-y-6">
        <>
              <h2 className="text-lg mt-4 font-semibold">Basic Information</h2>
              <p className="text-sm text-slate-600 mt-1">Title, description, author, and price.</p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => onChange("title", e.target.value)}
                    placeholder="e.g., React & Next.js Complete Guide"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => onChange("description", e.target.value)}
                    rows={4}
                    placeholder="What will readers learn?"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Author</label>
                  <input
                    value={form.author}
                    onChange={(e) => onChange("author", e.target.value)}
                    placeholder="Author's Name"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Old Price</label>
                  <input
                    value={form.old_price}
                    onChange={(e) => onChange("old_price", e.target.value)}
                    placeholder="$99"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">New Price</label>
                  <input
                    value={form.new_price}
                    onChange={(e) => onChange("new_price", e.target.value)}
                    placeholder="$99"
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
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium">Cover URL</label>
                  <input
                    value={form.coverImage}
                    onChange={(e) => onChange("coverImage", e.target.value)}
                    placeholder="URL of book cover image"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Rating</label>
                  <Rate />
                </div>
              </div>
            </>
        </div>

        {/* Actions */}
        <div className="flex items-center mt-3 gap-3">
          <button
            type="submit"
            disabled={!valid || saving}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)] text-white px-4 py-2 font-medium hover:opacity-90 disabled:opacity-60"
          >
            {saving ? <div className="animate-spin">Saving...</div> : "Save Book"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
