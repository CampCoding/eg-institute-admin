"use client";
import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import DeleteModal from "@/components/DeleteModal/DeleteModal";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import useGetAllUnitVideos from "../../../../../../utils/Api/Units/GetAllUnitVideos";
import { Toggle } from "../../../../../../utils/Api/Toggle";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

// Mock data for demonstration
export const mockUnit = {
  unitId: "1",
  name: "Modern Standard Arabic for Beginners",
  description:
    "Learn the basics of Modern Standard Arabic (الفصحى), including pronunciation, alphabet, and simple phrases.",
  duration: 180, // minutes
  videos: [
    {
      id: 1,
      title: "Arabic Basics",
      url: "https://example.com/video1",
      duration: 45,
    },
    {
      id: 2,
      title: "Arabic Fundamentals",
      url: "https://example.com/video2",
      duration: 60,
    },
    {
      id: 3,
      title: "Arabic Introduction",
      url: "https://example.com/video3",
      duration: 75,
    },
  ],
  pdfs: [
    {
      id: 1,
      title: "Arabic Reference Guide",
      url: "https://example.com/pdf1",
      pages: 25,
    },
    {
      id: 2,
      title: "Arabic Cheat Sheet",
      url: "https://example.com/pdf2",
      pages: 12,
    },
    {
      id: 3,
      title: "Arabic Fundamentals",
      url: "https://example.com/pdf3",
      pages: 48,
    },
  ],
};

const fmtMinutes = (mins = 0) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

const ActionButton = ({ icon: Icon, onClick, className, title }) => (
  <button
    onClick={onClick}
    className={`p-2 rounded-lg transition-all hover:scale-105 ${className}`}
    title={title}
  >
    <Icon size={16} />
  </button>
);

const VideoItem = ({
  video,
  setOpenDeleteModal,
  setRowData,
  onEdit,
  onDelete,
  onView,
}) => {
  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between">
          <div className="flex items-center  gap-4 ">
            <div className="bg-gradient-to-br   from-teal-500 to-teal-800 p-3 rounded-xl shadow-lg">
              {video.video_image ? (
                <img
                  src={video.video_image}
                  alt={video.video_title}
                  className=" object-cover max-h-[150px] max-w-[100px]  h-[100px] rounded-xl"
                />
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
          <div className={`!bg-rose-400 mx-1 ${video.hidden !== "0" ? "flex" : "hidden"} py-1 px-2 !rounded-lg !text-white   justify-center items-center text-sm font-medium`}>
            {video.hidden === "0" ? null : "Hidden"}
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
              onClick={() => {
                onDelete(video);
              }}
              icon={video.hidden === "0" ? Eye : EyeClosed}
              className="bg-teal-50 text-(--primary-color) hover:bg-teal-100"
              title={`${video.hidden === "0" ? "Hide" : "Show"} Video`}
            />
          </div>
        </div>
      </div>
    </>
  );
};

const PdfItem = ({
  pdf,
  onEdit,
  setOpenDeleteModal,
  setRowData,
  onDelete,
  onView,
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 group">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-3 rounded-xl shadow-lg">
          <BookOpen className="text-white" size={24} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">
            {pdf.title}
          </h3>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <BookOpen size={14} />
              Pages: {pdf.pages}
            </span>
          </div>
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
          icon={Trash2}
          onClick={() => {
            setRowData(pdf);
            setOpenDeleteModal(true);
          }}
          className="bg-teal-50 text-(--primary-color) hover:bg-teal-100"
          title="Delete PDF"
        />
      </div>
    </div>
  </div>
);

export default function Page() {
  const queryClient = useQueryClient();
  const [unit, setUnit] = useState(null);
  const [activeTab, setActiveTab] = useState("videos");
  const [loading, setLoading] = useState(true);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [rowData, setRowData] = useState({});
  const router = useRouter();
  const { unitId, detailId } = useParams();

  const { unit: unitData } = useSelector((state) => state.Units);
  const { data: VideoData, isLoading: isVideoLoading } = useGetAllUnitVideos({
    detailId,
  });

  const handleBack = () => {
    router.back();
  };

  const handleAddNew = () => {
    if (activeTab == "videos") {
      router.push(`/courses/units/${detailId}/add-video`);
    } else {
      router.push(`/courses/units/${unitId}/add-pdf`);
    }
    console.log(`Add new ${activeTab.slice(0, -1)}`);
  };

  const handleView = (item) => {
    console.log("View:", item);
    window.open(item.url, "_blank");
  };

  const handleEdit = (item) => {
    if (activeTab == "pdfs") {
      router.push(`/courses/units/${unitId}/edit-pdf/${item?.id}`);
    } else {
      localStorage.setItem("video", JSON.stringify(item));
      router.push(`/courses/units/${unitId}/edit-video/${item?.video_id}`);
    }
  };

  const handleDelete = async (item) => {
    const payload = {
      video_id: item.video_id,
    };
    try {
      const response = await Toggle({
        payload,
        url: "units/content/videos/toggle_show_hide.php",
        key: "unitVideos",
        queryClient,
      });
      toast.success(response.message);
    } catch (error) {}
  };

  if (isVideoLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 rounded-lg px-4 py-2 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <button
            onClick={handleAddNew}
            className="inline-flex items-center  text- gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-700 text-white px-6 py-2 hover:from-teal-700 hover:to-teal-800 transition-all shadow-md hover:shadow-lg"
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

        {/* Tab Navigation */}
        <div className="flex gap-4 mt-4 justify-center mb-8">
          <button
            onClick={() => setActiveTab("videos")}
            className={`relative py-3 px-8 rounded-xl font-semibold text-lg transition-all ${
              activeTab === "videos"
                ? "bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-lg"
                : "bg-white text-gray-600 hover:text-(--primary-color)"
            }`}
          >
            <Play size={20} className="inline-block mr-2" />
            Videos ({VideoData?.message?.length})
          </button>
          <button
            onClick={() => setActiveTab("pdfs")}
            className={`relative py-3 px-8 rounded-xl font-semibold text-lg transition-all ${
              activeTab === "pdfs"
                ? "bg-gradient-to-r from-teal-500 to-teal-700 text-white shadow-lg"
                : "bg-white text-gray-600 hover:text-(--primary-color)"
            }`}
          >
            <BookOpen size={20} className="inline-block mr-2" />
            PDFs
          </button>
        </div>

        {/* Tab Content */}
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

              {VideoData && VideoData?.message?.length > 0 ? (
                <div className="grid gap-4">
                  {VideoData?.message.map((video) => (
                    <VideoItem
                      setOpenDeleteModal={setOpenDeleteModal}
                      setRowData={setRowData}
                      key={video.id}
                      video={video}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
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

              {unit.pdfs && unit.pdfs.length > 0 ? (
                <div className="grid gap-4">
                  {unit.pdfs.map((pdf) => (
                    <PdfItem
                      setRowData={setRowData}
                      setOpenDeleteModal={setOpenDeleteModal}
                      key={pdf.id}
                      pdf={pdf}
                      onView={handleView}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
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
        </div>
      </div>

      <DeleteModal
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        description={rowData?.description}
        title={`Do you want to Delete this ${
          activeTab == "videos" ? "Video" : "Pdf"
        }?`}
      />
    </div>
  );
}
