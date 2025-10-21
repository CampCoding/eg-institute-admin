"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  message,
  Spin,
} from "antd";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { ArrowLeft, Star, ChevronRight } from "lucide-react";
import { useRouter, useParams } from "next/navigation";

const { TextArea } = Input;
const { Option } = Select;

/** If you already have real teachers in "@/utils/data", import and delete this mock. */
const seedTeachers = [
  {
    id: "1",
    name: "Dr. Amira Hassan",
    title: "Modern Standard Arabic",
    summary:
      "Specialist in advanced syntax and media Arabic with 10+ years teaching experience.",
    tags: ["Grammar", "Media Arabic", "Academic Writing"],
    level: "Expert",
    rating: 4.9,
    students: 1200,
    photo:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "2",
    name: "Omar El-Sayed",
    title: "Egyptian Dialect",
    summary:
      "Focuses on everyday conversation, street phrases, and cultural nuance.",
    tags: ["Conversation", "Culture", "Slang"],
    level: "Expert",
    rating: 4.8,
    students: 950,
    photo:
      "https://images.unsplash.com/photo-1527980965255-d3b416303d12?q=80&w=1400&auto=format&fit=crop",
  },
  {
    id: "3",
    name: "Nour Fathy",
    title: "Pronunciation & Phonetics",
    summary:
      "Helps learners master vowel length, emphatics, and natural stress patterns.",
    tags: ["Phonetics", "Accent", "Speaking"],
    level: "Expert",
    rating: 4.9,
    students: 800,
    photo:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?q=80&w=1400&auto=format&fit=crop",
  },
];

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1400&auto=format&fit=crop";



function toPreview(values) {
  return {
    id: values.id || "",
    name: values.name || "Teacher name",
    title: values.title || "Specialization",
    summary:
      values.summary ||
      "Short bio / focus areas will appear here. Keep it concise and helpful.",
    tags: Array.isArray(values.tags)
      ? (values.tags)
      : typeof values.tags === "string"
      ? (values.tags)
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    level: (values.level) || "Expert",
    rating:
      typeof values.rating === "number" ? values.rating : (4.8),
    students:
      typeof values.students === "number" ? values.students : (0),
    photo: values.photo || DEFAULT_PHOTO,
  };
}

export default function EditTeacherPage() {
  const [form] = Form.useForm();
  const router = useRouter();
  const params = useParams();
  const teacherId = Array.isArray(params?.id) ? params.id[0] : (params?.id);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [preview, setPreview] = useState(toPreview({}));

  useEffect(() => {
    try {
      if (!teacherId) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      // merge drafts from localStorage (if any) with seed as fallback
      let source = seedTeachers;
      if (typeof window !== "undefined") {
        const drafts = JSON.parse(localStorage.getItem("teacherDrafts") || "[]");
        if (Array.isArray(drafts) && drafts.length) {
          const map = new Map(
            seedTeachers.map((t) => [t.id, t])
          );
          drafts.forEach((d) => map.set(d.id, d));
          source = Array.from(map.values());
        }
      }

      const found =
        source.find((t) => t.id === teacherId) ||
        source.find((t) => t.name?.toLowerCase().replace(/\s+/g, "-") === teacherId);

      if (!found) {
        setNotFound(true);
      } else {
        form.setFieldsValue(found);
        setPreview(toPreview(found));
      }
    } catch (e) {
      console.error(e);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [teacherId, form]);

  const onValuesChange = (_, allValues) => {
    setPreview(toPreview(allValues));
  };

  const onFinish = (values) => {
    const payload = { ...toPreview(values), id: values.id || teacherId };

    try {
      if (typeof window !== "undefined") {
        const drafts= JSON.parse(localStorage.getItem("teacherDrafts") || "[]");
        const idx = drafts.findIndex((t) => t.id === payload.id);
        let next = drafts;
        if (idx >= 0) next[idx] = payload;
        else next = [payload, ...drafts];
        localStorage.setItem("teacherDrafts", JSON.stringify(next));
      }
      message.success("Teacher updated successfully!");
      router.push("/teachers");
    } catch (e) {
      console.error(e);
      message.error("Failed to update teacher.");
    }
  };

  const levelColor = useMemo(() => {
    if (preview.level === "Beginner") return "text-emerald-700";
    if (preview.level === "Intermediate") return "text-blue-700";
    return "text-teal-700";
  }, [preview.level]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center">
        <Spin />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <button
            type="button"
            onClick={() => router.push("/teachers")}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
          >
            <ArrowLeft size={16} className="inline -mt-0.5 mr-1" />
            Back
          </button>
          <div className="mt-6 rounded-2xl bg-white border border-slate-200 p-6">
            <h2 className="text-lg font-semibold">Teacher not found</h2>
            <p className="text-slate-600 mt-1">
              We couldn’t find a teacher with ID/slug: <b>{teacherId}</b>.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="flex mb-4 items-center gap-2">
        <button
          type="button"
          onClick={() => router.push("/teachers")}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
        >
          <ArrowLeft size={16} className="inline -mt-0.5 mr-1" />
          Back
        </button>
      </div>

      <BreadCrumb title="Edit Teacher" parent="Teachers" child="Edit" />

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: FORM */}
        <Card className="lg:col-span-2 !bg-white">
          <Form
            layout="vertical"
            form={form}
            onValuesChange={onValuesChange}
            onFinish={onFinish}
            autoComplete="off"
          >
            {/* Hidden id (keep it around) */}
            <Form.Item name="id" hidden>
              <Input />
            </Form.Item>

            <Form.Item
              label="Full Name"
              name="name"
              rules={[{ required: true, message: "Please enter the teacher's full name" }]}
            >
              <Input placeholder="e.g., Dr. Amira Hassan" />
            </Form.Item>

            <Form.Item
              label="Specialization / Title"
              name="title"
              rules={[{ required: true, message: "Please enter the specialization" }]}
            >
              <Input placeholder="e.g., Modern Standard Arabic" />
            </Form.Item>

            <Form.Item
              label="Short Bio"
              name="summary"
              rules={[{ required: true, message: "Please add a short bio/summary" }]}
            >
              <TextArea rows={4} placeholder="Focus areas, teaching style, experience…" />
            </Form.Item>

            <Form.Item label="Tags" name="tags">
              <Select mode="tags" allowClear tokenSeparators={[","]} placeholder="Add tags (press Enter)" />
            </Form.Item>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Form.Item
                label="Level"
                name="level"
                rules={[{ required: true, message: "Select a level" }]}
              >
                <Select placeholder="Choose level">
                  <Option value="Beginner">Beginner</Option>
                  <Option value="Intermediate">Intermediate</Option>
                  <Option value="Expert">Expert</Option>
                </Select>
              </Form.Item>

              {/* <Form.Item
                label="Rating (0–5)"
                name="rating"
                rules={[{ required: true, message: "Enter rating" }]}
              >
                <InputNumber min={0} max={5} step={0.1} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                label="Students"
                name="students"
                rules={[{ required: true, message: "Enter students count" }]}
              >
                <InputNumber min={0} style={{ width: "100%" }} />
              </Form.Item> */}
            </div>

            <Form.Item
              label="Photo URL"
              name="photo"
              rules={[{ required: true, message: "Please provide a photo URL" }]}
            >
              <Input placeholder="https://images.unsplash.com/..." />
            </Form.Item>

            <Form.Item className="text-right mb-0">
              <Button type="primary" htmlType="submit" className="!bg-[#02AAA0] hover:!bg-[#029a92]">
                Update Teacher
              </Button>
            </Form.Item>
          </Form>
        </Card>

        {/* Right: LIVE PREVIEW */}
        <div className="lg:sticky lg:top-24">
          <Card className="!bg-white">
            <h3 className="font-semibold">Live preview</h3>
            <p className="text-sm text-slate-600">Matches your teacher cards.</p>

            <article className="group relative mt-4 overflow-hidden rounded-[22px] bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
              {/* Soft blobs */}
              <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />
              <div className="pointer-events-none absolute -right-10 bottom-20 h-24 w-24 rounded-full bg-gradient-to-br from-[var(--primary-color)] via-[var(--secondary-color)] to-[var(--accent-color)] blur-2xl opacity-60" />

              {/* Media */}
              <div className="relative h-56 overflow-hidden">
                <img
                  src={preview.photo}
                  alt={preview.name}
                  className="h-full w-full object-cover"
                />

                <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 px-2 py-1 text-[12px] font-semibold shadow">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {Number(preview.rating).toFixed(1)}
                </div>

                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 size-9 grid place-items-center rounded-full bg-teal-600 text-white shadow-md opacity-80 cursor-default"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  {preview.name}
                </h3>
                <p className={`mt-1 text-sm font-medium ${levelColor}`}>
                  {preview.title}
                </p>

                <p className="mt-3 text-slate-600 text-sm leading-relaxed">
                  {preview.summary}
                </p>

                {preview.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {preview.tags.map((tag, i) => (
                      <span
                        key={`${tag}-${i}`}
                        className="inline-block rounded-full border border-teal-200 bg-teal-50 text-teal-700 px-2.5 py-1 text-[12px]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                    {Number(preview.students || 0).toLocaleString()}+ students
                  </span>
                  <span className="text-teal-700 font-medium">
                    {preview.level} Level
                  </span>
                </div>

                <div className="mt-5">
                  <button
                    type="button"
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 text-white px-5 py-2.5 text-sm font-semibold opacity-80 cursor-default"
                  >
                    Details <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <span className="absolute pointer-events-none inset-0 ring-0 ring-[var(--primary-color)] rounded-[22px] opacity-0 group-hover:opacity-100 group-hover:ring-4 transition-all duration-300"></span>
            </article>
          </Card>
        </div>
      </div>
    </div>
  );
}
