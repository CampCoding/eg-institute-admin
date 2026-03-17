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
  Upload,
  Progress,
} from "antd";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import {
  ArrowLeft,
  Star,
  ChevronRight,
  Upload as UploadIcon,
  Video,
  Play,
  X,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { teacherSchema } from "../_Schema";
import toast from "react-hot-toast";
import {
  CountrySelect,
  TimeZoneSelect,
} from "../../../utils/TimeZone/TimeZone";
import axios from "axios";
import { BASE_URL } from "../../../utils/base_url";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

// Extend dayjs with custom parse format plugin
dayjs.extend(customParseFormat);

const { TextArea } = Input;
const { Option } = Select;

// ============ TIME HELPER FUNCTIONS ============

const toPickerValue = (value) => {
  if (!value) return null;
  if (dayjs.isDayjs(value)) return value;
  const parsed = dayjs(value, ["HH:mm", "HH:mm:ss", "H:mm", "H:mm:ss"]);
  return parsed.isValid() ? parsed : null;
};

const toTimeString = (dayjsValue) => {
  if (!dayjsValue) return null;
  if (dayjs.isDayjs(dayjsValue)) {
    return dayjsValue.format("HH:mm");
  }
  return dayjsValue;
};

const formatTimeForSubmit = (value) => {
  if (!value) return null;
  if (dayjs.isDayjs(value)) {
    return value.format("HH:mm:ss");
  }
  const parsed = dayjs(value, ["HH:mm", "HH:mm:ss", "H:mm", "H:mm:ss"]);
  if (parsed.isValid()) {
    return parsed.format("HH:mm:ss");
  }
  if (typeof value === "string" && /^\d{1,2}:\d{2}$/.test(value)) {
    return `${value}:00`;
  }
  return value;
};

// ============ CONSTANTS ============

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
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop";

// ============ RHF FORM ITEM COMPONENT ============

function RHFFormItem({
  name,
  control,
  label,
  rules,
  required,
  children,
  className = "",
  labelClassName = "",
  errorClassName = "",
  disabled = false,
  description = null,
}) {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <div className={`space-y-2 ${className}`}>
          {label && (
            <label
              className={`block text-sm font-medium text-gray-700 ${labelClassName}`}
            >
              {label}
              {required && <span className="text-red-500 ml-1">*</span>}
            </label>
          )}

          {description && (
            <p className="text-xs text-gray-500 -mt-1 mb-2">{description}</p>
          )}

          <div className="relative">
            {typeof children === "function"
              ? children({
                  field: {
                    ...field,
                    disabled: disabled || field.disabled,
                  },
                  fieldState,
                })
              : React.cloneElement(children, {
                  ...field,
                  disabled: disabled || field.disabled,
                  status: fieldState.error ? "error" : "",
                  className: `${children.props.className || ""} ${fieldState.error ? "border-red-500" : ""}`,
                })}
          </div>

          {fieldState.error && (
            <p
              className={`text-sm text-red-600 mt-1 flex items-center gap-1 ${errorClassName}`}
            >
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}

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
    video: values.video || "",
  };
}

// ============ UPLOAD FUNCTIONS ============

// Upload PDF Function (from your existing code)
async function uploadPdf(file) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("AccessToken") || localStorage.getItem("token")
      : null;

  if (!token) {
    return { status: "error", message: "No authentication token found" };
  }

  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await axios.post(
      `https://camp-coding.tech/eg_Institute/pdf_uplouder.php`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      }
    );

    if (response.data) {
      return { status: "success", file_url: response.data?.file_url };
    } else {
      return { status: "error", message: "Failed to upload PDF" };
    }
  } catch (error) {
    console.error("PDF upload error:", error);
    return { status: "error", message: error.message };
  }
}

// Upload Image Function (from your existing code)
async function uploadImage(file) {
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("AccessToken") || localStorage.getItem("token")
      : null;

  if (!token) {
    throw new Error("No authentication token found");
  }

  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(
      `https://camp-coding.tech/eg_Institute/image_uplouder.php`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      }
    );

    if (response.data) {
      return response.data;
    } else {
      throw new Error("Failed to upload image");
    }
  } catch (error) {
    console.error("Image upload error:", error);
    throw error;
  }
}

// ============ MAIN COMPONENT ============

export default function AddTeacherPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [videoUploadLoading, setVideoUploadLoading] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  // New state for certificates
  const [certificatesLoading, setCertificatesLoading] = useState(false);
  const [uploadedCertificates, setUploadedCertificates] = useState([]);

  // Get token from localStorage
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("AccessToken") || localStorage.getItem("token")
      : null;

  const {
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm({
    mode: "onSubmit",
    resolver: yupResolver(teacherSchema),
    defaultValues: {
      level: "Expert",
      photo: "",
      video: "",
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
      experience: "",
      teacher_slots: [],
      teacher_certificates: "", // New field
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

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!token) {
      toast.error("Authentication token not found. Please login again.");
      return;
    }

    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await axios.post(
        `https://camp-coding.tech/eg_Institute/image_uplouder.php`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 30000,
        }
      );

      if (response.data) {
        const imageUrl = response.data;
        setValue("photo", imageUrl);
        toast.success("Image uploaded successfully!");
      } else {
        toast.error(response.data?.message || "Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploadLoading(false);
    }
  };

  // Handle video upload
  const handleVideoUpload = async (file) => {
    if (!token) {
      toast.error("Authentication token not found. Please login again.");
      return;
    }

    const isVideo = file.type.startsWith("video/");
    if (!isVideo) {
      toast.error("You can only upload video files!");
      return;
    }

    const isLt500M = file.size / 1024 / 1024 < 500;
    if (!isLt500M) {
      toast.error("Video must be smaller than 500MB!");
      return;
    }

    setVideoFile(file);
    setVideoUploadLoading(true);
    setVideoUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("video", file);

      const response = await axios.post(
        `https://camp-coding.tech/eg_Institute/video_uploader.php`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          timeout: 300000,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setVideoUploadProgress(percentCompleted);
          },
        }
      );

      if (response.data) {
        const videoUrl = response.data;
        setValue("video", videoUrl);
        toast.success("Video uploaded successfully!");
        setVideoFile(null);
      } else {
        toast.error(response.data?.message || "Failed to upload video");
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      toast.error("Failed to upload video. Please try again.");
    } finally {
      setVideoUploadLoading(false);
      setVideoUploadProgress(0);
    }
  };

  // Clear video
  const clearVideo = () => {
    setValue("video", "");
    setVideoFile(null);
  };

  // ============ NEW: Handle Certificates Upload ============
  const handleCertificateUpload = async (file) => {
    if (!token) {
      toast.error("Authentication token not found. Please login again.");
      return;
    }

    // Validate file type
    const isPDF = file.type === "application/pdf";
    const isImage = file.type.startsWith("image/");

    if (!isPDF && !isImage) {
      toast.error("You can only upload PDF or image files!");
      return;
    }

    const isLt10M = file.size / 1024 / 1024 < 10;
    if (!isLt10M) {
      toast.error("File must be smaller than 10MB!");
      return;
    }

    setCertificatesLoading(true);

    try {
      let fileUrl;

      if (isPDF) {
        const res = await uploadPdf(file);
        if (res.status === "success") {
          fileUrl = res.file_url;
        } else {
          toast.error(res.message || "Failed to upload PDF");
          setCertificatesLoading(false);
          return;
        }
      } else {
        fileUrl = await uploadImage(file);
      }

      if (fileUrl) {
        const currentCertificates = watch("teacher_certificates");
        const certificatesArray = currentCertificates
          ? currentCertificates.split("**").filter(Boolean)
          : [];
        certificatesArray.push(fileUrl);

        setValue("teacher_certificates", certificatesArray.join("**"));
        setUploadedCertificates((prev) => [
          ...prev,
          {
            url: fileUrl,
            name: file.name,
            type: file.type,
          },
        ]);

        toast.success(
          `${isPDF ? "Certificate PDF" : "Certificate Image"} uploaded successfully!`
        );
      }
    } catch (error) {
      console.error("Error uploading certificate:", error);
      toast.error("Failed to upload certificate. Please try again.");
    } finally {
      setCertificatesLoading(false);
    }
  };

  // Remove certificate
  const removeCertificate = (index) => {
    const currentCertificates = watch("teacher_certificates")
      .split("**")
      .filter(Boolean);
    currentCertificates.splice(index, 1);
    setValue("teacher_certificates", currentCertificates.join("**"));

    setUploadedCertificates((prev) => {
      const newCertificates = [...prev];
      newCertificates.splice(index, 1);
      return newCertificates;
    });

    toast.success("Certificate removed");
  };

  // Form submit handler
  const onSubmit = async (values) => {
    if (!token) {
      toast.error("Authentication token not found. Please login again.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!values.name || !values.email || !values.title) {
        toast.error("Please fill in all required fields");
        setIsSubmitting(false);
        return;
      }

      // Validate teacher slots if any
      if (values.teacher_slots?.length > 0) {
        const invalidSlots = values.teacher_slots.some(
          (slot) => !slot.day || !slot.slots_from || !slot.slots_to
        );
        if (invalidSlots) {
          toast.error(
            "Please complete all teacher slot fields or remove incomplete slots"
          );
          setIsSubmitting(false);
          return;
        }
      }

      // تحويل الشهادات من string إلى array
      const certificatesString = values.teacher_certificates || "";
      const certificatesArray = certificatesString
        ? certificatesString.split("**").filter(Boolean)
        : [];

      // Build payload
      const payload = {
        teacher_name: values.name,
        teacher_email: values.email,
        phone: values.phone || "",
        hourly_rate: String(values.hourly_rate || "0"),
        experience_hours: String(values.experience || "0"),
        teacher_image: values.photo || DEFAULT_PHOTO,
        video: values.video || "",
        // إرسال الشهادات كـ Array
        teacher_certificates: certificatesArray,
        specialization: values.title,
        bio: values.summary || "",
        tags: Array.isArray(values.tags)
          ? values.tags.join(", ")
          : values.tags || "",
        level: values.level || "Expert",
        created_at: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        country: values.country || "",
        // إرسال اللغات كـ Array (موجود بالفعل)
        languages: Array.isArray(values.Languages) ? values.Languages : [],
        teacher_slots: (values.teacher_slots || []).map((slot) => ({
          day: slot.day,
          slots_from: dayjs.isDayjs(slot.slots_from)
            ? slot.slots_from.format("HH:mm")
            : slot.slots_from || null,
          slots_to: dayjs.isDayjs(slot.slots_to)
            ? slot.slots_to.format("HH:mm")
            : slot.slots_to || null,
        })),
      };

      console.log("Submitting payload:", payload);

      const response = await axios.post(
        `${BASE_URL}/teachers/add_teacher.php`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          timeout: 15000,
        }
      );

      console.log("API Response:", response.data);

      if (response.data && response.data.status === "success") {
        toast.success(response.data.message || "Teacher added successfully!");
        reset();
        setUploadedCertificates([]); // Reset certificates state
        setTimeout(() => {
          router.push("/teachers");
        }, 1000);
      } else {
        toast.error(response.data?.message || "Failed to add teacher");
      }
    } catch (error) {
      console.error("Error adding teacher:", error);

      if (error.response) {
        const errorMessage =
          error.response.data?.message ||
          `Server error: ${error.response.status}`;
        toast.error(errorMessage);
      } else if (error.request) {
        toast.error(
          "Network error: Unable to connect to server. Please check your internet connection."
        );
      } else {
        toast.error("An unexpected error occurred while adding the teacher.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMultipleCertificatesUpload = async (files) => {
    if (certificatesLoading || !token) {
      if (!token) {
        toast.error("Authentication token not found. Please login again.");
      }
      return;
    }

    // Filter and validate files
    const validFiles = [];
    for (const file of files) {
      const isPDF = file.type === "application/pdf";
      const isImage = file.type.startsWith("image/");

      if (!isPDF && !isImage) {
        toast.error(`${file.name}: Only PDF or image files allowed!`);
        continue;
      }

      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        toast.error(`${file.name}: File must be smaller than 10MB!`);
        continue;
      }

      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setCertificatesLoading(true);

    try {
      const results = [];

      for (const file of validFiles) {
        const isPDF = file.type === "application/pdf";

        try {
          let fileUrl;

          if (isPDF) {
            const res = await uploadPdf(file);
            if (res.status === "success") {
              fileUrl = res.file_url;
            } else {
              throw new Error(res.message || "Failed to upload PDF");
            }
          } else {
            fileUrl = await uploadImage(file);
          }

          results.push({
            success: true,
            url: fileUrl,
            name: file.name,
            type: file.type,
          });
        } catch (error) {
          results.push({
            success: false,
            name: file.name,
            error: error.message,
          });
        }
      }

      const successfulUploads = results.filter((r) => r.success);
      const failedUploads = results.filter((r) => !r.success);

      if (successfulUploads.length > 0) {
        // Get current certificates as string
        const currentCertificates = getValues("teacher_certificates") || "";
        const certificatesArray = currentCertificates
          ? currentCertificates.split("**").filter(Boolean)
          : [];

        // Add new URLs (avoid duplicates)
        successfulUploads.forEach((upload) => {
          if (!certificatesArray.includes(upload.url)) {
            certificatesArray.push(upload.url);
          }
        });

        // Store as string with ** separator (will convert to array on submit)
        setValue("teacher_certificates", certificatesArray.join("**"));

        // Update state
        setUploadedCertificates((prev) => {
          const existingUrls = new Set(prev.map((f) => f.url));
          const newFiles = successfulUploads.filter(
            (upload) => !existingUrls.has(upload.url)
          );
          return [
            ...prev,
            ...newFiles.map((upload) => ({
              url: upload.url,
              name: upload.name,
              type: upload.type,
            })),
          ];
        });

        toast.success(
          `${successfulUploads.length} file(s) uploaded successfully!`
        );
      }

      if (failedUploads.length > 0) {
        failedUploads.forEach((f) => {
          toast.error(`Failed to upload: ${f.name}`);
        });
      }
    } catch (error) {
      console.error("Error uploading certificates:", error);
      toast.error("Failed to upload certificates. Please try again.");
    } finally {
      setCertificatesLoading(false);
    }
  };

  const imageUploadProps = {
    beforeUpload: (file) => {
      handleImageUpload(file);
      return false;
    },
    showUploadList: false,
  };

  const videoUploadProps = {
    beforeUpload: (file) => {
      handleVideoUpload(file);
      return false;
    },
    showUploadList: false,
    accept: "video/*",
  };

  const certificatesUploadProps = {
    beforeUpload: () => false,
    showUploadList: false,
    accept: "application/pdf,image/*",
    multiple: true,
    fileList: [], // Always empty to prevent accumulation
    customRequest: () => {}, // Prevent default upload
  };

  return (
    <div className="min-h-screen">
      <div className="flex mb-4 items-center gap-2">
        <button
          type="button"
          onClick={() => router.push("/teachers")}
          className="rounded-xl border border-slate-200 px-3 py-2 text-sm hover:bg-slate-50 transition-colors duration-200"
          disabled={isSubmitting}
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
            onSubmit={handleSubmit(onSubmit)}
            autoComplete="off"
            className="space-y-8"
          >
            {/* Basic Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Basic Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RHFFormItem
                  name="name"
                  control={control}
                  label="Full Name"
                  required
                  description="Enter the teacher's full name"
                >
                  <Input
                    placeholder="e.g., Dr. Amira Hassan"
                    size="large"
                    className="rounded-lg"
                  />
                </RHFFormItem>

                <RHFFormItem
                  name="email"
                  control={control}
                  label="Email Address"
                  required
                  description="Professional email for contact"
                >
                  <Input
                    placeholder="e.g., teacher@example.com"
                    type="email"
                    size="large"
                    className="rounded-lg"
                  />
                </RHFFormItem>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <RHFFormItem
                  name="title"
                  control={control}
                  label="Specialization"
                  required
                  description="Main teaching specialization"
                >
                  <Input
                    placeholder="e.g., Modern Standard Arabic"
                    size="large"
                    className="rounded-lg"
                  />
                </RHFFormItem>

                <RHFFormItem
                  name="phone"
                  control={control}
                  label="Phone Number"
                  description="Contact phone number (optional)"
                >
                  <Input
                    placeholder="e.g., +2010xxxxxxx"
                    size="large"
                    className="rounded-lg"
                  />
                </RHFFormItem>
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Professional Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <RHFFormItem
                  name="Languages"
                  control={control}
                  label="Languages"
                  description="Languages the teacher speaks"
                >
                  {({ field }) => (
                    <Select
                      mode="tags"
                      allowClear
                      tokenSeparators={[","]}
                      placeholder="Add Language"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      size="large"
                      className="rounded-lg w-full"
                    >
                      {Languages.map((t) => (
                        <Option key={t} value={t}>
                          {t}
                        </Option>
                      ))}
                    </Select>
                  )}
                </RHFFormItem>

                <RHFFormItem
                  name="level"
                  control={control}
                  label="Teaching Level"
                  required
                  description="Teacher's experience level"
                >
                  {({ field }) => (
                    <Select
                      placeholder="Choose level"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      size="large"
                      className="rounded-lg w-full"
                    >
                      <Option value="Beginner">Beginner</Option>
                      <Option value="Intermediate">Intermediate</Option>
                      <Option value="Expert">Expert</Option>
                      <Option value="All_Levels">All Levels</Option>
                    </Select>
                  )}
                </RHFFormItem>

                <RHFFormItem
                  name="experience"
                  control={control}
                  label="Experience (Hours)"
                  description="Hours of teaching experience"
                >
                  <Input
                    placeholder="5"
                    type="number"
                    min="0"
                    size="large"
                    className="rounded-lg"
                    onWheel={(e) => e.target.blur()}
                  />
                </RHFFormItem>
              </div>

              <div className="mt-6">
                <RHFFormItem
                  name="tags"
                  control={control}
                  label="Specialization Tags"
                  description="Tags that describe the teacher's expertise"
                >
                  {({ field }) => (
                    <Select
                      mode="tags"
                      allowClear
                      tokenSeparators={[","]}
                      placeholder="Add tags (press Enter)"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      size="large"
                      className="rounded-lg w-full"
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
            </div>

            {/* Availability Schedule */}
            <div>
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-gray-200">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Availability Schedule
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Set up when the teacher is available for classes
                  </p>
                </div>
                <Button
                  type="dashed"
                  onClick={() =>
                    append({ day: "Monday", slots_from: null, slots_to: null })
                  }
                  disabled={isSubmitting}
                  size="large"
                  className="rounded-lg"
                >
                  + Add Time Slot
                </Button>
              </div>

              {fields.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-8 h-8 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </div>
                  <p className="text-gray-500 font-medium">
                    No time slots added yet
                  </p>
                  <p className="text-gray-400 text-sm mt-1">
                    Click "Add Time Slot" to get started
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {fields.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-6 bg-gray-50 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors duration-200"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900">
                        Time Slot #{index + 1}
                      </h4>
                      <Button
                        danger
                        onClick={() => remove(index)}
                        disabled={isSubmitting}
                        size="small"
                        className="rounded-lg"
                      >
                        Remove
                      </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
                            placeholder="Select Day"
                            size="large"
                            className="rounded-lg w-full"
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
                        label="Start Time"
                        required
                      >
                        {({ field }) => (
                          <TimePicker
                            value={toPickerValue(field.value)}
                            onChange={(dayjsValue) =>
                              field.onChange(toTimeString(dayjsValue))
                            }
                            onBlur={field.onBlur}
                            format="HH:mm"
                            minuteStep={5}
                            placeholder="Start Time"
                            className="w-full rounded-lg"
                            size="large"
                            showNow={false}
                            needConfirm={false}
                          />
                        )}
                      </RHFFormItem>

                      <RHFFormItem
                        name={`teacher_slots.${index}.slots_to`}
                        control={control}
                        label="End Time"
                        required
                      >
                        {({ field }) => {
                          const startValue = watch(
                            `teacher_slots.${index}.slots_from`
                          );

                          return (
                            <TimePicker
                              value={toPickerValue(field.value)}
                              onChange={(dayjsValue) =>
                                field.onChange(toTimeString(dayjsValue))
                              }
                              onBlur={field.onBlur}
                              format="HH:mm"
                              minuteStep={5}
                              placeholder="End Time"
                              className="w-full rounded-lg"
                              size="large"
                              showNow={false}
                              needConfirm={false}
                              disabledTime={() => {
                                const start = toPickerValue(startValue);
                                if (!start) return {};
                                const startHour = start.hour();
                                const startMinute = start.minute();
                                return {
                                  disabledHours: () =>
                                    Array.from(
                                      { length: startHour },
                                      (_, i) => i
                                    ),
                                  disabledMinutes: (selectedHour) =>
                                    selectedHour === startHour
                                      ? Array.from(
                                          { length: startMinute + 1 },
                                          (_, i) => i
                                        )
                                      : [],
                                };
                              }}
                            />
                          );
                        }}
                      </RHFFormItem>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio and Media */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                Additional Information
              </h3>

              <div className="space-y-6">
                <RHFFormItem
                  name="summary"
                  control={control}
                  label="Bio / Summary"
                  required
                  description="Tell students about the teacher's experience and teaching style"
                >
                  <TextArea
                    rows={5}
                    placeholder="Tell students about your teaching style, experience, and what makes you special..."
                    className="rounded-lg"
                  />
                </RHFFormItem>

                {/* Photo Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <RHFFormItem name="photo" control={control} label="Photo URL">
                    <Input
                      placeholder="https://images.unsplash.com/..."
                      size="large"
                      className="rounded-lg"
                    />
                  </RHFFormItem>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Or Upload Photo
                    </label>
                    <p className="text-xs text-gray-500">
                      Upload a photo directly from your device (JPG/PNG, max
                      2MB)
                    </p>
                    <Upload {...imageUploadProps}>
                      <Button
                        icon={<UploadIcon size={16} />}
                        loading={uploadLoading}
                        size="large"
                        className="w-full rounded-lg"
                        disabled={uploadLoading}
                      >
                        {uploadLoading ? "Uploading..." : "Upload Image"}
                      </Button>
                    </Upload>

                    {/* Show uploaded image preview */}
                    {watch("photo") && (
                      <div className="mt-2 flex items-center gap-3 p-2 bg-green-50 rounded-lg border border-green-200">
                        <img
                          src={watch("photo")}
                          alt="Profile"
                          className="w-10 h-10 rounded-lg object-cover"
                          onError={(e) => {
                            e.target.src = DEFAULT_PHOTO;
                          }}
                        />
                        <span className="text-sm text-green-700 flex-1 truncate">
                          Image uploaded
                        </span>
                        <button
                          type="button"
                          onClick={() => setValue("photo", "")}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Video Upload Section */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Video className="w-5 h-5 text-[#02AAA0]" />
                    <h4 className="text-base font-semibold text-gray-900">
                      Introduction Video
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Add a video introduction for students to learn more about
                    the teacher. You can enter a URL or upload a video file.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <RHFFormItem
                      name="video"
                      control={control}
                      label="Video URL"
                      description="YouTube, Vimeo, or direct video link"
                    >
                      <Input
                        placeholder="https://youtube.com/watch?v=... or https://vimeo.com/..."
                        size="large"
                        className="rounded-lg"
                        suffix={
                          watch("video") ? (
                            <button
                              type="button"
                              onClick={clearVideo}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <X size={16} />
                            </button>
                          ) : null
                        }
                      />
                    </RHFFormItem>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Or Upload Video
                      </label>
                      <p className="text-xs text-gray-500">
                        Upload a video file directly (max 500MB)
                      </p>
                      <Upload {...videoUploadProps}>
                        <Button
                          icon={<UploadIcon size={16} />}
                          loading={videoUploadLoading}
                          size="large"
                          className="w-full rounded-lg"
                          disabled={videoUploadLoading}
                        >
                          {videoUploadLoading
                            ? "Uploading Video..."
                            : "Upload Video"}
                        </Button>
                      </Upload>

                      {videoUploadLoading && (
                        <div className="mt-3">
                          <Progress
                            percent={videoUploadProgress}
                            size="small"
                            status="active"
                            strokeColor="#02AAA0"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Uploading: {videoFile?.name}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {watch("video") && !videoUploadLoading && (
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-green-600 flex items-center gap-2">
                          <Play size={16} />
                          Video Added
                        </span>
                        <button
                          type="button"
                          onClick={clearVideo}
                          className="text-sm text-red-500 hover:text-red-700"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 truncate">
                        {watch("video")}
                      </p>
                    </div>
                  )}
                </div>

                {/* ============ Certificates Upload Section ============ */}
                <div className="mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-5 h-5 text-[#02AAA0]" />
                    <h4 className="text-base font-semibold text-gray-900">
                      Teacher Certificates (PDF/Images)
                    </h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">
                    Upload certificates, diplomas, or qualifications. You can
                    select multiple files at once.
                  </p>

                  <div className="flex flex-col gap-4">
                    {/* Hidden File Input */}
                    <input
                      type="file"
                      id="certificates-upload"
                      multiple
                      accept="application/pdf,image/*"
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        if (files.length > 0 && !isUploading) {
                          handleMultipleCertificatesUpload(files);
                        }
                        // Reset input value to allow selecting same files again
                        e.target.value = "";
                      }}
                      disabled={certificatesLoading}
                    />

                    {/* Custom Upload Button */}
                    <Button
                      icon={<UploadIcon size={16} />}
                      loading={certificatesLoading}
                      size="large"
                      className="w-full rounded-lg"
                      disabled={certificatesLoading}
                      onClick={() => {
                        if (!certificatesLoading) {
                          document
                            .getElementById("certificates-upload")
                            ?.click();
                        }
                      }}
                    >
                      {certificatesLoading
                        ? "Uploading..."
                        : "Upload Certificates (PDF/Images)"}
                    </Button>

                    {/* Loading Indicator */}
                    {certificatesLoading && (
                      <div className="flex items-center justify-center gap-2 py-3 bg-teal-50 rounded-lg border border-teal-200">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-[#02AAA0] border-t-transparent"></div>
                        <span className="text-sm text-teal-700 font-medium">
                          Uploading files, please wait...
                        </span>
                      </div>
                    )}

                    {/* Uploaded Certificates List */}
                    {uploadedCertificates.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <FileText size={16} className="text-[#02AAA0]" />
                          Uploaded Certificates ({uploadedCertificates.length})
                        </p>
                        <div className="space-y-2">
                          {uploadedCertificates.map((file, index) => (
                            <div
                              key={`${file.url}-${index}`}
                              className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg border border-gray-200 hover:border-[#02AAA0] transition-all duration-200 shadow-sm hover:shadow-md"
                            >
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {file.type === "application/pdf" ? (
                                  <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <FileText
                                      size={20}
                                      className="text-red-600"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden border border-gray-200">
                                    <img
                                      src={file.url}
                                      alt={file.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        e.target.style.display = "none";
                                        e.target.parentElement.innerHTML = `
                          <div class="w-full h-full bg-gray-200 flex items-center justify-center">
                            <svg class="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                            </svg>
                          </div>
                        `;
                                      }}
                                    />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {file.name}
                                  </p>
                                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                    {file.type === "application/pdf" ? (
                                      <>
                                        <FileText size={12} />
                                        PDF Document
                                      </>
                                    ) : (
                                      <>
                                        <ImageIcon size={12} />
                                        Image File
                                      </>
                                    )}
                                  </p>
                                </div>
                              </div>
                              <button
                                type="button"
                                onClick={() => removeCertificate(index)}
                                className="ml-3 text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200 flex-shrink-0"
                                title="Remove certificate"
                                disabled={certificatesLoading}
                              >
                                <X size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Empty State */}
                    {uploadedCertificates.length === 0 &&
                      !certificatesLoading && (
                        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                          <p className="text-sm text-gray-600 font-medium">
                            No certificates uploaded yet
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Upload certificates to showcase teacher
                            qualifications
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <Button
                onClick={() => router.push("/teachers")}
                disabled={
                  isSubmitting || videoUploadLoading || certificatesLoading
                }
                size="large"
                className="px-8 rounded-lg"
              >
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={isSubmitting}
                disabled={videoUploadLoading || certificatesLoading}
                className="!bg-[#02AAA0] hover:!bg-[#029a92] px-8 rounded-lg"
                size="large"
              >
                {isSubmitting ? "Adding Teacher..." : "Add Teacher"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Right: LIVE PREVIEW */}
        <div className="lg:sticky lg:top-24">
          <Card className="!bg-white">
            <div className="mb-4">
              <h3 className="font-semibold text-lg">Live Preview</h3>
              <p className="text-sm text-slate-600">
                See how your teacher profile will look on the Teachers page.
              </p>
            </div>

            <article className="group relative overflow-hidden rounded-[22px] bg-white border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300">
              <div className="pointer-events-none absolute -left-10 bottom-0 h-24 w-24 rounded-full bg-gradient-to-br from-[#02AAA0] via-[#48CAE4] to-[#90E0EF] blur-2xl opacity-60" />
              <div className="pointer-events-none absolute -right-10 bottom-20 h-24 w-24 rounded-full bg-gradient-to-br from-[#02AAA0] via-[#48CAE4] to-[#90E0EF] blur-2xl opacity-60" />

              <div className="relative h-56 overflow-hidden">
                {preview.video ? (
                  <video
                    src={preview.video}
                    poster={preview.photo}
                    className="h-full w-full object-cover"
                    muted
                    loop
                    playsInline
                    onMouseEnter={(e) => e.target.play()}
                    onMouseLeave={(e) => {
                      e.target.pause();
                      e.target.currentTime = 0;
                    }}
                  />
                ) : (
                  <img
                    src={preview.photo}
                    alt={preview.name}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.src = DEFAULT_PHOTO;
                    }}
                  />
                )}

                {preview.video && (
                  <div className="absolute top-3 left-3 inline-flex items-center gap-1 rounded-full bg-black/50 text-white px-2 py-1 text-[12px] font-semibold">
                    <Play size={12} className="fill-white" />
                    Video
                  </div>
                )}

                <div className="absolute top-3 right-3 inline-flex items-center gap-1 rounded-full bg-amber-100 text-amber-900 px-2 py-1 text-[12px] font-semibold shadow">
                  <Star size={14} className="fill-amber-400 text-amber-400" />
                  {Number(preview.rating).toFixed(1)}
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900">
                  {preview.name}
                </h3>
                <p className={`mt-1 text-sm font-medium ${levelColor}`}>
                  {preview.title}
                </p>

                <p className="mt-3 text-slate-600 text-sm leading-relaxed line-clamp-3">
                  {preview.summary}
                </p>

                {preview.tags?.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {preview.tags.slice(0, 3).map((tag, i) => (
                      <span
                        key={`${tag}-${i}`}
                        className="inline-block rounded-full border border-teal-200 bg-teal-50 text-teal-700 px-2.5 py-1 text-[12px]"
                      >
                        {tag}
                      </span>
                    ))}
                    {preview.tags.length > 3 && (
                      <span className="inline-block rounded-full border border-gray-200 bg-gray-50 text-gray-600 px-2.5 py-1 text-[12px]">
                        +{preview.tags.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-sm text-slate-600">
                  <span className="inline-flex items-center gap-2">
                    <span className="size-2 rounded-full bg-emerald-500 inline-block" />
                    Available
                  </span>
                  <span className="text-teal-700 font-medium">
                    {preview.level} Level
                  </span>
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 text-white px-5 py-2.5 text-sm font-semibold opacity-80 cursor-default"
                  >
                    View Details <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              <span className="absolute pointer-events-none inset-0 ring-0 ring-[#02AAA0] rounded-[22px] opacity-0 group-hover:opacity-100 group-hover:ring-4 transition-all duration-300"></span>
            </article>
          </Card>
        </div>
      </div>
    </div>
  );
}
