"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  FileText,
  Loader2,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  Eye,
} from "lucide-react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { uploadImage, uploadPdf } from "@/utils/FileUpload/FileUpload";
import usePostUnitsPdfs from "@/utils/Api/Units/PostUnitspdfs";
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
  name: yup.string().trim().required("PDF title is required"),
  pdfMode: yup.mixed().oneOf(["upload", "link"]).required(),
  pdfFile: yup.mixed().when("pdfMode", {
    is: "upload",
    then: (s) =>
      s
        .required("Please upload a PDF")
        .test("fileType", "Only PDF files allowed", (v) =>
          v instanceof File ? v.type === "application/pdf" : false
        ),
    otherwise: (s) => s.nullable(),
  }),
  pdfLink: yup.string().when("pdfMode", {
    is: "link",
    then: (s) =>
      s
        .required("Please add a PDF link")
        .test("isUrl", "Invalid URL", isValidUrl)
        .test("isPdf", "Must be a .pdf link", (v) =>
          v?.toLowerCase().includes(".pdf")
        ),
    otherwise: (s) => s.optional(),
  }),
  thumbMode: yup.mixed().oneOf(["upload", "link"]).required(),
  thumbFile: yup.mixed().when("thumbMode", {
    is: "upload",
    then: (s) =>
      s
        .required("Please upload a thumbnail")
        .test("imgType", "Only images allowed", (v) =>
          v instanceof File ? v.type.startsWith("image/") : false
        ),
    otherwise: (s) => s.nullable(),
  }),
  thumbLink: yup.string().when("thumbMode", {
    is: "link",
    then: (s) =>
      s
        .required("Please add thumbnail URL")
        .test("isUrl", "Invalid URL", isValidUrl),
    otherwise: (s) => s.optional(),
  }),
});

export default function AddPdfPage() {
  const { unitId } = useParams();
  const router = useRouter();
  const { mutateAsync, isPending } = usePostUnitsPdfs();

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
      name: "",
      pdfMode: "upload",
      pdfFile: null,
      pdfLink: "",
      thumbMode: "upload",
      thumbFile: null,
      thumbLink: "",
    },
    resolver: yupResolver(schema),
    mode: "onTouched",
  });

  const pdfMode = watch("pdfMode");
  const pdfFile = watch("pdfFile");
  const pdfLink = watch("pdfLink");
  const thumbMode = watch("thumbMode");
  const thumbFile = watch("thumbFile");
  const thumbLink = watch("thumbLink");

  const [pdfUrl, setPdfUrl] = useState("");
  const [imgUrl, setImgUrl] = useState("");

  useEffect(() => {
    if (pdfMode === "upload" && pdfFile instanceof File) {
      const url = URL.createObjectURL(pdfFile);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPdfUrl("");
  }, [pdfMode, pdfFile]);

  useEffect(() => {
    if (thumbMode === "upload" && thumbFile instanceof File) {
      const url = URL.createObjectURL(thumbFile);
      setImgUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setImgUrl("");
  }, [thumbMode, thumbFile]);

  const onSubmit = async (data) => {
    const payload = { pdf_title: data.name, unit_id: unitId };

    try {
      if (data.pdfMode === "upload") {
        const res = await uploadPdf(data.pdfFile);
        if (res.status === "success") {
          payload.pdf_url = res.file_url;
        } else {
          toast.error(res.status);
          return;
        }
      } else {
        payload.pdf_url = data.pdfLink;
      }

      if (data.thumbMode === "upload") {
        payload.pdf_image = await uploadImage(data.thumbFile);
      } else {
        payload.pdf_image = data.thumbLink;
      }

      const response = await mutateAsync({ payload });
      if (response.status === "success") {
        toast.success(response.message);
        router.back();
      } else {
        toast.error(response.message);
      }
    } catch (error) {
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

      <BreadCrumb title="Add PDF" child="Add PDF" parent="Unit" />

      {/* Form Card */}
      <div className="mt-6">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-600 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add New PDF</h2>
                <p className="text-white/80 text-sm mt-1">
                  Add a PDF document to your unit
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* PDF Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                PDF Title <span className="text-teal-500">*</span>
              </label>
              <input
                {...register("name")}
                placeholder="Enter PDF title..."
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                  errors.name
                    ? "border-teal-300 focus:border-teal-500"
                    : "border-gray-200 focus:border-teal-500"
                }`}
              />
              {errors.name && (
                <p className="text-sm text-teal-600 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* PDF Source */}
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  PDF File <span className="text-teal-500">*</span>
                </label>

                <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setValue("pdfMode", "upload");
                      setValue("pdfLink", "");
                      clearErrors("pdfLink");
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                      pdfMode === "upload"
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
                      setValue("pdfMode", "link");
                      setValue("pdfFile", null);
                      clearErrors("pdfFile");
                      setPdfUrl("");
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                      pdfMode === "link"
                        ? "bg-teal-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    URL
                  </button>
                </div>
              </div>

              {pdfMode === "upload" ? (
                <Controller
                  control={control}
                  name="pdfFile"
                  render={({ field }) => (
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                        errors.pdfFile
                          ? "border-teal-300 bg-teal-50"
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
                        id="pdf-upload"
                      />
                      <label
                        htmlFor="pdf-upload"
                        className="cursor-pointer block"
                      >
                        <FileText className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          {pdfFile instanceof File
                            ? pdfFile.name
                            : "Click to upload PDF file"}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">PDF only</p>
                      </label>
                    </div>
                  )}
                />
              ) : (
                <input
                  {...register("pdfLink")}
                  placeholder="https://example.com/file.pdf"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                    errors.pdfLink
                      ? "border-teal-300"
                      : "border-gray-200 focus:border-teal-500"
                  }`}
                />
              )}

              {(errors.pdfFile || errors.pdfLink) && (
                <p className="text-sm text-teal-600 mt-2">
                  {errors.pdfFile?.message || errors.pdfLink?.message}
                </p>
              )}

              {/* PDF Preview */}
              {(pdfUrl || (pdfMode === "link" && isValidUrl(pdfLink))) && (
                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">
                      Preview
                    </span>
                  </div>
                  <iframe
                    src={pdfMode === "upload" ? pdfUrl : pdfLink}
                    className="w-full h-64 rounded-xl border border-gray-200"
                    title="PDF Preview"
                  />
                </div>
              )}
            </div>

            {/* Thumbnail */}
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Thumbnail <span className="text-teal-500">*</span>
                </label>

                <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setValue("thumbMode", "upload");
                      setValue("thumbLink", "");
                      clearErrors("thumbLink");
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                      thumbMode === "upload"
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
                      setValue("thumbMode", "link");
                      setValue("thumbFile", null);
                      clearErrors("thumbFile");
                      setImgUrl("");
                    }}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                      thumbMode === "link"
                        ? "bg-teal-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    URL
                  </button>
                </div>
              </div>

              {thumbMode === "upload" ? (
                <Controller
                  control={control}
                  name="thumbFile"
                  render={({ field }) => (
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                        errors.thumbFile
                          ? "border-teal-300 bg-teal-50"
                          : "border-gray-300 hover:border-teal-400"
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          field.onChange(e.target.files?.[0] ?? null)
                        }
                        className="hidden"
                        id="thumb-upload"
                      />
                      <label
                        htmlFor="thumb-upload"
                        className="cursor-pointer block"
                      >
                        <ImageIcon className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload image
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, WebP
                        </p>
                      </label>
                    </div>
                  )}
                />
              ) : (
                <input
                  {...register("thumbLink")}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                    errors.thumbLink
                      ? "border-teal-300"
                      : "border-gray-200 focus:border-teal-500"
                  }`}
                />
              )}

              {(errors.thumbFile || errors.thumbLink) && (
                <p className="text-sm text-teal-600 mt-2">
                  {errors.thumbFile?.message || errors.thumbLink?.message}
                </p>
              )}

              {/* Thumbnail Preview */}
              {(imgUrl || (thumbMode === "link" && isValidUrl(thumbLink))) && (
                <div className="mt-4">
                  <img
                    src={thumbMode === "upload" ? imgUrl : thumbLink}
                    alt="Thumbnail"
                    className="w-full h-40 object-cover rounded-xl border border-gray-200"
                  />
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-200 transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save PDF
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
