"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  InputNumber,
  message,
  TimePicker,
} from "antd";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { ArrowLeft, Star, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { teacherSchema } from "../_Schema";
import usePostTeacher from "../../../utils/Api/Teachers/PostTeachers";
import toast from "react-hot-toast";
import {
  CountrySelect,
  TimeZoneSelect,
} from "../../../utils/TimeZone/TimeZone";

const { TextArea } = Input;
const { Option } = Select;

const TAG_SUGGESTIONS = [
  "Grammar",
  "Media Arabic",
  "Academic Writing",
  "Conversation",
  "Culture",
  "Slang",
  "Phonetics",
  "Accent",
  "Speaking",
  "Vocabulary",
  "Reading",
  "Comprehension",
  "Fluency",
  "Clubs",
];
const Languages = ["Arabic (Native)", "English (C1)", "French (B1)"];

function RHFFormItem({ name, control, label, rules, required, children }) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <Form.Item
          label={label}
          required={required}
          validateStatus={fieldState.error ? "error" : ""}
          help={fieldState.error?.message}
        >
          {typeof children === "function"
            ? children({ field })
            : React.cloneElement(children, { ...field })}
        </Form.Item>
      )}
    />
  );
}

const days = [
  "Saturday",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
];

const DEFAULT_PHOTO =
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=1400&auto=format&fit=crop";

// Helper to convert form values → preview shape
function toPreview(values) {
  return {
    id: values.id || "",
    name: values.name || "Teacher name",
    title: values.title || "Specialization",
    summary:
      values.summary ||
      "Short bio / focus areas will appear here. Keep it concise and helpful.",
    tags: Array.isArray(values.tags)
      ? values.tags
      : typeof values.tags === "string"
      ? values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    level: values.level || "Expert",
    rating: typeof values.rating === "number" ? values.rating : 4.8,
    students: typeof values.students === "number" ? values.students : 0,
    photo: values.photo || DEFAULT_PHOTO,
  };
}

export default function AddTeacherPage() {
  const { mutateAsync, isPending } = usePostTeacher();

  const router = useRouter();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: "onSubmit",
    resolver: yupResolver(teacherSchema),
    defaultValues: {
      level: "Expert",
      photo: DEFAULT_PHOTO,
      tags: [],
      Languages: [],
      name: "",
      title: "",
      summary: "",
      email: "",
      phone: "",
      country: "",
      TimeZone: "Africa/Cairo",
      hourly_rate: "",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "teacher_slots",
  });

  const preview = toPreview(watch());

  const levelColor = useMemo(() => {
    if (preview.level === "Beginner") return "text-emerald-700";
    if (preview.level === "Intermediate") return "text-blue-700";
    return "text-teal-700";
  }, [preview.level]);

  const onSubmit = async (values) => {
    const payload = {
      teacher_name: values.name, // أو values.teacher_name لو نفس الاسم
      teacher_email: values.email,
      phone: values.phone,
      country: values.country,
      time_zone: values.TimeZone,
      hourly_rate: String(values.hourly_rate),
      teacher_image: values.photo,
      specialization: values.title,
      bio: values.summary,
      tags: Array.isArray(values.tags) ? values.tags.join(", ") : values.tags,
      level: String(values.level).toLowerCase(), // beginner|intermediate|expert
      languages: values.Languages || values.languages,
      created_at: new Date().toISOString().split("T")[0],
      teacher_slots: (values.teacher_slots || []).map((s) => ({
        day: s.day,
        slots_from: s.slots_from?.format("HH:mm:ss"),
        slots_to: s.slots_to?.format("HH:mm:ss"),
      })),
    };
    console.log(payload);

    try {
      const res = await mutateAsync({ payload, type: "add" });
      console.log(res);

      if (res.status === "success") {
        toast.success(res.message);
        router.push("/teachers");
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.log(error);
    }
  };

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

      <BreadCrumb title="Add Teacher" parent="Teachers" child="Add" />

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: FORM */}
        <Card className="lg:col-span-2 !bg-white">
          <form
            layout="vertical"
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="off"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RHFFormItem
                name="name"
                control={control}
                label="Full Name"
                required
              >
                <Input placeholder="e.g., Dr. Amira Hassan" />
              </RHFFormItem>
              <RHFFormItem
                name="email"
                control={control}
                label="Email"
                required
              >
                <Input placeholder="e.g., 0Tl9S@example.com" />
              </RHFFormItem>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RHFFormItem
                name="title"
                control={control}
                label="specialization"
                required
              >
                <Input placeholder="e.g., Modern Standard Arabic" />
              </RHFFormItem>
              <RHFFormItem
                name="phone"
                control={control}
                label="Phone"
                required
              >
                <Input placeholder="e.g., +2010xxxxxxx" />
              </RHFFormItem>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <RHFFormItem
                name="country"
                control={control}
                label="Country"
                required
              >
                {({ field }) => (
                  <CountrySelect
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="Select country…"
                    locale="en" // أو "ar"
                    size="middle"
                  />
                )}
              </RHFFormItem>

              <RHFFormItem
                name="TimeZone"
                control={control}
                label="Time Zone"
                required
              >
                {({ field }) => (
                  <TimeZoneSelect
                    value={field.value}
                    onChange={field.onChange}
                  />
                )}
              </RHFFormItem>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <RHFFormItem name="Languages" control={control} label="Languages">
                {({ field }) => (
                  <Select
                    mode="tags"
                    allowClear
                    tokenSeparators={[","]}
                    placeholder="Add Language (press Enter)"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  >
                    {Languages.map((t) => (
                      <Option key={t} value={t}>
                        {t}
                      </Option>
                    ))}
                  </Select>
                )}
              </RHFFormItem>
              <RHFFormItem name="tags" control={control} label="Tags">
                {({ field }) => (
                  <Select
                    mode="tags"
                    allowClear
                    tokenSeparators={[","]}
                    placeholder="Add tags (press Enter)"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  >
                    {TAG_SUGGESTIONS.map((t) => (
                      <Option key={t} value={t}>
                        {t}
                      </Option>
                    ))}
                  </Select>
                )}
              </RHFFormItem>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2    gap-4">
              <RHFFormItem
                name="level"
                control={control}
                label="Level"
                required
              >
                {({ field }) => (
                  <Select
                    placeholder="Choose level"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  >
                    <Option value="Beginner">Beginner</Option>
                    <Option value="Intermediate">Intermediate</Option>
                    <Option value="Expert">Expert</Option>
                  </Select>
                )}
              </RHFFormItem>
              <RHFFormItem
                name="hourly_rate"
                control={control}
                label="Hourly Rate"
                required
              >
                <Input placeholder="25" />
              </RHFFormItem>
            </div>
            <div className="my-2  ">
              <div className="grid  gap-3">
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-1 lg:grid-cols-4 gap-3"
                  >
                    <RHFFormItem
                      name={`teacher_slots.${index}.day`}
                      control={control}
                      label="Day"
                      required
                    >
                      {({ field }) => (
                        <Select
                          value={field.value}
                          onChange={field.onChange}
                          onBlur={field.onBlur}
                          placeholder="Day"
                        >
                          {days.map((d) => (
                            <Select.Option key={d} value={d}>
                              {d}
                            </Select.Option>
                          ))}
                        </Select>
                      )}
                    </RHFFormItem>

                    <RHFFormItem
                      name={`teacher_slots.${index}.slots_from`}
                      control={control}
                      label="From"
                      required
                    >
                      {({ field }) => (
                        <TimePicker
                          value={field.value}
                          onChange={field.onChange}
                          format="HH:mm"
                          placeholder="Start"
                          className="w-full"
                        />
                      )}
                    </RHFFormItem>

                    <RHFFormItem
                      name={`teacher_slots.${index}.slots_to`}
                      control={control}
                      label="To"
                      required
                    >
                      {({ field }) => (
                        <TimePicker
                          value={field.value}
                          onChange={field.onChange}
                          format="HH:mm"
                          placeholder="End"
                          className="w-full"
                        />
                      )}
                    </RHFFormItem>

                    <div className="w-full">
                      <Button
                        danger
                        className="w-full"
                        onClick={() => remove(index)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="dashed"
                  onClick={() =>
                    append({ day: "Monday", slots_from: null, slots_to: null })
                  }
                >
                  + Add Slot
                </Button>
              </div>
            </div>

            <RHFFormItem
              name="summary"
              control={control}
              label="Short Bio"
              required
            >
              <TextArea
                rows={4}
                placeholder="Focus areas, teaching style, experience…"
              />
            </RHFFormItem>

            <RHFFormItem
              name="photo"
              control={control}
              label="Photo URL"
              required
            >
              <Input placeholder="https://images.unsplash.com/..." />
            </RHFFormItem>

            <Form.Item className="text-right mb-0">
              <Button
                type="primary"
                htmlType="submit"
                loading={isPending}
                className="!bg-[#02AAA0] hover:!bg-[#029a92]"
              >
                Add Teacher
              </Button>
            </Form.Item>
          </form>
        </Card>

        {/* Right: LIVE PREVIEW */}
        <div className="lg:sticky lg:top-24">
          <Card className="!bg-white">
            <h3 className="font-semibold">Live preview</h3>
            <p className="text-sm text-slate-600">
              Matches the card design on the Teachers page.
            </p>

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

                {/* Rating pill */}
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

                {/* Tags */}
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

                {/* Meta row */}
                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  {/* <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                    {Number(preview.students || 0).toLocaleString()}+ students
                  </span> */}
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
