"use client";

import React, { useMemo, useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { uploadPdf } from "@/utils/FileUpload/FileUpload";
import toast from "react-hot-toast";
import usePostUnitsQuiz from "@/utils/Api/Units/PostQuiz"; // نفس hook بتاعك (mutateAsync)

const isValidUrl = (v) => {
  if (!v) return false;
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
};

const schema = yup.object({
  title: yup.string().trim().required("Quiz title is required"),

  // ✅ existing url for edit (hidden field)
  existingQuizUrl: yup.string().default(""),

  quizMode: yup.mixed().oneOf(["upload", "link"]).required(),

  quizFile: yup.mixed().when(["quizMode", "existingQuizUrl"], {
    is: (mode, existing) => mode === "upload" && !existing,
    then: (s) =>
      s
        .required("Please upload a quiz file")
        .test(
          "fileRequired",
          "Please upload a quiz file",
          (v) => v instanceof File
        )
        .test("fileType", "Only PDF files are allowed", (v) =>
          v instanceof File ? v.type === "application/pdf" : false
        ),
    otherwise: (s) => s.nullable(),
  }),

  quizLink: yup.string().when(["quizMode", "existingQuizUrl"], {
    is: (mode, existing) => mode === "link" && !existing,
    then: (s) =>
      s
        .required("Please add a quiz link")
        .test("isUrl", "Invalid URL", (v) => isValidUrl(v))
        .test("isPdf", "Link must be a .pdf", (v) =>
          typeof v === "string" ? v.toLowerCase().includes(".pdf") : false
        ),
    otherwise: (s) => s.optional(),
  }),
});

export default function EditQuizPage() {
  const router = useRouter();
  const { unitId, quizId } = useParams(); // ✅ عدّل quizId لو اسم param مختلف

  const { mutateAsync, isPending } = usePostUnitsQuiz();

  const defaultValues = useMemo(
    () => ({
      title: "",
      existingQuizUrl: "",

      quizMode: "link", // edit غالبًا لينك
      quizFile: null,
      quizLink: "",
    }),
    []
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
    mode: "onTouched",
  });

  // ✅ load item from localStorage (set in list page)
  const [item, setItem] = useState(null);
  useEffect(() => {
    const saved =
      typeof window !== "undefined" ? localStorage.getItem("quiz") : null;
    if (saved) {
      try {
        setItem(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // ✅ reset مرة واحدة فقط
  const didResetRef = useRef(false);
  useEffect(() => {
    if (!item) return;
    if (didResetRef.current) return;
    didResetRef.current = true;

    reset({
      title: item.quiz_title ?? "",
      existingQuizUrl: item.quiz_url ?? "",
      quizMode: "link",
      quizFile: null,
      quizLink: item.quiz_url ?? "",
    });
  }, [item, reset]);

  // ---- watch values ----
  const quizMode = watch("quizMode");
  const quizFile = watch("quizFile");
  const quizLink = watch("quizLink");
  const existingQuizUrl = watch("existingQuizUrl");

  // ---- Preview URL (file) ----
  const [quizUrl, setQuizUrl] = useState("");
  useEffect(() => {
    if (quizMode !== "upload" || !(quizFile instanceof File)) {
      setQuizUrl("");
      return;
    }
    const url = URL.createObjectURL(quizFile);
    setQuizUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [quizMode, quizFile]);

  const switchQuizMode = (mode) => {
    setValue("quizMode", mode);

    if (mode === "upload") {
      // في upload mode نخلي link فاضي (بس نسيب existingQuizUrl زي ما هو)
      setValue("quizLink", "");
      clearErrors(["quizLink"]);
    } else {
      // في link mode نمسح file
      setValue("quizFile", null);
      clearErrors(["quizFile"]);

      // لو كان فيه existing url رجعه للـ input تلقائيًا
      if (existingQuizUrl) setValue("quizLink", existingQuizUrl);
      setQuizUrl("");
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      quiz_title: data.title,
      unit_id: unitId,
    };

    try {
      // ✅ تحديد quiz_url:
      // 1) لو upload وفيه file جديد
      if (data.quizMode === "upload" && data.quizFile instanceof File) {
        const uploaded = await uploadPdf(data.quizFile);
        if (uploaded?.status === "success")
          payload.quiz_url = uploaded.file_url;
        else {
          toast.error(uploaded?.status || "Upload failed");
          return;
        }
      }
      // 2) لو link وحاطط لينك جديد
      else if (data.quizMode === "link" && data.quizLink) {
        payload.quiz_url = data.quizLink;
      }
      // 3) لو مغيرش حاجة → استخدم القديم
      else {
        payload.quiz_url = data.existingQuizUrl;
      }

      const res = await mutateAsync({
        payload,
        type: "update",
        id: item.quiz_id,
      });

      if (res?.status === "success") {
        toast.success(res.message || "Quiz updated");
        router.back();
      } else {
        toast.error(res?.message || "Failed");
      }
    } catch (e) {
      console.log(e);
      toast.error(e?.message || "Something went wrong");
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="flex mb-4 items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50"
        >
          <ArrowLeft size={16} className="inline -mt-0.5 mr-1" />
          Back
        </button>
      </div>

      <BreadCrumb title="Edit Quiz" child="Quizzes" parent="Edit Quiz" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-3 px-2 sm:px-4 grid gap-6"
      >
        <div className="rounded-2xl">
          {/* Quiz Title */}
          <div className="my-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Quiz Title</label>
              {errors.title && (
                <p className="text-sm !mb-0 text-red-600">
                  {errors.title.message}
                </p>
              )}
            </div>

            <input
              {...register("title")}
              placeholder="Enter quiz title"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
            />
          </div>

          {/* Quiz Source Toggle */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Quiz Source</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => switchQuizMode("upload")}
                  className={`px-3 py-1 rounded-lg border text-sm ${
                    quizMode === "upload"
                      ? "!bg-(--primary-color) !text-white"
                      : "border-slate-200"
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => switchQuizMode("link")}
                  className={`px-3 py-1 rounded-lg border text-sm ${
                    quizMode === "link"
                      ? "!bg-(--primary-color) !text-white"
                      : "border-slate-200"
                  }`}
                >
                  Link
                </button>
              </div>
            </div>

            {/* Upload */}
            {quizMode === "upload" && (
              <div className="mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">
                    Upload Quiz PDF
                  </span>
                  {errors.quizFile && (
                    <p className="text-sm !mb-0 text-red-600">
                      {errors.quizFile.message}
                    </p>
                  )}
                </div>

                <Controller
                  control={control}
                  name="quizFile"
                  render={({ field }) => (
                    <input
                      type="file"
                      accept="application/pdf,.pdf"
                      onChange={(e) =>
                        field.onChange(e.target.files?.[0] ?? null)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                    />
                  )}
                />

                {/* ✅ hint لو فيه existing url */}
                {existingQuizUrl && (
                  <p className="text-xs text-slate-500 mt-2">
                    Leave empty to keep the current file.
                  </p>
                )}
              </div>
            )}

            {/* Link */}
            {quizMode === "link" && (
              <div className="mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Paste Quiz URL</span>
                  {errors.quizLink && (
                    <p className="text-sm !mb-0 text-red-600">
                      {errors.quizLink.message}
                    </p>
                  )}
                </div>

                <input
                  {...register("quizLink")}
                  placeholder="https://example.com/quiz.pdf"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                />
              </div>
            )}

            {/* Preview (file OR link OR existing) */}
            {(quizUrl ||
              (quizMode === "link" && isValidUrl(quizLink)) ||
              (quizMode === "link" &&
                isValidUrl(existingQuizUrl) &&
                !quizLink)) && (
              <div className="mt-4 rounded-2xl border w-full place-self-center border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <p className="text-sm">
                    <span className="font-medium">Preview:</span>{" "}
                    {quizMode === "upload" && quizFile instanceof File
                      ? quizFile.name
                      : quizLink || existingQuizUrl}
                  </p>
                </div>

                <iframe
                  src={
                    quizMode === "upload"
                      ? quizUrl
                      : quizLink || existingQuizUrl
                  }
                  title="Quiz Preview"
                  className="w-full place-self-center h-[30vh]"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="submit"
            disabled={isSubmitting || isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)] !text-white px-4 py-2 font-medium hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting || isPending ? (
              "Saving..."
            ) : (
              <>
                <Save size={18} />
                Save Quiz
              </>
            )}
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
