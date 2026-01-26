"use client";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import {
  ArrowLeft,
  Loader2,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Clock,
  Star,
  Users,
  BookOpen,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setTeacher } from "../../../../utils/Store/TeacherSlice";
import axios from "axios";
import { BASE_URL } from "../../../../utils/base_url";
import { message } from "antd";

export default function InstructorProfile() {
  const router = useRouter();
  const { id } = useParams();
  const dispatch = useDispatch();

  const [teacher, setTeacherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get token from localStorage
  const token =
    typeof window !== "undefined"
      ? localStorage.getItem("AccessToken") || localStorage.getItem("token")
      : null;

  // Fetch teacher data
  useEffect(() => {
    const fetchTeacher = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        if (!token) {
          throw new Error(
            "Authentication token not found. Please login again."
          );
        }

        const response = await axios.post(
          `${BASE_URL}/teachers/select_teacher_profile.php`,
          {
            teacher_id: id,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        console.log("API Response:", response.data);

        if (response.data && response.data.status === "success") {
          setTeacherData(response.data.message);
        } else {
          throw new Error(
            response.data?.message || "Failed to load teacher data"
          );
        }
      } catch (error) {
        console.error("Error fetching teacher:", error);

        if (error.response) {
          setError(
            `Server error: ${error.response.status} - ${error.response.data?.message || "Unknown error"}`
          );
        } else if (error.request) {
          setError(
            "Network error: Unable to connect to server. Please check your internet connection."
          );
        } else {
          setError(error.message || "An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTeacher();
  }, [id, token]);

  // Transform API data to component format
  const transformedData = teacher
    ? {
        id: teacher.teacher_id,
        name: teacher.teacher_name,
        email: teacher.teacher_email,
        phone: teacher.phone,
        hourlyRate: teacher.hourly_rate,
        specialties: teacher.specialization,
        bio: teacher.bio,
        tags: teacher.tags
          ? teacher.tags
              .split(",")
              .map((tag) => tag.trim())
              .filter(Boolean)
          : [],
        level: teacher.level
          ? teacher.level.charAt(0).toUpperCase() + teacher.level.slice(1)
          : "Beginner",
        timezone: teacher.time_zone,
        country: teacher.country,
        avatar:
          teacher.teacher_image ||
          "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=1400&auto=format&fit=crop",
        status: teacher.hidden === "0" ? "Active" : "Inactive",
        role: `${teacher.specialization} Instructor`,
        languages: teacher.languages || [],
        rating: parseFloat(teacher.rate) || 0,
        satisfaction: 96, // Default value as not provided by API
        studentsCount: parseInt(teacher.student_count) || 0,
        classesCount: parseInt(teacher.class_count) || 0,
        lessonsTaught: parseInt(teacher.class_count) * 10 || 0, // Estimated
        attendance: 98, // Default value
        availability: teacher.teacher_slots || [],
        courses: teacher.teacher_courses || [],
        createdAt: teacher.created_at,
      }
    : null;

  // Helper to capitalize strings
  const capitalize = (s) =>
    typeof s === "string" && s.length
      ? s.charAt(0).toUpperCase() + s.slice(1)
      : "";

  // Transform data for edit form
  const teacherFromApiToForm = transformedData
    ? {
        name: transformedData.name || "",
        email: transformedData.email || "",
        phone: transformedData.phone || "",
        title: transformedData.specialties || "",
        summary: transformedData.bio || "",
        photo: transformedData.avatar || "",
        country: transformedData.country || "",
        TimeZone: transformedData.timezone || "Africa/Cairo",
        hourly_rate: transformedData.hourlyRate || "",
        level: transformedData.level || "Expert",
        tags: transformedData.tags || [],
        Languages: transformedData.languages || [],
        teacher_slots:
          transformedData.availability.map((slot) => ({
            day: slot.day,
            slots_from: slot.slots_from,
            slots_to: slot.slots_to,
          })) || [],
      }
    : null;

  const Pill = ({ children, tone = "default" }) => {
    const tones = {
      default: "bg-gray-100 text-gray-700 border border-gray-200",
      success: "bg-[#02AAA0]/10 text-[#047a73] border border-[#02AAA0]/20",
      info: "bg-blue-50 text-blue-700 border border-blue-100",
      warning: "bg-amber-50 text-amber-700 border border-amber-100",
    };
    return (
      <span
        className={`px-2.5 py-1 rounded-full text-xs font-medium ${tones[tone]}`}
      >
        {children}
      </span>
    );
  };

  const Progress = ({ value }) => (
    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${Math.min(100, Math.max(0, value))}%`,
          backgroundColor: "#02AAA0",
        }}
      />
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen">
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

        <BreadCrumb title="Teacher Profile" parent="Users" child="Loading..." />

        <div className="mt-5 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-[#02AAA0]" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Loading Teacher Profile
            </h3>
            <p className="text-gray-600">
              Please wait while we fetch the teacher information...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen">
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

        <BreadCrumb title="Teacher Profile" parent="Users" child="Error" />

        <div className="mt-5 flex items-center justify-center min-h-[400px]">
          <div className="text-center max-w-md mx-auto">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Error Loading Teacher
            </h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-[#02AAA0] text-white px-6 py-3 rounded-lg hover:bg-[#029a92] transition-colors duration-200 font-medium"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/teachers")}
                className="w-full bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 transition-colors duration-200 font-medium"
              >
                Back to Teachers
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No teacher data
  if (!transformedData) {
    return (
      <div className="min-h-screen">
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

        <BreadCrumb title="Teacher Profile" parent="Users" child="Not Found" />

        <div className="mt-5 flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Teacher Not Found
            </h3>
            <p className="text-gray-600 mb-6">
              The requested teacher profile could not be found.
            </p>
            <button
              onClick={() => router.push("/teachers")}
              className="bg-[#02AAA0] text-white px-6 py-3 rounded-lg hover:bg-[#029a92] transition-colors duration-200 font-medium"
            >
              Back to Teachers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
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

      <BreadCrumb
        title={`${transformedData.name} Profile`}
        parent="Users"
        child="Teacher Profile"
      />

      <div className="mt-5">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <img
              src={transformedData.avatar}
              alt={transformedData.name}
              className="w-24 h-24 rounded-2xl object-cover ring-4 ring-white shadow-md"
              onError={(e) => {
                e.target.src =
                  "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?q=80&w=1400&auto=format&fit=crop";
              }}
            />
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-semibold text-gray-900">
                  {transformedData.name}
                </h1>
                <Pill
                  tone={
                    transformedData.status === "Active" ? "success" : "warning"
                  }
                >
                  {transformedData.status}
                </Pill>
                <Pill>ID: {transformedData.id}</Pill>
              </div>
              <p className="text-gray-500 mt-1">{transformedData.role}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="text-sm text-gray-600">Level:</span>
                <Pill tone="info">{transformedData.level}</Pill>
                {transformedData.rating > 0 && (
                  <>
                    <span className="text-gray-300">•</span>
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">
                        {transformedData.rating}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Tags */}
              {transformedData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {transformedData.tags.slice(0, 3).map((tag, index) => (
                    <Pill key={index}>{tag}</Pill>
                  ))}
                  {transformedData.tags.length > 3 && (
                    <Pill>+{transformedData.tags.length - 3} more</Pill>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  router.push(`/teachers/schedule/${transformedData.id}`)
                }
                className="px-4 py-2 rounded-xl text-white bg-[#02AAA0] hover:bg-[#029a92] transition-colors duration-200"
              >
                Schedule
              </button>
              <button
                onClick={() => {
                  dispatch(setTeacher(teacherFromApiToForm));
                  router.push(`/teachers/edit/${transformedData.id}`);
                }}
                className="px-4 py-2 rounded-xl text-white bg-[#02AAA0] hover:bg-[#029a92] transition-colors duration-200"
              >
                Edit Profile
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-gray-500" />
                <div className="text-xs text-gray-500">Students</div>
              </div>
              <div className="text-xl font-semibold text-gray-900">
                {transformedData.studentsCount}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-gray-500" />
                <div className="text-xs text-gray-500">Classes</div>
              </div>
              <div className="text-xl font-semibold text-gray-900">
                {transformedData.classesCount}
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-4 h-4 text-gray-500" />
                <div className="text-xs text-gray-500">Satisfaction</div>
              </div>
              <div className="text-xl font-semibold text-gray-900">
                {transformedData.satisfaction}%
              </div>
              <div className="mt-2">
                <Progress value={transformedData.satisfaction} />
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <div className="text-xs text-gray-500">Rate</div>
              </div>
              <div className="text-xl font-semibold text-gray-900">
                ${transformedData.hourlyRate}/hr
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left */}
          <div className="lg:col-span-2 space-y-6">
            {/* Courses taught */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Courses ({transformedData.courses.length})
                </h2>
                <button
                  onClick={() => router.push(`/courses/add`)}
                  className="text-sm text-gray-600 hover:text-[#02AAA0] transition-colors duration-200"
                >
                  Create new course
                </button>
              </div>

              {transformedData.courses.length > 0 ? (
                <div className="space-y-4">
                  {transformedData.courses.map((course) => (
                    <div
                      key={course.course_id}
                      className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors duration-200"
                    >
                      <div className="flex items-start gap-4">
                        {course.image && (
                          <img
                            src={course.image}
                            alt={course.course_name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">
                            {course.course_name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {course.course_descreption}
                          </p>
                          <div className="flex items-center gap-3 mt-2">
                            <Pill tone="info">Level: {course.level}</Pill>
                            <Pill>Duration: {course.Duration}</Pill>
                            <Pill>{course.lessons} lessons</Pill>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="text-gray-600">
                              Group:{" "}
                              <span className="font-medium text-gray-900">
                                ${course.group_price}
                              </span>
                            </span>
                            <span className="text-gray-600">
                              Private:{" "}
                              <span className="font-medium text-gray-900">
                                ${course.private_price}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No courses assigned yet</p>
                </div>
              )}
            </div>

            {/* Bio & Notes */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                About
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {transformedData.bio || "No bio information provided."}
              </p>
            </div>
          </div>

          {/* Right */}
          <div className="space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <a
                      className="text-gray-900 hover:text-[#02AAA0] transition-colors duration-200"
                      href={`mailto:${transformedData.email}`}
                    >
                      {transformedData.email}
                    </a>
                  </div>
                </div>

                {transformedData.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <a
                        className="text-gray-900 hover:text-[#02AAA0] transition-colors duration-200"
                        href={`tel:${transformedData.phone}`}
                      >
                        {transformedData.phone}
                      </a>
                    </div>
                  </div>
                )}

                {transformedData.country && (
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-500">Country</p>
                      <span className="text-gray-900">
                        {transformedData.country}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {transformedData.languages.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="text-sm text-gray-500 mb-3">Languages</div>
                  <div className="flex flex-wrap gap-2">
                    {transformedData.languages.map((lang, index) => (
                      <Pill key={index}>{lang}</Pill>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Availability */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Weekly Availability
              </h2>

              {transformedData.availability.length > 0 ? (
                <div className="space-y-3">
                  {transformedData.availability.map((slot, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium text-gray-900">
                        {slot.day}
                      </span>
                      <div className="text-sm text-gray-600">
                        {slot.slots_from?.slice(0, 5)} -{" "}
                        {slot.slots_to?.slice(0, 5)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No availability schedule set</p>
                </div>
              )}
            </div>

            {/* Account Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Account Details
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Joined</span>
                  <span className="text-gray-900">
                    {transformedData.createdAt
                      ? new Date(transformedData.createdAt).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Timezone</span>
                  <span className="text-gray-900">
                    {transformedData.timezone || "Not specified"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <Pill
                    tone={
                      transformedData.status === "Active"
                        ? "success"
                        : "warning"
                    }
                  >
                    {transformedData.status}
                  </Pill>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
