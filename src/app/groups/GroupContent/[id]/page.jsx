"use client";

import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeClosed,
  BookCheck,
  Binoculars,
  Link as LinkIcon,
  Unlink,
} from "lucide-react";

import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import DeleteModal from "@/components/DeleteModal/DeleteModal";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Toggle } from "@/utils/Api/Toggle";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Dropdown, Space } from "antd";
import { ChevronDown } from "lucide-react";

import useDeleteContent from "@/utils/Api/Units/DeletePdf"; // delete hook
import usePostAssign from "@/utils/Api/Units/PosToggleAssignQuiz";

// ✅ Existing (Quiz hooks)
import useGetAllUnitQuizzes from "@/utils/Api/Units/GetAllQuizzesUnit";
import useGetAllQuizzes from "@/utils/Api/Units/GetAllQuizzes";
import useGetAllPdfsByType from "@/utils/Api/Units/GetAllPdfs";
import useGetAllUnitVideos from "@/utils/Api/Units/GetAllUnitVideos";

// ------------------------------------------------------------
// 1) CONFIG PER TYPE
// ------------------------------------------------------------
const CONTENT = {
  quiz: {
    label: "Quizzes",
    apiType: "quiz",
    contentType: "quiz",
    // assigned items for this group/unit
    listHook: useGetAllUnitQuizzes,
    // all items to choose from in modal
    allHook: useGetAllQuizzes,

    idKey: "quiz_id",
    assignIdKey: "quiz_id",
    unassignIdKey: "assign_quiz_id",

    titleKey: "quiz_title",
    imageKey: "quiz_image",
    urlKey: "quiz_url",

    toggleUrl: "units/content/quiz/toggle_show_quiz_group.php",

    // payload builders (edit here if backend expects unit_id instead of group_id)
    assignPayload: (groupId, item) => ({
      group_id: groupId,
      quiz_id: item.quiz_id,
    }),
    unassignPayload: (item) => ({
      assign_quiz_id: item.assign_quiz_id,
    }),

    // edit route for quizzes only
    canEdit: true,
    editRoute: (groupId, quizId) =>
      `/courses/units/${groupId}/edit-quiz/${quizId}`,
  },
  // ❗️replace hooks + keys/urls as needed
  pdf: {
    label: "PDFs",
    apiType: "pdfs",
    contentType: "pdfs",
    listHook: useGetAllPdfsByType, // TODO: replace with useGetAllUnitPdfs
    allHook: useGetAllQuizzes, // TODO: replace with useGetAllPdfs

    idKey: "pdf_id",
    assignIdKey: "pdf_id",
    unassignIdKey: "assign_pdf_id",

    titleKey: "pdf_title",
    imageKey: "pdf_image",
    urlKey: "pdf_url",

    toggleUrl: "units/content/pdfs/toggle_show_pdf_group.php",

    assignPayload: (groupId, item) => ({
      group_id: groupId,
      pdf_id: item.pdf_id,
    }),
    unassignPayload: (item) => ({
      assign_pdf_id: item.assign_pdf_id,
    }),

    canEdit: false,
  },

  // ❗️replace hooks + keys/urls as needed
  video: {
    label: "Videos",
    apiType: "videos",
    contentType: "videos",
    listHook: useGetAllUnitVideos, // TODO: replace with useGetAllUnitVideos
    allHook: useGetAllQuizzes, // TODO: replace with useGetAllVideos

    idKey: "video_id",
    assignIdKey: "video_id",
    unassignIdKey: "assign_video_id",

    titleKey: "video_title",
    imageKey: "video_image", // thumbnail
    urlKey: "video_url",

    toggleUrl: "units/content/videos/toggle_show_vid_group.php",

    assignPayload: (groupId, item) => ({
      group_id: groupId,
      video_id: item.video_id,
    }),
    unassignPayload: (item) => ({
      assign_video_id: item.assign_video_id,
    }),

    canEdit: false,
  },
};

// ------------------------------------------------------------
// 2) SMALL UI PARTS
// ------------------------------------------------------------
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

const ContentItem = ({
  item,
  cfg,
  onEdit,
  onToggle,
  onView,
  onForceDelete,
  onUnlink,
}) => (
  <div className="bg-white rounded-xl relative shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 group">
    <div
      className={`absolute ${
        item?.hidden !== "0" ? "flex" : "hidden"
      } mx-2 mt-1 bg-rose-400 top-[10%] right-0 !rounded-2xl`}
    >
      <span className="px-2 py-1 text-white text-sm font-medium">Hidden</span>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-3 rounded-xl shadow-lg">
          {item?.[cfg.imageKey] ? (
            <img
              src={item[cfg.imageKey]}
              alt={item?.[cfg.titleKey]}
              className="object-cover max-h-[150px] max-w-[100px] h-[100px] rounded-xl"
            />
          ) : (
            <BookCheck className="text-white" size={24} />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">
            {item?.[cfg.titleKey] || "Untitled"}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <ActionButton
          icon={Binoculars}
          onClick={() => onView(item)}
          className="bg-blue-50 text-blue-600 hover:bg-blue-100"
          title="View"
        />

        {cfg.canEdit && (
          <ActionButton
            icon={Edit2}
            onClick={() => onEdit(item)}
            className="bg-amber-50 text-amber-600 hover:bg-amber-100"
            title="Edit"
          />
        )}

        <ActionButton
          onClick={() => onToggle(item)}
          icon={item?.hidden === "0" ? Eye : EyeClosed}
          className="bg-teal-50 text-(--primary-color) hover:bg-teal-100"
          title={`${item?.hidden === "0" ? "Hide" : "Show"}`}
        />

        <ActionButton
          icon={Unlink}
          onClick={() => onUnlink(item)}
          className="bg-red-50 text-red-600 hover:bg-red-100"
          title="Unassign"
        />

        <ActionButton
          icon={Trash2}
          onClick={() => onForceDelete(item)}
          className="bg-red-50 text-red-600 hover:bg-red-100"
          title="Delete"
        />
      </div>
    </div>
  </div>
);

const AssignContentModal = ({
  data,
  open,
  setOpen,
  cfg,
  groupId,
  onContinue,
}) => {
  if (!open) return null;

  const list = Array.isArray(data) ? data : [];

  const items = useMemo(
    () =>
      list.map((x) => ({
        key: String(x?.[cfg.assignIdKey]),
        label: x?.[cfg.titleKey] || "Untitled",
      })),
    [list, cfg]
  );

  const [selected, setSelected] = useState(null);

  const onMenuClick = ({ key }) => {
    const x = list.find((i) => String(i?.[cfg.assignIdKey]) === String(key));
    if (!x) return;
    setSelected(x);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selected) {
      toast.error(`Please select a ${cfg.label.slice(0, -1)}`);
      return;
    }
    onContinue?.(selected);
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        onClick={() => setOpen(false)}
        aria-label="Close"
      />

      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Assign {cfg.label}
          </h3>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-2 rounded-lg hover:bg-gray-100"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <Dropdown
            trigger={["click"]}
            placement="bottomLeft"
            overlayClassName="assign-content-dropdown"
            menu={{ items, onClick: onMenuClick }}
          >
            <button
              type="button"
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-left
                         hover:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-500
                         flex items-center justify-between"
            >
              <Space className="text-gray-700">
                {selected?.[cfg.titleKey] || `Select ${cfg.label.slice(0, -1)}`}
              </Space>
              <ChevronDown size={18} className="text-gray-400" />
            </button>
          </Dropdown>

          <div className="text-gray-700 my-2 mx-1 text-sm">
            Selected:{" "}
            <span className="font-semibold">
              {selected?.[cfg.titleKey] || "-"}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-700 !text-white hover:from-teal-700 hover:to-teal-800"
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ------------------------------------------------------------
// 3) PAGE
// ------------------------------------------------------------
export default function UnitContentPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = useParams(); // group or unit id حسب route عندك

  const searchParam = useSearchParams();
  const type = (searchParam.get("type") || "quiz").toLowerCase(); // quiz|pdf|video
  const cfg = CONTENT[type] || CONTENT.quiz;
  console.log(cfg);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [rowData, setRowData] = useState(null);

  const [openAssignModal, setOpenAssignModal] = useState(false);

  const { mutateAsync: assignContent, isPending: isAssignPending } =
    usePostAssign(id);

  // ✅ get all items + assigned items based on type
  const { data: AllItems } = cfg.allHook({ detailId: id, type: cfg.apiType });
  const { data: AssignedData, isLoading } = cfg.listHook({
    detailId: id,
    type: "Group",
  });

  const items = AssignedData?.message ?? [];
  const groupName = AssignedData?.message?.[0]?.group_name;

  const { mutateAsync: deleteContent, isPending: isDeletePending } =
    useDeleteContent({ queryKey: "unitcontents" }); // عدّل queryKey لو محتاج

  const handleView = (item) => {
    const url = item?.[cfg.urlKey];
    if (!url) return toast.error("No URL found");
    window.open(url, "_blank");
  };

  const handleEdit = (item) => {
    if (!cfg.canEdit) return;
    localStorage.setItem(type, JSON.stringify(item));
    router.push(cfg.editRoute(id, item?.[cfg.idKey]));
  };

  const handleToggle = async (item) => {
    try {
      const payload = { [cfg.unassignIdKey]: item?.[cfg.unassignIdKey] };
      const res = await Toggle({
        payload,
        url: cfg.toggleUrl,
        key: `unit_${type}s`, // عدّل لو queryKey مختلف
        queryClient,
      });

      if (res?.status === "success") {
        queryClient.invalidateQueries();
        toast.success(res?.message || "Toggled successfully");
      } else toast.error(res?.message || "Toggle failed");
    } catch (e) {
      toast.error("Toggle failed");
    }
  };

  const handleAssign = async (selectedItem) => {
    try {
      const payload = cfg.assignPayload(id, selectedItem);
      const res = await assignContent({
        payload,
        type: "assign",
        contentType: cfg.contentType,
      });

      if (res?.status === "success") {
        toast.success(res?.message || "Assigned successfully");
        // ✅ refresh lists
        queryClient.invalidateQueries();
      } else {
        toast.error(res?.message || "Assignment failed");
      }
    } catch (e) {
      toast.error(e?.message || "Assignment failed");
    }
  };

  const handleUnlink = async (item) => {
    try {
      const payload = cfg.unassignPayload(item);
      const res = await assignContent({
        payload,
        type: "unassign",
        contentType: cfg.contentType,
      });

      if (res?.status === "success") {
        toast.success(res?.message || "Unassigned successfully");
        queryClient.invalidateQueries();
      } else {
        toast.error(res?.message || "Unassign failed");
      }
    } catch (e) {
      toast.error(e?.message || "Unassign failed");
    }
  };

  const handleForceDeleteOpen = (item) => {
    setRowData(item);
    setOpenDeleteModal(true);
  };

  const handleForceDeleteConfirm = async () => {
    if (!rowData) return;

    try {
      const res = await deleteContent({ id: rowData?.[cfg.idKey], type });

      if (res?.status === "success") {
        toast.success(res?.message || "Deleted successfully");
        setOpenDeleteModal(false);
        setRowData(null);
        queryClient.invalidateQueries();
      } else toast.error(res?.message || "Delete failed");
    } catch (e) {
      toast.error(e?.message || "Delete failed");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            onClick={() => setOpenAssignModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-700 !text-white px-6 py-2 hover:from-teal-700 hover:to-teal-800 transition-all shadow-md hover:shadow-lg"
          >
            <LinkIcon size={16} />
            Assign {cfg.label}
          </button>
        </div>

        <BreadCrumb
          title={`${cfg.label} of ${groupName || "Group"}`}
          parent="Courses"
          child={cfg.label}
        />

        <div className="mt-6 space-y-4">
          {items?.length > 0 ? (
            <div className="grid gap-4">
              {items.map((x) => (
                <ContentItem
                  key={String(x?.[cfg.idKey])}
                  item={x}
                  cfg={cfg}
                  onView={handleView}
                  onEdit={handleEdit}
                  onToggle={handleToggle}
                  onForceDelete={handleForceDeleteOpen}
                  onUnlink={handleUnlink}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <BookCheck className="mx-auto mb-4 text-gray-400" size={48} />
              <p className="text-gray-500 text-lg">
                No {cfg.label.toLowerCase()} available for this group.
              </p>
              <button
                type="button"
                onClick={() => setOpenAssignModal(true)}
                className="mt-4 inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
              >
                <Plus size={16} />
                Assign your first {cfg.label.slice(0, -1)}
              </button>
            </div>
          )}
        </div>
      </div>

      <DeleteModal
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        title={`Do you want to delete this ${cfg.label.slice(0, -1)}?`}
        description={rowData?.[cfg.titleKey]}
        handleSubmit={handleForceDeleteConfirm}
        loading={isDeletePending}
      />

      <AssignContentModal
        data={AllItems?.message}
        open={openAssignModal}
        setOpen={setOpenAssignModal}
        cfg={cfg}
        groupId={id}
        onContinue={handleAssign}
      />
    </div>
  );
}
