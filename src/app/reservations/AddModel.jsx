"use client";
import React, { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import toast from "react-hot-toast";

import { DatePicker, TimePicker, Select } from "antd";
import dayjs from "dayjs";

import { addReservationSchema } from "./Schema";
import usePostReservation from "../../utils/Api/reservation/PostReservaton";
// عدّل المسار

const { Option } = Select;

export default function AddReservationModal({ open, onClose, onCreated }) {
  const { mutateAsync, isPending } = usePostReservation();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(addReservationSchema),
    defaultValues: {
      meeting_date: "", // string: YYYY-MM-DD
      meeting_time: "", // string: HH:mm
      meeting_type: "zoom",
      course_id: "",
      student_id: "",
      note: "",
    },
    mode: "onTouched",
  });

  // lock scroll + reset
  useEffect(() => {
    if (!open) return;
    reset();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, reset]);

  // ESC close
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const disabled = isSubmitting || isPending;

  const onSubmit = async (values) => {
    const payload = {
      meeting_date: values.meeting_date, // YYYY-MM-DD
      meeting_time: values.meeting_time, // HH:mm
    };

    try {
      const response = await mutateAsync({ payload });
      console.log(payload);
      console.log(response);
      if (response.status === "success") {
        toast.success(response.message);
        onClose?.();
      } else toast.error(response.message);
    } catch (error) {}
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-10 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => !disabled && onClose?.()}
      />

      {/* Dialog */}
      <div
        className="relative z-[10000] w-[92vw] max-w-2xl rounded-3xl border border-gray-100 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Add Reservation
            </h2>
            <p className="text-sm text-gray-500">
              Create a new meeting reservation.
            </p>
          </div>

          <button
            onClick={() => !disabled && onClose?.()}
            className="p-2 rounded-full hover:bg-gray-100"
            disabled={disabled}
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* AntD DatePicker */}
            <Field label="Meeting Date" error={errors.meeting_date?.message}>
              <Controller
                name="meeting_date"
                control={control}
                render={({ field }) => (
                  <DatePicker
                    className="w-full"
                    disabled={disabled}
                    value={
                      field.value ? dayjs(field.value, "YYYY-MM-DD") : null
                    }
                    onChange={(d) =>
                      field.onChange(d ? d.format("YYYY-MM-DD") : "")
                    }
                    placeholder="Select date"
                  />
                )}
              />
            </Field>

            {/* AntD TimePicker */}
            <Field label="Meeting Time" error={errors.meeting_time?.message}>
              <Controller
                name="meeting_time"
                control={control}
                render={({ field }) => (
                  <TimePicker
                    className="w-full"
                    disabled={disabled}
                    format="HH:mm"
                    value={field.value ? dayjs(field.value, "HH:mm") : null}
                    onChange={(t) => field.onChange(t ? t.format("HH:mm") : "")}
                    placeholder="Select time"
                  />
                )}
              />
            </Field>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => reset()}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              disabled={disabled}
            >
              Reset
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-teal-600 !text-white hover:bg-teal-700 disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={disabled}
            >
              {disabled ? "Saving..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="mt-1">{children}</div>
      {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
    </div>
  );
}

function inputClass(hasError) {
  return [
    "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2",
    hasError
      ? "border-rose-300 focus:ring-rose-300"
      : "border-gray-200 focus:ring-teal-500",
  ].join(" ");
}

function textareaClass(hasError) {
  return [
    "w-full rounded-xl border bg-white px-3 py-2 text-sm outline-none focus:ring-2 resize-y",
    hasError
      ? "border-rose-300 focus:ring-rose-300"
      : "border-gray-200 focus:ring-teal-500",
  ].join(" ");
}
