"use client";
import React, { useState, useEffect, useRef } from "react";
import { Card, Form, Input, Button, Select, Upload, Spin } from "antd";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PlusOutlined, LoadingOutlined } from "@ant-design/icons";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { timezoneOptions } from "../../../../utils/timeZone";
import axios from "axios";
import { BASE_URL } from "@/utils/base_url";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import "./style.css";

const { Option } = Select;

// ✅ Image Upload URL
const IMAGE_UPLOAD_URL =
  "https://camp-coding.tech/eg_Institute/image_uplouder.php";

// ✅ Arabic Learning Levels
const arabicLevelOptions = [
  { value: "complete_beginner", label: "Complete Beginner - لا أعرف شيء" },
  { value: "beginner", label: "Beginner - مبتدئ" },
  { value: "elementary", label: "Elementary - أساسي" },
  { value: "intermediate", label: "Intermediate - متوسط" },
  { value: "upper_intermediate", label: "Upper Intermediate - فوق المتوسط" },
  { value: "advanced", label: "Advanced - متقدم" },
  { value: "fluent", label: "Fluent / Native - طليق" },
];

// ✅ Gender Options
const genderOptions = [
  { value: "male", label: "Male - ذكر" },
  { value: "female", label: "Female - أنثى" },
];

// ✅ Yup schema (password optional for edit)
const schema = yup.object({
  name: yup.string().trim().required("Please enter the student name"),
  email: yup
    .string()
    .trim()
    .email("Please enter a valid email")
    .required("Please enter the email address"),
  password: yup.string().optional(),
  phone: yup
    .string()
    .trim()
    .required("Please enter the phone number")
    .min(8, "Please enter a valid phone number"),
  country: yup.string().trim().required("Please enter the country"),
  time_zone: yup.string().required("Please select the timezone"),
  expectation_level: yup
    .string()
    .required("Please select the expectation level"),
  gender: yup.string().required("Please select gender"),
});

export default function EditStudentPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params?.id;

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      country: "",
      time_zone: undefined,
      expectation_level: undefined,
      gender: undefined,
    },
    mode: "onTouched",
  });

  const [pageLoading, setPageLoading] = useState(true);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [existingImageUrl, setExistingImageUrl] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [studentData, setStudentData] = useState(null);

  // Track previous country code to detect country change
  const previousCountryCode = useRef("");
  const isInitialLoad = useRef(true);

  // Watch phone value for PhoneInput
  const phoneValue = watch("phone");

  // Fetch student data on mount
  useEffect(() => {
    const fetchStudentData = async () => {
      const token = localStorage.getItem("AccessToken");
      setPageLoading(true);

      try {
        const response = await axios.post(
          `${BASE_URL}/students/select_students.php`,
          {
            student_id: studentId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("Students response:", response.data);

        if (response?.data?.status === "success") {
          const student =
            response?.data?.message[0] || response?.data?.data || [];

          if (student) {
            setStudentData(student);

            // Set form values
            setValue("name", student.name || student.student_name || "");
            setValue("email", student.email || student.student_email || "");
            setValue("phone", student.phone || "");
            setValue("country", student.country || "");
            setValue(
              "time_zone",
              student.time_zone || student.timezone || undefined
            );
            setValue(
              "expectation_level",
              student.expectation_level || undefined
            );
            setValue("gender", student.gender || undefined);

            // Set existing image
            if (student.image) {
              setExistingImageUrl(student.image);
              setImagePreview(student.image);
            }

            // Mark initial load complete
            isInitialLoad.current = false;
          } else {
            toast.error("Student not found");
            router.push("/students");
          }
        } else {
          toast.error("Failed to fetch student data");
        }
      } catch (error) {
        console.error("Error fetching student:", error);
        toast.error("Failed to load student data");
      } finally {
        setPageLoading(false);
      }
    };

    if (studentId) {
      fetchStudentData();
    }
  }, [studentId, setValue, router]);

  // Handle phone change with auto-fill country
  const handlePhoneChange = (value, countryData) => {
    // Skip auto-fill during initial load
    if (isInitialLoad.current) {
      setValue("phone", "+" + value, { shouldValidate: true });
      return;
    }

    const newCountryCode = countryData?.countryCode || "";
    const countryChanged = newCountryCode !== previousCountryCode.current;

    // Update phone value
    setValue("phone", "+" + value, { shouldValidate: true });

    // Update country when country code changes
    if (countryChanged && countryData?.name) {
      setValue("country", countryData.name, { shouldValidate: true });
    }

    // Update the previous country code
    previousCountryCode.current = newCountryCode;
  };

  // Handle image selection and preview
  const handleImageChange = (info) => {
    const file = info.file.originFileObj || info.file;

    if (file instanceof File) {
      setImageFile(file);
      setExistingImageUrl(null);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  // Cleanup preview URL
  const clearImage = () => {
    if (imagePreview && !existingImageUrl) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview(null);
    setExistingImageUrl(null);
  };

  // Restore original image
  const restoreOriginalImage = () => {
    if (imagePreview && !existingImageUrl) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    if (studentData?.image) {
      setExistingImageUrl(studentData.image);
      setImagePreview(studentData.image);
    } else {
      setImagePreview(null);
      setExistingImageUrl(null);
    }
  };

  const beforeUpload = (file) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      toast.error("You can only upload image files!");
      return Upload.LIST_IGNORE;
    }
    return false;
  };

  // Upload image to server
  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append("image", file);

    try {
      setImageUploading(true);
      const response = await axios.post(IMAGE_UPLOAD_URL, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        return response.data;
      }
      throw new Error("Failed to get image URL from response");
    } catch (error) {
      console.error("Image upload error:", error);
      throw error;
    } finally {
      setImageUploading(false);
    }
  };

  const onSubmit = async (values) => {
    const token = localStorage.getItem("AccessToken");
    setUpdateLoading(true);

    try {
      let imageUrl = existingImageUrl || "";

      if (imageFile && imageFile instanceof File) {
        try {
          imageUrl = await uploadImage(imageFile);
          console.log("Uploaded image URL:", imageUrl);
        } catch (error) {
          toast.error("Failed to upload image. Please try again.");
          setUpdateLoading(false);
          return;
        }
      }

      const payload = {
        student_id: studentId,
        name: values.name,
        email: values.email,
        phone: values.phone,
        image: imageUrl,
        country: values.country,
        time_zone: values.time_zone,
        gender: values.gender,
        expectation_level: values.expectation_level,
      };

      if (values.password && values.password.trim() !== "") {
        payload.password = values.password;
      }

      console.log("Update Student Payload:", payload);

      const response = await axios.post(
        BASE_URL + "/students/update_student.php",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Response:", response);

      if (response?.data?.status === "success") {
        toast.success(
          response?.data?.message || "Student updated successfully!"
        );
        router.push("/students");
      } else {
        toast.error(response?.data?.message || "Failed to update student");
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Something went wrong!");
    } finally {
      setUpdateLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {imageUploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>
        {imageUploading ? "Uploading..." : "Upload Photo"}
      </div>
    </div>
  );

  // Loading state
  if (pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <BreadCrumb title="Edit Student" parent="Students" child="Edit" />

      <Card className="!mt-5 !mb-5 !bg-transparent !border-0">
        <Form
          layout="vertical"
          onFinish={handleSubmit(onSubmit)}
          autoComplete="off"
        >
          {/* Image Upload */}
          <Form.Item label="Profile Photo">
            <Upload
              listType="picture-card"
              showUploadList={false}
              onChange={handleImageChange}
              beforeUpload={beforeUpload}
              accept="image/*"
              disabled={imageUploading}
            >
              {imagePreview ? (
                <div className="relative w-full h-full">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-full object-cover rounded-lg"
                  />
                  {imageUploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                      <LoadingOutlined className="text-white text-2xl" />
                    </div>
                  )}
                </div>
              ) : (
                uploadButton
              )}
            </Upload>
            <div className="flex gap-2 mt-2">
              {imagePreview && (
                <Button type="link" danger onClick={clearImage} className="p-0">
                  Remove Image
                </Button>
              )}
              {imageFile && studentData?.image && (
                <Button
                  type="link"
                  onClick={restoreOriginalImage}
                  className="p-0"
                >
                  Restore Original
                </Button>
              )}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              Supported formats: JPG, PNG, GIF
            </div>
          </Form.Item>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Name */}
            <Form.Item
              label="Full Name"
              validateStatus={errors.name ? "error" : ""}
              help={errors.name?.message}
            >
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Enter student full name" />
                )}
              />
            </Form.Item>

            {/* Email */}
            <Form.Item
              label="Email Address"
              validateStatus={errors.email ? "error" : ""}
              help={errors.email?.message}
            >
              <Controller
                name="email"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Enter student email" />
                )}
              />
            </Form.Item>

            {/* Password */}
            <Form.Item
              label="Password (Leave empty to keep current)"
              validateStatus={errors.password ? "error" : ""}
              help={errors.password?.message}
            >
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <Input.Password
                    {...field}
                    placeholder="Enter new password (optional)"
                  />
                )}
              />
            </Form.Item>

            {/* Phone - react-phone-input-2 */}
            <Form.Item
              label="Phone Number"
              validateStatus={errors.phone ? "error" : ""}
              help={errors.phone?.message}
            >
              <div
                className={`phone-input-container ${errors.phone ? "error" : ""}`}
              >
                <PhoneInput
                  country="eg"
                  value={phoneValue?.replace("+", "") || ""}
                  onChange={handlePhoneChange}
                  enableSearch
                  searchPlaceholder="Search country..."
                  inputProps={{
                    name: "phone",
                    required: true,
                  }}
                />
              </div>
            </Form.Item>

            {/* Gender */}
            <Form.Item
              label="Gender"
              validateStatus={errors.gender ? "error" : ""}
              help={errors.gender?.message}
            >
              <Controller
                name="gender"
                control={control}
                render={({ field }) => (
                  <Select {...field} placeholder="Select gender">
                    {genderOptions.map((option) => (
                      <Option key={option.value} value={option.value}>
                        {option.label}
                      </Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>

            {/* Country */}
            <Form.Item
              label="Country"
              validateStatus={errors.country ? "error" : ""}
              help={errors.country?.message}
            >
              <Controller
                name="country"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Enter country (e.g., Egypt, USA, UK)"
                  />
                )}
              />
            </Form.Item>

            {/* Timezone */}
            <Form.Item
              label="Timezone"
              validateStatus={errors.time_zone ? "error" : ""}
              help={errors.time_zone?.message}
            >
              <Controller
                name="time_zone"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select timezone"
                    showSearch
                    filterOption={(input, option) =>
                      (option?.children ?? "")
                        .toString()
                        .toLowerCase()
                        .includes(input.toLowerCase())
                    }
                  >
                    {timezoneOptions.map((tz) => (
                      <Option key={tz.value} value={tz.value}>
                        {tz.label}
                      </Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>

            {/* Expectation Level */}
            <Form.Item
              label="Arabic Level (Expectation)"
              validateStatus={errors.expectation_level ? "error" : ""}
              help={errors.expectation_level?.message}
            >
              <Controller
                name="expectation_level"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    placeholder="Select your current Arabic level"
                  >
                    {arabicLevelOptions.map((level) => (
                      <Option key={level.value} value={level.value}>
                        {level.label}
                      </Option>
                    ))}
                  </Select>
                )}
              />
            </Form.Item>
          </div>

          {/* Submit */}
          <Form.Item className="text-right mt-6">
            <Button
              type="default"
              onClick={() => router.push("/students")}
              className="mr-3"
              disabled={updateLoading}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateLoading}
              disabled={imageUploading}
              className="!bg-[#02AAA0] hover:!bg-[#029a92]"
            >
              {updateLoading ? "Updating Student..." : "Update Student"}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
