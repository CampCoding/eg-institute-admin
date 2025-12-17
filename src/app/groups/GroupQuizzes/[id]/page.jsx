"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Edit2,
  Trash2,
  Eye,
  EyeClosed,
  BookCheck,
} from "lucide-react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import DeleteModal from "@/components/DeleteModal/DeleteModal";
import { useParams, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { Toggle } from "@/utils/Api/Toggle";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

import useGetAllUnitQuizzes from "@/utils/Api/Units/GetAllQuizzesUnit";
import useDeleteContent from "@/utils/Api/Units/DeletePdf"; // نفس delete hook

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

const QuizItem = ({ quiz, onEdit, onDelete, onView, onForceDelete }) => (
  <div className="bg-white rounded-xl relative shadow-sm border border-gray-100 p-5 hover:shadow-md transition-all duration-200 group">
    <div
      className={`absolute ${
        quiz.hidden !== "0" ? "flex" : "hidden"
      } mx-2 mt-1 bg-rose-400 top-[25%] right-[45%] !rounded-2xl`}
    >
      <span className="px-2 py-1 text-white text-sm font-medium">Hidden</span>
    </div>

    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="bg-gradient-to-br from-teal-500 to-teal-600 p-3 rounded-xl shadow-lg">
          {quiz.quiz_image ? (
            <img
              src={quiz.quiz_image}
              alt={quiz.quiz_title}
              className="object-cover max-h-[150px] max-w-[100px] h-[100px] rounded-xl"
            />
          ) : (
            <BookCheck className="text-white" size={24} />
          )}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg mb-1">
            {quiz.quiz_title || "Untitled Quiz"}
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

export default function UnitQuizzesPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { id } = useParams(); // unit detail id
  const { unit: unitData } = useSelector((state) => state.Units);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [rowData, setRowData] = useState(null);

  const { data: QuizData, isLoading: isQuizLoading } = useGetAllUnitQuizzes({
    detailId: id,
    type: "Group",
  });

  const { mutateAsync, isPending } = useDeleteContent({
    queryKey: "unitquizs",
  });

  const quizzes = QuizData?.message ?? [];
  const groupName = QuizData?.message[0]?.group_name;
  console.log(quizzes);

  const handleAddNew = () => {
    router.push(`/courses/units/${id}/add-quiz`);
  };

  const handleView = (item) => {
    window.open(item.quiz_url, "_blank");
  };

  const handleEdit = (item) => {
    localStorage.setItem("quiz", JSON.stringify(item));
    // ✅ الأفضل تبعت quiz_id في route
    router.push(`/courses/units/${id}/edit-quiz/${item?.quiz_id}`);
  };

  // hide/show
  const handleToggle = async (item) => {
    try {
      const response = await Toggle({
        payload: { quiz_id: item.quiz_id },
        url: "units/content/quiz/toggle_show_quiz.php", // ✅ عدّل لو endpoint مختلف
        key: "unitquizs",
        queryClient,
      });
      toast.success(response.message);
    } catch (e) {}
  };

  // force delete
  const handleForceDeleteOpen = (item) => {
    setRowData(item);
    setOpenDeleteModal(true);
  };

  const handleForceDeleteConfirm = async () => {
    if (!rowData) return;

    try {
      const res = await mutateAsync({ id: rowData.quiz_id, type: "quiz" });
      if (res?.status === "success") {
        toast.success(res.message || "Deleted successfully");
        setOpenDeleteModal(false);
        setRowData(null);
      } else toast.error(res?.message || "Delete failed");
    } catch (e) {
      toast.error(e?.message || "Delete failed");
    }
  };

  if (isQuizLoading) {
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
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-teal-500 to-teal-700 !text-white px-6 py-2 hover:from-teal-700 hover:to-teal-800 transition-all shadow-md hover:shadow-lg"
          >
            <Plus size={16} />
            Assign Quiz
          </button>
        </div>

        <BreadCrumb
          title={`Quizzes of ${groupName} ` || "Unit Quizzes"}
          parent="Courses"
          child="Quizzes"
        />

        <div className="mt-6 space-y-4">
          {quizzes?.length > 0 ? (
            <div className="grid gap-4">
              {quizzes?.map((q) => (
                <QuizItem
                  key={q.quiz_id}
                  quiz={q}
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
                Assign your first Quiz
              </button>
            </div>
          )}
        </div>
      </div>

      <DeleteModal
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        title="Do you want to delete this Quiz?"
        description={rowData?.quiz_title}
        handleSubmit={handleForceDeleteConfirm}
        loading={isPending}
      />
    </div>
  );
}
