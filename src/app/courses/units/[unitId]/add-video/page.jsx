"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Video,
  Loader2,
  Upload,
  Link as LinkIcon,
  Image as ImageIcon,
  Clock,
  X,
} from "lucide-react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { uploadImage } from "../../../../../utils/FileUpload/FileUpload";
import usePostUnitsVideos from "../../../../../utils/Api/Units/PostUnitsVideos";
import toast from "react-hot-toast";

const schema = yup.object({
  name: yup.string().trim().required("Video title is required"),
  videoUrl: yup.string().trim().required("Video ID/URL is required"),
  duration: yup
    .string()
    .trim()
    .required("Duration is required")
    .matches(
      /^(\d+(\s?(min|mins|minute|minutes))?|(\d{1,2}:\d{2})|(\d+\s?h(\s?\d+\s?m)?)|(\d+\s?m))$/i,
      "Example: 90 min, 01:30, 1h 30m"
    ),
  imageMode: yup.string().oneOf(["upload", "url"]).required(),
  imageUrl: yup.string().when("imageMode", {
    is: "url",
    then: (s) => s.trim().required("Image URL is required").url("Invalid URL"),
    otherwise: (s) => s.trim().nullable(),
  }),
  imageFile: yup.mixed().when("imageMode", {
    is: "upload",
    then: (s) =>
      s
        .required("Image file is required")
        .test("fileType", "Only images allowed", (file) =>
          file instanceof File ? file.type?.startsWith("image/") : false
        )
        .test("fileSize", "Max 5MB", (file) =>
          file ? file.size <= 5 * 1024 * 1024 : false
        ),
    otherwise: (s) => s.nullable(),
  }),
});

export default function AddVideoPage() {
  const { unitId } = useParams();
  const router = useRouter();
  const { mutateAsync, isPending } = usePostUnitsVideos();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      videoUrl: "",
      duration: "",
      imageMode: "upload",
      imageFile: null,
      imageUrl: "",
    },
    resolver: yupResolver(schema),
    mode: "onBlur",
  });

  const imageMode = watch("imageMode");
  const imageUrl = watch("imageUrl");
  const imageFile = watch("imageFile");
  const [previewSrc, setPreviewSrc] = useState("");

  useEffect(() => {
    if (imageMode === "upload" && imageFile instanceof File) {
      const url = URL.createObjectURL(imageFile);
      setPreviewSrc(url);
      return () => URL.revokeObjectURL(url);
    }
    if (imageMode === "url") {
      setPreviewSrc(imageUrl?.trim() || "");
    } else {
      setPreviewSrc("");
    }
  }, [imageMode, imageUrl, imageFile]);

  const onSubmit = async (values) => {
    const payload = {
      video_title: values.name,
      video_player_id: values.videoUrl,
      unit_id: unitId,
      duration: Number(values.duration.split(" ")[0]),
    };

    try {
      if (imageMode === "upload") {
        payload.video_image = await uploadImage(values.imageFile);
      } else {
        payload.video_image = values.imageUrl;
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

      <BreadCrumb title="Add Video" child="Add Video" parent="Unit" />

      {/* Form Card */}
      <div className="mt-6">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-teal-600 to-teal-600 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <Video className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add New Video</h2>
                <p className="text-white/80 text-sm mt-1">
                  Add a video lesson to your unit
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Video Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Video Title <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("name")}
                placeholder="Enter video title..."
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                  errors.name
                    ? "border-rose-300 focus:border-rose-500"
                    : "border-gray-200 focus:border-teal-500"
                }`}
              />
              {errors.name && (
                <p className="text-sm text-rose-600 mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Video ID/URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Video Player ID <span className="text-rose-500">*</span>
              </label>
              <input
                {...register("videoUrl")}
                placeholder="Enter video player ID..."
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                  errors.videoUrl
                    ? "border-rose-300 focus:border-rose-500"
                    : "border-gray-200 focus:border-teal-500"
                }`}
              />
              {errors.videoUrl && (
                <p className="text-sm text-rose-600 mt-1">
                  {errors.videoUrl.message}
                </p>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Duration <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  {...register("duration")}
                  placeholder="e.g. 90 min, 1h 30m..."
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border-2 outline-none transition-all ${
                    errors.duration
                      ? "border-rose-300 focus:border-rose-500"
                      : "border-gray-200 focus:border-teal-500"
                  }`}
                />
              </div>
              {errors.duration && (
                <p className="text-sm text-rose-600 mt-1">
                  {errors.duration.message}
                </p>
              )}
            </div>

            {/* Thumbnail */}
            <div className="p-5 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Thumbnail <span className="text-rose-500">*</span>
                </label>

                <div className="flex gap-2 bg-white rounded-lg p-1 border border-gray-200">
                  <button
                    type="button"
                    onClick={() => setValue("imageMode", "upload")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                      imageMode === "upload"
                        ? "bg-teal-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <Upload className="w-4 h-4" />
                    Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue("imageMode", "url")}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-1.5 ${
                      imageMode === "url"
                        ? "bg-teal-600 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <LinkIcon className="w-4 h-4" />
                    URL
                  </button>
                </div>
              </div>

              {imageMode === "upload" ? (
                <Controller
                  control={control}
                  name="imageFile"
                  render={({ field }) => (
                    <div
                      className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                        errors.imageFile
                          ? "border-rose-300 bg-rose-50"
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
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer block"
                      >
                        <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                        <p className="text-sm text-gray-600">
                          Click to upload or drag & drop
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, WebP • Max 5MB
                        </p>
                      </label>
                    </div>
                  )}
                />
              ) : (
                <input
                  {...register("imageUrl")}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                    errors.imageUrl
                      ? "border-rose-300"
                      : "border-gray-200 focus:border-teal-500"
                  }`}
                />
              )}

              {(errors.imageFile || errors.imageUrl) && (
                <p className="text-sm text-rose-600 mt-2">
                  {errors.imageFile?.message || errors.imageUrl?.message}
                </p>
              )}

              {/* Preview */}
              {previewSrc && (
                <div className="mt-4 relative">
                  <img
                    src={previewSrc}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded-xl border border-gray-200"
                    onError={() => setPreviewSrc("")}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setValue("imageFile", null);
                      setValue("imageUrl", "");
                      setPreviewSrc("");
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg hover:bg-black/70 transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
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
                    Save Video
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
