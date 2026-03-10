"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  HelpCircle,
  Loader2,
  Upload,
  Link as LinkIcon,
  Eye,
  FileText,
} from "lucide-react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { uploadPdf } from "@/utils/FileUpload/FileUpload";
import usePostUnitsQuiz from "@/utils/Api/Units/PostQuiz";
import toast from "react-hot-toast";

const isValidUrl = (v) => {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
};

const schema = yup.object({
  title: yup.string().trim().required("Quiz title is required"),
  quizMode: yup.mixed().oneOf(["upload", "link"]).required(),
  quizFile: yup.mixed().when("quizMode", {
    is: "upload",
    then: (s) =>
      s
        .required("Please upload a quiz file")
        .test("fileType", "Only PDF files allowed", (v) =>
          v instanceof File ? v.type === "application/pdf" : false
        ),
    otherwise: (s) => s.nullable(),
  }),
  quizLink: yup.string().when("quizMode", {
    is: "link",
    then: (s) =>
      s
        .required("Please add a quiz link")
        .test("isUrl", "Invalid URL", isValidUrl)
        .test("isPdf", "Must be a .pdf link", (v) =>
          v?.toLowerCase().includes(".pdf")
        ),
    otherwise: (s) => s.optional(),
  }),
});

export default function AddQuizPage() {
  const { unitId } = useParams();
  const router = useRouter();
  const { mutateAsync, isPending } = usePostUnitsQuiz();

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm({
    defaultValues: {
      title: "",
      quizMode: "upload",
      quizFile: null,
      quizLink: "",
    },
    resolver: yupResolver(schema),
    mode: "onTouched",
  });

  const quizMode = watch("quizMode");
  const quizFile = watch("quizFile");
  const quizLink = watch("quizLink");

  const [quizUrl, setQuizUrl] = useState("");

  useEffect(() => {
    if (quizMode === "upload" && quizFile instanceof File) {
      const url = URL.createObjectURL(quizFile);
      setQuizUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setQuizUrl("");
  }, [quizMode, quizFile]);

  const onSubmit = async (data) => {
    const payload = { quiz_title: data.title, unit_id: unitId };

    try {
      if (data.quizMode === "upload") {
        const res = await uploadPdf(data.quizFile);
        if (res?.status === "success") {
          payload.quiz_url = res.file_url;
        } else {
          toast.error(res?.status || "Upload failed");
          return;
        }
      } else {
        payload.quiz_url = data.quizLink;
      }

      const response = await mutateAsync({ payload });
      if (response?.status === "success") {
        toast.success(response.message || "Quiz added");
        router.back();
      } else {
        toast.error(response?.message || "Failed");
      }
    } catch (e) {
      toast.error("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      </div>

      <BreadCrumb title="Add Quiz" child="Add Quiz" parent="Unit" />

      {/* Form Card */}
      <div className="mt-6">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-600 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <HelpCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add New Quiz</h2>
                <p className="text-white/80 text-sm mt-1">
                  Add a quiz to test your students
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Quiz Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quiz Title <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("title")}
                placeholder="Enter quiz title..."
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                  errors.title
                    ? "border-rose-300 focus:border-rose-500"
                    : "border-gray-200 focus:border-teal-500"
                }`}
              />
              {errors.title && (
                <p className="text-sm text-rose-600 mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Quiz Source */}
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Quiz File <span className="text-rose-500">*</span>
                </label>

                <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setValue("quizMode", "upload");
                      setValue("quizLink", "");
                      clearErrors("quizLink");
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                      quizMode === "upload"
                        ? "bg-teal-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue("quizMode", "link");
                      setValue("quizFile", null);
                      clearErrors("quizFile");
                      setQuizUrl("");
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                      quizMode === "link"
                        ? "bg-teal-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    URL
                  </button>
                </div>
              </div>

              {quizMode === "upload" ? (
                <Controller
                  control={control}
                  name="quizFile"
                  render={({ field }) => (
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                        errors.quizFile
                          ? "border-rose-300 bg-rose-50"
                          : "border-gray-300 hover:border-teal-400"
                      }`}
                    >
                      <input
                        type="file"
                        accept="application/pdf,.pdf"
                        onChange={(e) =>
                          field.onChange(e.target.files?.[0] ?? null)
                        }
                        className="hidden"
                        id="quiz-upload"
                      />
                      <label
                        htmlFor="quiz-upload"
                        className="cursor-pointer block"
                      >
                        <HelpCircle className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {quizFile instanceof File
                            ? quizFile.name
                            : "Click to upload quiz PDF"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PDF only</p>
                      </label>
                    </div>
                  )}
                />
              ) : (
                <input
                  {...register("quizLink")}
                  placeholder="https://example.com/quiz.pdf"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                    errors.quizLink
                      ? "border-rose-300"
                      : "border-gray-200 focus:border-teal-500"
                  }`}
                />
              )}

              {(errors.quizFile || errors.quizLink) && (
                <p className="text-sm text-rose-600 mt-2">
                  {errors.quizFile?.message || errors.quizLink?.message}
                </p>
              )}

              {/* Quiz Preview */}
              {(quizUrl || (quizMode === "link" && isValidUrl(quizLink))) && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Preview
                    </span>
                  </div>
                  <iframe
                    src={quizMode === "upload" ? quizUrl : quizLink}
                    className="w-full h-64 rounded-xl border border-gray-200"
                    title="Quiz Preview"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting || isPending}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-200 transition-all disabled:opacity-50"
              >
                {isSubmitting || isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Quiz
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
