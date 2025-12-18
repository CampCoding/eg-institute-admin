"use client";
import React, { useMemo, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { uploadImage, uploadPdf } from "@/utils/FileUpload/FileUpload";
import usePostUnitsPdfs from "@/utils/Api/Units/PostUnitspdfs";
import toast from "react-hot-toast";

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
  name: yup.string().trim().required("Unit title is required"),

  pdfMode: yup.mixed().oneOf(["upload", "link"]).required(),
  pdfFile: yup.mixed().when("pdfMode", {
    is: "upload",
    then: (s) =>
      s
        .required("Please upload a PDF")
        .test("fileRequired", "Please upload a PDF", (v) => v instanceof File)
        .test("fileType", "Only PDF files are allowed", (v) =>
          v instanceof File ? v.type === "application/pdf" : false
        ),
    otherwise: (s) => s.nullable(),
  }),
  pdfLink: yup.string().when("pdfMode", {
    is: "link",
    then: (s) =>
      s
        .required("Please add a PDF link")
        .test("isUrl", "Invalid URL", (v) => isValidUrl(v))
        .test("isPdf", "Link must be a .pdf", (v) =>
          typeof v === "string" ? v.toLowerCase().includes(".pdf") : false
        ),
    otherwise: (s) => s.optional(),
  }),

  // OPTIONAL: thumbnail (image) upload or link
  thumbMode: yup.mixed().oneOf(["upload", "link"]).required(),
  thumbFile: yup.mixed().when("thumbMode", {
    is: "upload",
    then: (s) =>
      s
        .required("Please upload a thumbnail image")
        .test(
          "fileRequired",
          "Please upload a thumbnail image",
          (v) => v instanceof File
        )
        .test("imgType", "Only image files are allowed", (v) =>
          v instanceof File ? v.type.startsWith("image/") : false
        ),
    otherwise: (s) => s.nullable(),
  }),

  thumbLink: yup.string().when("thumbMode", {
    is: "link",
    then: (s) =>
      s
        .required("Please add a thumbnail image link")
        .test("isUrl", "Invalid URL", (v) => isValidUrl(v)),
    otherwise: (s) => s.optional(),
  }),
});

export default function AddUnitPage() {
  const { unitId } = useParams();
  const router = useRouter();
  const { mutateAsync, isPending } = usePostUnitsPdfs();

  const defaultValues = useMemo(
    () => ({
      name: "",

      pdfMode: "upload",
      pdfFile: null,
      pdfLink: "",

      thumbMode: "upload",
      thumbFile: null,
      thumbLink: "",
    }),
    []
  );

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    clearErrors,
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
    mode: "onTouched",
  });

  // ---- watch modes/values ----
  const pdfMode = watch("pdfMode");
  const pdfFile = watch("pdfFile");
  const pdfLink = watch("pdfLink");

  const thumbMode = watch("thumbMode");
  const thumbFile = watch("thumbFile");
  const thumbLink = watch("thumbLink");

  // ---- PDF Preview URL (file) ----
  const [pdfUrl, setPdfUrl] = useState("");
  useEffect(() => {
    if (pdfMode !== "upload" || !(pdfFile instanceof File)) {
      setPdfUrl("");
      return;
    }
    const url = URL.createObjectURL(pdfFile);
    setPdfUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [pdfMode, pdfFile]);

  // ---- Image Preview URL (file) ----
  const [imgUrl, setImgUrl] = useState("");
  useEffect(() => {
    if (thumbMode !== "upload" || !(thumbFile instanceof File)) {
      setImgUrl("");
      return;
    }
    const url = URL.createObjectURL(thumbFile);
    setImgUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [thumbMode, thumbFile]);

  const switchPdfMode = (mode) => {
    setValue("pdfMode", mode);
    // hide + clear the other input
    if (mode === "upload") {
      setValue("pdfLink", "");
      clearErrors(["pdfLink"]);
    } else {
      setValue("pdfFile", null);
      clearErrors(["pdfFile"]);
      setPdfUrl("");
    }
  };

  const switchThumbMode = (mode) => {
    setValue("thumbMode", mode);
    if (mode === "upload") {
      setValue("thumbLink", "");
      clearErrors(["thumbLink"]);
    } else {
      setValue("thumbFile", null);
      clearErrors(["thumbFile"]);
      setImgUrl("");
    }
  };

  const onSubmit = async (data) => {
    const payload = {
      pdf_title: data.name,
      unit_id: unitId,
    };

    try {
      if (data.pdfMode === "upload") {
        const fileName = await uploadPdf(data.pdfFile);
        console.log(fileName);
        if (fileName.status === "success") {
          payload.pdf_url = fileName?.file_url;
        } else {
          toast.error(fileName.status);
          return;
        }
      } else {
        payload.pdf_url = data.pdfLink;
      }
      if (data.thumbMode === "upload") {
        const fileName = await uploadImage(data.thumbFile);
        console.log(fileName);
        payload.pdf_image = fileName;
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
      console.log(error);
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

      <BreadCrumb title="Add PDF" child="PDFs" parent="Add PDF" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-3 px-2 sm:px-4 grid gap-6"
      >
        <div className="rounded-2xl">
          {/* Unit Title */}
          <div className="my-1">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Unit Title</label>
              {errors.name && (
                <p className="text-sm !mb-0 text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>
            <input
              {...register("name")}
              placeholder="Enter unit name"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
            />
          </div>

          {/* PDF Source Toggle */}
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">PDF Source</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => switchPdfMode("upload")}
                  className={`px-3 py-1 rounded-lg border text-sm ${
                    pdfMode === "upload"
                      ? "!bg-(--primary-color) !text-white"
                      : "border-slate-200"
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => switchPdfMode("link")}
                  className={`px-3 py-1 rounded-lg border text-sm ${
                    pdfMode === "link"
                      ? "!bg-(--primary-color) !text-white"
                      : "border-slate-200"
                  }`}
                >
                  Link
                </button>
              </div>
            </div>

            {/* Upload PDF */}
            {pdfMode === "upload" && (
              <div className="mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">
                    Upload PDF file
                  </span>
                  {errors.pdfFile && (
                    <p className="text-sm !mb-0 text-red-600">
                      {errors.pdfFile.message}
                    </p>
                  )}
                </div>

                <Controller
                  control={control}
                  name="pdfFile"
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
              </div>
            )}

            {/* PDF Link */}
            {pdfMode === "link" && (
              <div className="mt-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">Paste PDF URL</span>
                  {errors.pdfLink && (
                    <p className="text-sm !mb-0 text-red-600">
                      {errors.pdfLink.message}
                    </p>
                  )}
                </div>
                <input
                  {...register("pdfLink")}
                  placeholder="https://example.com/file.pdf"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                />
              </div>
            )}

            {/* PDF Preview (file OR link) */}
            {(pdfUrl || (pdfMode === "link" && isValidUrl(pdfLink))) && (
              <div className="mt-4 rounded-2xl border w-full place-self-center border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <p className="text-sm">
                    <span className="font-medium">Preview:</span>{" "}
                    {pdfMode === "upload" && pdfFile instanceof File
                      ? pdfFile.name
                      : pdfLink}
                  </p>
                </div>

                <iframe
                  src={pdfMode === "upload" ? pdfUrl : pdfLink}
                  title="PDF Preview"
                  className=" w-full place-self-center h-[30vh]"
                />
              </div>
            )}
          </div>

          {/* Thumbnail (optional) */}
          <div className="mt-8">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">
                Thumbnail (optional)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => switchThumbMode("upload")}
                  className={`px-3 py-1 rounded-lg border text-sm ${
                    thumbMode === "upload"
                      ? "!bg-(--primary-color) !text-white"
                      : "border-slate-200"
                  }`}
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => switchThumbMode("link")}
                  className={`px-3 py-1 rounded-lg border text-sm ${
                    thumbMode === "link"
                      ? "!bg-(--primary-color) !text-white"
                      : "border-slate-200"
                  }`}
                >
                  Link
                </button>
              </div>
            </div>

            {thumbMode === "upload" && (
              <div className="mt-2">
                {errors.thumbFile && (
                  <p className="text-sm !mb-0 text-red-600">
                    {errors.thumbFile.message}
                  </p>
                )}
                <Controller
                  control={control}
                  name="thumbFile"
                  render={({ field }) => (
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) =>
                        field.onChange(e.target.files?.[0] ?? null)
                      }
                      className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                    />
                  )}
                />
              </div>
            )}

            {thumbMode === "link" && (
              <div className="mt-2">
                {errors.thumbLink && (
                  <p className="text-sm !mb-0 text-red-600">
                    {errors.thumbLink.message}
                  </p>
                )}
                <input
                  {...register("thumbLink")}
                  placeholder="https://example.com/cover.jpg"
                  className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                />
              </div>
            )}

            {/* Thumbnail Preview */}
            {(imgUrl || (thumbMode === "link" && isValidUrl(thumbLink))) && (
              <div className="mt-4 rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
                  <p className="text-sm">
                    <span className="font-medium">Thumbnail preview</span>
                  </p>
                </div>
                <img
                  src={thumbMode === "upload" ? imgUrl : thumbLink}
                  alt="Thumbnail Preview"
                  className="w-full max-h-[150px] object-contain bg-white"
                />
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)] !text-white px-4 py-2 font-medium hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting ? (
              "Saving..."
            ) : (
              <>
                {" "}
                <Save size={18} />
                Save Unit
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => router.push(`/courses/${course?.id}`)}
            className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
