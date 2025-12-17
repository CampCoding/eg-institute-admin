"use client";

import React, { useState } from "react";
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
import useGetAllUnitQuizzes from "@/utils/Api/Units/GetAllQuizzesUnit";
import useDeleteContent from "@/utils/Api/Units/DeletePdf"; // hook اللي فوق

const fmtMinutes = (mins = 0) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

const ActionButton = ({ icon: Icon, onClick, className, title }) => (
  <button
    type="button"
    onClick={onClick}
    className={`p-2 rounded-lg transition-all hover:scale-105 ${className}`}
    title={title}
  >
    <Icon size={16} />
  </button>
);

const VideoItem = ({ video, onEdit, onDelete, onView, onForceDelete }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-br from-teal-500 to-teal-800 p-3 rounded-xl shadow-lg">
            {video.video_image ? (
              <div className="relative">
                <div
                  className={`!bg-rose-300 mx-1 absolute ${
                    video.hidden !== "0" ? "flex" : "hidden"
                  } py-1 px-2 !rounded-lg !text-white justify-center items-center text-sm font-medium`}
                >
                  Hidden
                </div>
                <img
                  src={video.video_image}
                  alt={video.video_title}
                  className="object-cover max-h-[150px] max-w-[100px] h-[100px] rounded-xl"
                />
              </div>
            ) : (
              <Play className="text-white" size={24} />
            )}
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">
              {video.video_title || "Untitled Video"}
            </h3>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Play size={14} />
                Duration: {fmtMinutes(video.duration)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <ActionButton
            icon={Navigation2}
            onClick={() => onView(video)}
            className="bg-blue-50 text-blue-600 hover:bg-blue-100"
            title="View Video"
          />
          <ActionButton
            icon={Edit2}
            onClick={() => onEdit(video)}
            className="bg-amber-50 text-amber-600 hover:bg-amber-100"
            title="Edit Video"
          />
          <ActionButton
            onClick={() => onDelete(video)}
            icon={video.hidden === "0" ? Eye : EyeClosed}
            className="bg-teal-50 text-(--primary-color) hover:bg-teal-100"
            title={`${video.hidden === "0" ? "Hide" : "Show"} Video`}
          />
          <ActionButton
            icon={Trash2}
            onClick={() => onForceDelete(video)}
            className="bg-red-50 text-red-600 hover:bg-red-100"
            title="Delete Video"
          />
        </div>
      </div>
    </div>
  );
};

const PdfItem = ({ pdf, onEdit, onDelete, onView, onForceDelete }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 group">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-3 rounded-xl shadow-lg">
          {pdf.pdf_image ? (
            <div className="relative">
              <div
                className={`!bg-rose-300 mx-1 absolute ${
                  pdf.hidden !== "0" ? "flex" : "hidden"
                } py-1 px-2 !rounded-lg !text-white justify-center items-center text-sm font-medium`}
              >
                Hidden
              </div>
              <img
                src={pdf.pdf_image}
                alt={pdf.pdf_title}
                className="object-cover max-h-[150px] max-w-[100px] h-[100px] rounded-xl"
              />
            </div>
          ) : (
            <BookOpen className="text-white" size={24} />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">
            {pdf.pdf_title || "Untitled PDF"}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ActionButton
          icon={Eye}
          onClick={() => onView(pdf)}
          className="bg-blue-50 text-blue-600 hover:bg-blue-100"
          title="View PDF"
        />
        <ActionButton
          icon={Edit2}
          onClick={() => onEdit(pdf)}
          className="bg-amber-50 text-amber-600 hover:bg-amber-100"
          title="Edit PDF"
        />
        <ActionButton
          onClick={() => onDelete(pdf)}
          icon={pdf.hidden === "0" ? Eye : EyeClosed}
          className="bg-teal-50 text-(--primary-color) hover:bg-teal-100"
          title={`${pdf.hidden === "0" ? "Hide" : "Show"} PDF`}
        />
        <ActionButton
          icon={Trash2}
          onClick={() => onForceDelete(pdf)}
          className="bg-red-50 text-red-600 hover:bg-red-100"
          title="Delete PDF"
        />
      </div>
    </div>
  </div>
);

const QuizItem = ({ quiz, onEdit, onDelete, onView, onForceDelete }) => (
  <div className="bg-white rounded-xl relative shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 group">
    <div
      className={`absolute ${
        quiz.hidden !== "0" ? "flex" : "hidden"
      } mx-2 mt-1 bg-rose-400 top-[25%] right-[45%] !rounded-2xl !-translate-x-0`}
    >
      <span className="px-2 py-1 text-white text-sm font-medium">
        {quiz.hidden === "0" ? null : "Hidden"}
      </span>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-3 rounded-xl shadow-lg">
          {quiz.quiz_image ? (
            <div className="relative">
              <div
                className={`!bg-rose-300 mx-1 absolute ${
                  quiz.hidden !== "0" ? "flex" : "hidden"
                } py-1 px-2 !rounded-lg !text-white justify-center items-center text-sm font-medium`}
              >
                Hidden
              </div>
              <img
                src={quiz.quiz_image}
                alt={quiz.quiz_title}
                className="object-cover max-h-[150px] max-w-[100px] h-[100px] rounded-xl"
              />
            </div>
          ) : (
            <BookCheck className="text-white" size={24} />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">
            {quiz.quiz_title || quiz.title || "Untitled Quiz"}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ActionButton
          icon={Eye}
          onClick={() => onView(quiz)}
          className="bg-blue-50 text-blue-600 hover:bg-blue-100"
          title="View Quiz"
        />
        <ActionButton
          icon={Edit2}
          onClick={() => onEdit(quiz)}
          className="bg-amber-50 text-amber-600 hover:bg-amber-100"
          title="Edit Quiz"
        />
        <ActionButton
          onClick={() => onDelete(quiz)}
          icon={quiz.hidden === "0" ? Eye : EyeClosed}
          className="bg-teal-50 text-(--primary-color) hover:bg-teal-100"
          title={`${quiz.hidden === "0" ? "Hide" : "Show"} Quiz`}
        />
        <ActionButton
          icon={Trash2}
          onClick={() => onForceDelete(quiz)}
          className="bg-red-50 text-red-600 hover:bg-red-100"
          title="Delete Quiz"
        />
      </div>
    </div>
  </div>
);

export default function Page() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { unitId, detailId } = useParams();
  const { unit: unitData } = useSelector((state) => state.Units);

  const [activeTab, setActiveTab] = useState("videos"); // videos | pdfs | quizzes

  // modal state
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [deleteType, setDeleteType] = useState("pdf"); // pdf | video | quiz
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

  // delete mutation (invalidate حسب tab)
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
    else if (activeTab === "videos")
      window.open(item.video_url, "_blank"); // عدّل لو اسم الحقل مختلف
    else {
      // view quiz route (عدّل حسب مشروعك)
      window.open(item.quiz_url, "_blank");
    }
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

  // hide/show toggle
  const handleToggle = async (item) => {
    try {
      if (activeTab === "pdfs") {
        const response = await Toggle({
          payload: { pdf_id: item.pdf_id },
          url: "units/content/pdfs/toggle_show_pdf.php",
          key: "unitPdfs",
          queryClient,
        });
        toast.success(response.message);
      } else if (activeTab === "videos") {
        const response = await Toggle({
          payload: { video_id: item.video_id },
          url: "units/content/videos/toggle_show_hide.php",
          key: "unitVideos",
          queryClient,
        });
        toast.success(response.message);
      } else {
        // ✅ عدّل URL لو مختلف عندك
        const response = await Toggle({
          payload: { quiz_id: item.quiz_id },
          url: "units/content/quiz/toggle_show_quiz.php",
          key: "unitquizs",
          queryClient,
        });
        toast.success(response.message);
      }
    } catch (e) {}
  };

  // open modal
  const handleForceDeleteOpen = (item) => {
    setRowData(item);
    setDeleteType(
      activeTab === "videos" ? "video" : activeTab === "pdfs" ? "pdf" : "quiz"
    );
    setOpenDeleteModal(true);
  };

  // confirm delete
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
      toast.error(e?.message || "Delete failed");
    }
  };

  if (isVideoLoading || isPdfLoading || isQuizLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const videos = VideoData?.message ?? [];
  const pdfs = PdfData?.message ?? [];
  const quizzes = QuizData?.message ?? [];

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            type="button"
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-700 !text-white px-6 py-2 hover:from-teal-700 hover:to-teal-800 transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={16} />
            Add {activeTab.slice(0, -1)}
          </button>
        </div>

        <BreadCrumb
          title={`Details of ${unitData?.unit_title}` || "Unit Details"}
          parent="Courses"
          child="Units"
        />

        {/* Tabs */}
        <div className="flex gap-4 mt-4 justify-center mb-8">
          <button
            type="button"
            onClick={() => setActiveTab("videos")}
            className={`relative py-3 px-8 rounded-xl font-semibold text-lg transition-all ${
              activeTab === "videos"
                ? "bg-gradient-to-r from-teal-500 to-teal-700 !text-white shadow-lg"
                : "bg-white text-gray-600 hover:text-(--primary-color)"
            }`}
          >
            <Play size={20} className="inline-block mr-2" />
            Videos ({videos.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pdfs")}
            className={`relative py-3 px-8 rounded-xl font-semibold text-lg transition-all ${
              activeTab === "pdfs"
                ? "bg-gradient-to-r from-teal-500 to-teal-700 !text-white shadow-lg"
                : "bg-white text-gray-600 hover:text-(--primary-color)"
            }`}
          >
            <BookOpen size={20} className="inline-block mr-2" />
            PDFs ({pdfs.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("quizzes")}
            className={`relative py-3 px-8 rounded-xl font-semibold text-lg transition-all ${
              activeTab === "quizzes"
                ? "bg-gradient-to-r from-teal-500 to-teal-700 !text-white shadow-lg"
                : "bg-white text-gray-600 hover:text-(--primary-color)"
            }`}
          >
            <BookCheck size={20} className="inline-block mr-2" />
            Quizzes ({quizzes.length})
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "videos" && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="bg-gradient-to-br from-teal-500 to-teal-800 p-2 rounded-lg">
                    <Play className="text-white" size={24} fill="white" />
                  </div>
                  Video Content
                </h2>
              </div>

              {videos.length > 0 ? (
                <div className="grid gap-4">
                  {videos.map((video) => (
                    <VideoItem
                      key={video.video_id}
                      video={video}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleToggle}
                      onForceDelete={handleForceDeleteOpen}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <Play className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-500 text-lg">
                    No videos available for this unit.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddNew}
                    className="mt-4 inline-flex items-center gap-2 text-(--primary-color) hover:text-teal-700 font-medium"
                  >
                    <Plus size={16} />
                    Add your first video
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === "pdfs" && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-2 rounded-lg">
                    <BookOpen className="text-white" size={24} />
                  </div>
                  PDF Resources
                </h2>
              </div>

              {pdfs.length > 0 ? (
                <div className="grid gap-4">
                  {pdfs.map((pdf) => (
                    <PdfItem
                      key={pdf.pdf_id}
                      pdf={pdf}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleToggle}
                      onForceDelete={handleForceDeleteOpen}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-500 text-lg">
                    No PDFs available for this unit.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddNew}
                    className="mt-4 inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                  >
                    <Plus size={16} />
                    Add your first PDF
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === "quizzes" && (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-2 rounded-lg">
                    <BookCheck className="text-white" size={24} />
                  </div>
                  Quizzes
                </h2>
              </div>

              {quizzes.length > 0 ? (
                <div className="grid gap-4">
                  {quizzes.map((quiz) => (
                    <QuizItem
                      key={quiz.quiz_id}
                      quiz={quiz}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleToggle}
                      onForceDelete={handleForceDeleteOpen}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                  <BookCheck className="mx-auto mb-4 text-gray-400" size={48} />
                  <p className="text-gray-500 text-lg">
                    No quizzes available for this unit.
                  </p>
                  <button
                    type="button"
                    onClick={handleAddNew}
                    className="mt-4 inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
                  >
                    <Plus size={16} />
                    Add your first Quiz
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <DeleteModal
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        title={`Do you want to delete this ${
          deleteType === "video"
            ? "Video"
            : deleteType === "pdf"
            ? "PDF"
            : "Quiz"
        }?`}
        description={
          deleteType === "video"
            ? rowData?.video_title
            : deleteType === "pdf"
            ? rowData?.pdf_title
            : rowData?.quiz_title
        }
        handleSubmit={handleForceDeleteConfirm}
        loading={isPending} // لو DeleteModal بيدعمها
      />
    </div>
  );
}
