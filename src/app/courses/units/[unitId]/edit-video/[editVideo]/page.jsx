"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { courses } from "@/utils/data";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { uploadImage } from "@/utils/FileUpload/FileUpload";
import usePostUnitsVideos from "@/utils/Api/Units/PostUnitsVideos";
import toast from "react-hot-toast";

const schema = yup.object({
  name: yup.string().trim().required("Video title is required"),
  videoUrl: yup.string().trim().required("Video link is required"),
  duration: yup
    .string()
    .trim()
    .required("Duration is required")
    // يقبل: "90" أو "90 min" أو "01:30" أو "1h 30m"
    .matches(
      /^(\d+(\s?(min|mins|minute|minutes))?|(\d{1,2}:\d{2})|(\d+\s?h(\s?\d+\s?m)?)|(\d+\s?m))$/i,
      "Duration format example: 90 min, 01:30, 1h 30m"
    ),

  imageMode: yup.string().oneOf(["upload", "url"]).required(),

  imageUrl: yup.string().when("imageMode", {
    is: "url",
    then: (s) =>
      s
        .trim()
        .required("Image URL is required")
        .url("Please enter a valid image URL"),
    otherwise: (s) => s.trim().nullable(),
  }),

  imageFile: yup.mixed().when("imageMode", {
    is: "upload",
    then: (s) =>
      s
        .required("Image file is required")
        .test("fileType", "Only images are allowed", (file) => {
          if (!file) return false;
          return file instanceof File && file.type?.startsWith("image/");
        })
        .test("fileSize", "Max size is 5MB", (file) => {
          if (!file) return false;
          return file.size <= 5 * 1024 * 1024;
        }),
    otherwise: (s) => s.nullable(),
  }),
});

export default function AddVideoPage() {
  const { unitId } = useParams();
  const router = useRouter();
  const { mutateAsync, isPending } = usePostUnitsVideos();

  const course = useMemo(
    () => courses?.find((c) => c.id === Number(unitId)),
    [unitId]
  );

  const defaultValues = useMemo(
    () => ({
      name: "",
      videoUrl: "",
      duration: "",
      imageMode: "upload", // default
      imageFile: null,
      imageUrl: "",
    }),
    []
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
    mode: "onBlur",
  });
  const item = JSON.parse(localStorage.getItem("video"));

  const imageMode = watch("imageMode");
  const imageUrl = watch("imageUrl");
  const imageFile = watch("imageFile");
  const [previewSrc, setPreviewSrc] = useState("");

  // ✅ لما يغيّر المود: صفّر الحقل التاني + يخفيه
  useEffect(() => {
    // لو Upload
    if (imageMode === "upload") {
      if (imageFile instanceof File) {
        const objectUrl = URL.createObjectURL(imageFile);
        setPreviewSrc(objectUrl);

        // cleanup
        return () => URL.revokeObjectURL(objectUrl);
      }
      setPreviewSrc("");
      return;
    }

    // لو Link
    if (imageMode === "url") {
      setPreviewSrc(imageUrl?.trim() || "");
    }
  }, [imageMode, imageUrl, imageFile]);

  useEffect(() => {
    if (!item) return;
    console.log(item);
    reset({
      name: item.video_title,
      videoUrl: item.video_player_id,
      duration: `${item.duration} min`,
      imageMode: "url",
      imageUrl: item.video_image,
    });
  }, [reset]);
  const onSubmit = async (values) => {
    const payload = {
      video_title: values.name,
      video_player_id: values.videoUrl,
      unit_id: unitId,

      duration: Number(values.duration.split(" ")[0]), // in minutes
    };
    if (imageMode === "upload") {
      const fileName = await uploadImage(values.imageFile);
      console.log(fileName);
      payload.video_image = fileName;
    } else {
      payload.video_image = values.imageUrl;
    }
    try {
      const response = await mutateAsync({
        payload,
        type: "update",
        id: item.video_id,
      });
      if (response.status === "success") {
        toast.success(response.message);
        localStorage.removeItem("video");
        router.back();
      } else {
        toast.error(response.message);
      }
    } catch (error) {}
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

      <BreadCrumb title="Edit Video" child="Edit" parent="Unit Videos" />

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-3 px-2 sm:px-4 grid gap-6"
      >
        <div className="rounded-2xl space-y-4">
          {/* Video Title */}
          <div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Video Title</label>
              {errors.name?.message && (
                <p className="text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>
            <input
              {...register("name")}
              placeholder="Enter video title"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
            />
          </div>

          {/* Video Link */}
          <div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Video Link</label>
              {errors.videoUrl?.message && (
                <p className="text-xs text-red-600">
                  {errors.videoUrl.message}
                </p>
              )}
            </div>
            <input
              {...register("videoUrl")}
              placeholder="Enter video link"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
            />
          </div>

          {/* Duration */}
          <div>
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Duration</label>
              {errors.duration?.message && (
                <p className="text-xs text-red-600">
                  {errors.duration.message}
                </p>
              )}
            </div>
            <input
              {...register("duration")}
              placeholder='e.g. "90 min" or "01:30" or "1h 30m"'
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
            />
          </div>

          {/* Image Mode */}
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Thumbnail</label>
              {(errors.imageUrl?.message || errors.imageFile?.message) && (
                <p className="text-xs text-red-600">
                  {errors.imageUrl?.message || errors.imageFile?.message}
                </p>
              )}
            </div>

            <div className="mt-2 flex gap-4 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="upload"
                  {...register("imageMode")}
                  className="accent-[var(--primary-color)]"
                />
                Upload
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="url"
                  {...register("imageMode")}
                  className="accent-[var(--primary-color)]"
                />
                Link
              </label>
            </div>

            {/* Upload */}
            {imageMode === "upload" && (
              <div className="mt-3">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setValue("imageFile", file, { shouldValidate: true });
                  }}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
                <p className="!mt-2 text-xs text-slate-500">
                  PNG/JPG/WebP — max 5MB
                </p>
              </div>
            )}

            {/* URL */}
            {imageMode === "url" && (
              <div className="mt-3">
                <input
                  {...register("imageUrl")}
                  placeholder="https://.../image.png"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                />
              </div>
            )}
            {previewSrc ? (
              <div className="mt-3">
                <div className="text-xs text-slate-500 mb-1">Preview</div>
                <img
                  src={previewSrc}
                  alt="preview"
                  className="w-full max-h-56 object-contain !rounded-lg border !border-slate-200 bg-slate-50"
                  onError={() => setPreviewSrc("")}
                />
              </div>
            ) : (
              <div className="mt-3 text-xs text-slate-500">No preview yet.</div>
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
            <Save size={18} />
            {isSubmitting ? "Saving..." : "Save Unit"}
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
