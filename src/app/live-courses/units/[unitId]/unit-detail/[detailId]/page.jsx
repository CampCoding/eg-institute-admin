// app/courses/units/[unitId]/unit-detail/[detailId]/page.jsx
"use client";

import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Plus,
  BookOpen,
  Play,
  Edit2,
  Trash2,
  Eye,
  EyeClosed,
  Navigation2,
  BookCheck,
  Users,
  FileCheck,
  Clock,
  Video,
  FileText,
  HelpCircle,
  MoreVertical,
  ChevronRight,
  Loader2,
} from "lucide-react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import DeleteModal from "@/components/DeleteModal/DeleteModal";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import useGetAllUnitVideos from "@/utils/Api/Units/GetAllUnitVideos";
import useGetAllUnitPdfs from "@/utils/Api/Units/GetAllPdfs";
import { Toggle } from "@/utils/Api/Toggle";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import useDeleteContent from "@/utils/Api/Units/DeletePdf";
import useGetAllUnitQuizzes from "@/utils/Api/Units/GetAllQuizzesUnit";
import { Dropdown, Tooltip } from "antd";

const fmtMinutes = (mins = 0) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

// Tab Button Component
const TabButton = ({ active, onClick, icon: Icon, label, count }) => (
  <button
    type="button"
    onClick={onClick}
    className={`relative flex items-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-all ${
      active
        ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-lg shadow-teal-200"
        : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
    }`}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
    <span
      className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
        active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
      }`}
    >
      {count}
    </span>
  </button>
);

// Video Item Component
const VideoItem = ({ video, onEdit, onDelete, onView, onForceDelete }) => {
  const isHidden = video.hidden !== "0";

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg group ${
        isHidden ? "border-rose-200 bg-rose-50/30" : "border-gray-100"
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div className="relative w-full sm:w-48 h-32 sm:h-auto flex-shrink-0">
          {video.video_image ? (
            <img
              src={video.video_image}
              alt={video.video_title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Play className="w-10 h-10 text-white" fill="white" />
            </div>
          )}

          {isHidden && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-xs font-medium text-white bg-rose-500 px-3 py-1 rounded-full">
                Hidden
              </span>
            </div>
          )}

          {/* Duration Badge */}
          {video.duration && (
            <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {fmtMinutes(video.duration)}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
              {video.video_title || "Untitled Video"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Video ID: {video.video_player_id || "N/A"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <ActionButton
              icon={Navigation2}
              onClick={() => onView(video)}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100"
              title="View"
            />
            <ActionButton
              icon={Edit2}
              onClick={() => onEdit(video)}
              className="bg-amber-50 text-amber-600 hover:bg-amber-100"
              title="Edit"
            />
            <ActionButton
              icon={isHidden ? Eye : EyeClosed}
              onClick={() => onDelete(video)}
              className="bg-teal-50 text-teal-600 hover:bg-teal-100"
              title={isHidden ? "Show" : "Hide"}
            />
            <ActionButton
              icon={Trash2}
              onClick={() => onForceDelete(video)}
              className="bg-rose-50 text-rose-600 hover:bg-rose-100"
              title="Delete"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// PDF Item Component
const PdfItem = ({ pdf, onEdit, onDelete, onView, onForceDelete }) => {
  const isHidden = pdf.hidden !== "0";

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg group ${
        isHidden ? "border-rose-200 bg-rose-50/30" : "border-gray-100"
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Thumbnail */}
        <div className="relative w-full sm:w-48 h-32 sm:h-auto flex-shrink-0">
          {pdf.pdf_image ? (
            <img
              src={pdf.pdf_image}
              alt={pdf.pdf_title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
              <FileText className="w-10 h-10 text-white" />
            </div>
          )}

          {isHidden && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-xs font-medium text-white bg-rose-500 px-3 py-1 rounded-full">
                Hidden
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
              {pdf.pdf_title || "Untitled PDF"}
            </h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">
              {pdf.pdf_url || "No URL"}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
            <ActionButton
              icon={Eye}
              onClick={() => onView(pdf)}
              className="bg-blue-50 text-blue-600 hover:bg-blue-100"
              title="View"
            />
            <ActionButton
              icon={Edit2}
              onClick={() => onEdit(pdf)}
              className="bg-amber-50 text-amber-600 hover:bg-amber-100"
              title="Edit"
            />
            <ActionButton
              icon={isHidden ? Eye : EyeClosed}
              onClick={() => onDelete(pdf)}
              className="bg-teal-50 text-teal-600 hover:bg-teal-100"
              title={isHidden ? "Show" : "Hide"}
            />
            <ActionButton
              icon={Trash2}
              onClick={() => onForceDelete(pdf)}
              className="bg-rose-50 text-rose-600 hover:bg-rose-100"
              title="Delete"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Quiz Item Component with Solved Quizzes Button
const QuizItem = ({
  quiz,
  onEdit,
  onDelete,
  onView,
  onForceDelete,
  onViewSolved,
}) => {
  const isHidden = quiz.hidden !== "0";

  const menuItems = [
    {
      key: "view",
      label: "View Quiz",
      icon: <Eye className="w-4 h-4" />,
      onClick: () => onView(quiz),
    },
    {
      key: "solved",
      label: "View Solved Quizzes",
      icon: <FileCheck className="w-4 h-4" />,
      onClick: () => onViewSolved(quiz),
    },
    {
      key: "edit",
      label: "Edit Quiz",
      icon: <Edit2 className="w-4 h-4" />,
      onClick: () => onEdit(quiz),
    },
    {
      key: "toggle",
      label: isHidden ? "Show Quiz" : "Hide Quiz",
      icon: isHidden ? (
        <Eye className="w-4 h-4" />
      ) : (
        <EyeClosed className="w-4 h-4" />
      ),
      onClick: () => onDelete(quiz),
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      label: "Delete Quiz",
      icon: <Trash2 className="w-4 h-4" />,
      danger: true,
      onClick: () => onForceDelete(quiz),
    },
  ];

  return (
    <div
      className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-lg group ${
        isHidden ? "border-rose-200 bg-rose-50/30" : "border-gray-100"
      }`}
    >
      <div className="flex flex-col sm:flex-row">
        {/* Icon */}
        <div className="relative w-full sm:w-48 h-32 sm:h-auto flex-shrink-0">
          {quiz.quiz_image ? (
            <img
              src={quiz.quiz_image}
              alt={quiz.quiz_title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
              <HelpCircle className="w-10 h-10 text-white" />
            </div>
          )}

          {isHidden && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-xs font-medium text-white bg-rose-500 px-3 py-1 rounded-full">
                Hidden
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 p-4 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 text-lg line-clamp-1">
              {quiz.quiz_title || quiz.title || "Untitled Quiz"}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Quiz ID: {quiz.quiz_id}
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {/* View Solved Button - Always Visible */}
            <button
              onClick={() => onViewSolved(quiz)}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-purple-200 transition-all"
            >
              <FileCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Solved Quizzes</span>
            </button>

            {/* Other Actions */}
            <div className="flex items-center gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <ActionButton
                icon={Eye}
                onClick={() => onView(quiz)}
                className="bg-blue-50 text-blue-600 hover:bg-blue-100"
                title="View"
              />
              <ActionButton
                icon={Edit2}
                onClick={() => onEdit(quiz)}
                className="bg-amber-50 text-amber-600 hover:bg-amber-100"
                title="Edit"
              />
              <ActionButton
                icon={isHidden ? Eye : EyeClosed}
                onClick={() => onDelete(quiz)}
                className="bg-teal-50 text-teal-600 hover:bg-teal-100"
                title={isHidden ? "Show" : "Hide"}
              />
              <ActionButton
                icon={Trash2}
                onClick={() => onForceDelete(quiz)}
                className="bg-rose-50 text-rose-600 hover:bg-rose-100"
                title="Delete"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Action Button Component
const ActionButton = ({ icon: Icon, onClick, className, title }) => (
  <Tooltip title={title}>
    <button
      type="button"
      onClick={onClick}
      className={`p-2.5 rounded-xl transition-all hover:scale-105 ${className}`}
    >
      <Icon className="w-4 h-4" />
    </button>
  </Tooltip>
);

// Empty State Component
const EmptyState = ({ icon: Icon, title, description, onAdd, addLabel }) => (
  <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
      <Icon className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="text-gray-500 mt-1">{description}</p>
    <button
      type="button"
      onClick={onAdd}
      className="mt-4 inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
    >
      <Plus className="w-4 h-4" />
      {addLabel}
    </button>
  </div>
);

export default function UnitDetailPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { unitId, detailId } = useParams();

  const { unit: unitData } = useSelector((state) => state.Units);

  const [activeTab, setActiveTab] = useState("videos");
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState("pdf");
  const [rowData, setRowData] = useState(null);

  const { data: VideoData, isLoading: isVideoLoading } = useGetAllUnitVideos({
    detailId,
  });
  const { data: PdfData, isLoading: isPdfLoading } = useGetAllUnitPdfs({
    detailId,
  });
  const { data: QuizData, isLoading: isQuizLoading } = useGetAllUnitQuizzes({
    detailId,
    type: "Unit",
  });

  const { mutateAsync, isPending } = useDeleteContent({
    queryKey:
      activeTab === "videos"
        ? "unitVideos"
        : activeTab === "pdfs"
          ? "unitPdfs"
          : "unitquizs",
  });

  const handleAddNew = () => {
    if (activeTab === "videos")
      router.push(`/courses/units/${detailId}/add-video`);
    else if (activeTab === "pdfs")
      router.push(`/courses/units/${detailId}/add-pdf`);
    else router.push(`/courses/units/${detailId}/add-quiz`);
  };

  const handleView = (item) => {
    if (activeTab === "pdfs") window.open(item.pdf_url, "_blank");
    else if (activeTab === "videos") window.open(item.video_url, "_blank");
    else window.open(item.quiz_url, "_blank");
  };

  const handleEdit = (item) => {
    if (activeTab === "pdfs") {
      localStorage.setItem("pdf", JSON.stringify(item));
      router.push(`/courses/units/${unitId}/edit-pdf/${item?.pdf_id}`);
    } else if (activeTab === "videos") {
      localStorage.setItem("video", JSON.stringify(item));
      router.push(`/courses/units/${unitId}/edit-video/${item?.video_id}`);
    } else {
      localStorage.setItem("quiz", JSON.stringify(item));
      router.push(`/courses/units/${detailId}/edit-quiz`);
    }
  };

  // ✅ Navigate to Solved Quizzes Page
  const handleViewSolvedQuizzes = (quiz) => {
    router.push(
      `/courses/units/${unitId}/unit-detail/${detailId}/solved-quizzes/${quiz.quiz_id}`
    );
  };

  const handleToggle = async (item) => {
    try {
      let response;
      if (activeTab === "pdfs") {
        response = await Toggle({
          payload: { pdf_id: item.pdf_id },
          url: "units/content/pdfs/toggle_show_pdf.php",
          key: ["unitPdfs", "Unit", detailId],
          queryClient,
        });
      } else if (activeTab === "videos") {
        response = await Toggle({
          payload: { video_id: item.video_id },
          url: "units/content/videos/toggle_show_hide.php",
          key: "unitVideos",
          queryClient,
        });
      } else {
        response = await Toggle({
          payload: { quiz_id: String(item?.quiz_id) },
          url: "units/content/quiz/toggle_show_quiz.php",
          key: "unitquizs",
          queryClient,
        });
      }

      if (response.status === "success") {
        toast.success(response.message);
        queryClient.invalidateQueries([
          activeTab === "videos"
            ? "unitVideos"
            : activeTab === "pdfs"
              ? "unitPdfs"
              : "unitquizs",
        ]);
      } else {
        toast.error(response.message);
      }
    } catch (e) {
      toast.error("Something went wrong");
    }
  };

  const handleForceDeleteOpen = (item) => {
    setRowData(item);
    setDeleteType(
      activeTab === "videos" ? "video" : activeTab === "pdfs" ? "pdf" : "quiz"
    );
    setOpenDeleteModal(true);
  };

  const handleForceDeleteConfirm = async () => {
    if (!rowData) return;

    const id =
      deleteType === "video"
        ? rowData.video_id
        : deleteType === "pdf"
          ? rowData.pdf_id
          : rowData.quiz_id;

    try {
      const res = await mutateAsync({ id, type: deleteType });
      if (res?.status === "success") {
        toast.success(res.message || "Deleted successfully");
        setOpenDeleteModal(false);
        setRowData(null);
      } else {
        toast.error(res?.message || "Delete failed");
      }
    } catch (e) {
      toast.error("Delete failed");
    }
  };

  if (isVideoLoading || isPdfLoading || isQuizLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading content...</p>
        </div>
      </div>
    );
  }

  const videos = VideoData?.message ?? [];
  const pdfs = PdfData?.message ?? [];
  const quizzes = QuizData?.message ?? [];

  return (
    <div className="min-h-screen pb-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back</span>
          </button>

          <button
            onClick={handleAddNew}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-teal-200 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>
              Add{" "}
              {activeTab === "videos"
                ? "Video"
                : activeTab === "pdfs"
                  ? "PDF"
                  : "Quiz"}
            </span>
          </button>
        </div>

        <BreadCrumb
          title="Unit Details"
          parent="Courses"
          child="Unit Content"
        />

        {/* Stats Cards */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Video className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {videos.length}
              </p>
              <p className="text-sm text-gray-500">Videos</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center">
              <FileText className="w-6 h-6 text-rose-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pdfs.length}</p>
              <p className="text-sm text-gray-500">PDFs</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <HelpCircle className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {quizzes.length}
              </p>
              <p className="text-sm text-gray-500">Quizzes</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-3 justify-center mt-8 mb-8">
          <TabButton
            active={activeTab === "videos"}
            onClick={() => setActiveTab("videos")}
            icon={Play}
            label="Videos"
            count={videos.length}
          />
          <TabButton
            active={activeTab === "pdfs"}
            onClick={() => setActiveTab("pdfs")}
            icon={BookOpen}
            label="PDFs"
            count={pdfs.length}
          />
          <TabButton
            active={activeTab === "quizzes"}
            onClick={() => setActiveTab("quizzes")}
            icon={BookCheck}
            label="Quizzes"
            count={quizzes.length}
          />
        </div>

        {/* Content */}
        <div className="space-y-4">
          {activeTab === "videos" && (
            <>
              {videos.length > 0 ? (
                videos.map((video) => (
                  <VideoItem
                    key={video.video_id}
                    video={video}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleToggle}
                    onForceDelete={handleForceDeleteOpen}
                  />
                ))
              ) : (
                <EmptyState
                  icon={Play}
                  title="No videos yet"
                  description="Add your first video to this unit"
                  onAdd={handleAddNew}
                  addLabel="Add your first video"
                />
              )}
            </>
          )}

          {activeTab === "pdfs" && (
            <>
              {pdfs.length > 0 ? (
                pdfs.map((pdf) => (
                  <PdfItem
                    key={pdf.pdf_id}
                    pdf={pdf}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleToggle}
                    onForceDelete={handleForceDeleteOpen}
                  />
                ))
              ) : (
                <EmptyState
                  icon={BookOpen}
                  title="No PDFs yet"
                  description="Add your first PDF to this unit"
                  onAdd={handleAddNew}
                  addLabel="Add your first PDF"
                />
              )}
            </>
          )}

          {activeTab === "quizzes" && (
            <>
              {quizzes.length > 0 ? (
                quizzes.map((quiz) => (
                  <QuizItem
                    key={quiz.quiz_id}
                    quiz={quiz}
                    onView={handleView}
                    onEdit={handleEdit}
                    onDelete={handleToggle}
                    onForceDelete={handleForceDeleteOpen}
                    onViewSolved={handleViewSolvedQuizzes}
                  />
                ))
              ) : (
                <EmptyState
                  icon={BookCheck}
                  title="No quizzes yet"
                  description="Add your first quiz to this unit"
                  onAdd={handleAddNew}
                  addLabel="Add your first quiz"
                />
              )}
            </>
          )}
        </div>
      </div>

      <DeleteModal
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        title={`Delete this ${deleteType}?`}
        description={
          deleteType === "video"
            ? rowData?.video_title
            : deleteType === "pdf"
              ? rowData?.pdf_title
              : rowData?.quiz_title
        }
        handleSubmit={handleForceDeleteConfirm}
        loading={isPending}
      />
    </div>
  );
}
