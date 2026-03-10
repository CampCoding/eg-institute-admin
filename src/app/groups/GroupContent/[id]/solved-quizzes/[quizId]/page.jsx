"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  FileCheck,
  User,
  ExternalLink,
  Download,
  Upload,
  UserPlus,
  Search,
  RefreshCw,
  Link as LinkIcon,
  Trash2,
  Eye,
  Edit3,
  Save,
  X,
} from "lucide-react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import {
  Table,
  Modal,
  Select,
  Input,
  Empty,
  Spin,
  Tooltip,
  Tag,
  Avatar,
  Popconfirm,
  InputNumber,
} from "antd";
import axios from "axios";
import { BASE_URL } from "@/utils/base_url";
import { uploadPdf } from "@/utils/FileUpload/FileUpload";
import toast from "react-hot-toast";

export default function SolvedQuizzesPage() {
  const router = useRouter();
  const { id: groupId, quizId } = useParams();
  const searchParams = useSearchParams();
  const quizTitle = searchParams.get("title") || "Quiz";

  const [loading, setLoading] = useState(true);
  const [solvedData, setSolvedData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Score edit state
  const [scoreModalOpen, setScoreModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [scoreLoading, setScoreLoading] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;

  // Fetch solved quizzes
  const fetchSolvedQuizzes = async () => {
    if (!quizId || !groupId) return;

    setLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/units/content/quiz/select_sloved_group_quizes.php`,
        {
          quiz_id: Number(quizId),
          group_id: Number(groupId),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.data?.status === "success") {
        setSolvedData(response?.data?.message || []);
      } else {
        setSolvedData([]);
      }
    } catch (error) {
      console.error("Error fetching solved quizzes:", error);
      toast.error("Failed to fetch solved quizzes");
      setSolvedData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSolvedQuizzes();
  }, [quizId, groupId]);

  // Filter data based on search
  const filteredData = solvedData.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.student_name?.toLowerCase().includes(searchLower) ||
      item.student_email?.toLowerCase().includes(searchLower) ||
      String(item.student_id).includes(searchLower)
    );
  });

  // Handle edit score click
  const handleEditScore = (record) => {
    setEditingRecord({
      ...record,
      newScore: record.score || 0,
    });
    setScoreModalOpen(true);
  };

  // Update score API call
  const handleUpdateScore = async () => {
    if (!editingRecord) return;

    setScoreLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/units/content/quiz/but_solved_quiz_score.php`,
        {
          solved_id: Number(editingRecord.id || editingRecord.solved_id),
          score: Number(editingRecord.newScore),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.data?.status === "success") {
        toast.success(response?.data?.message || "Score updated successfully");

        // Update local state
        setSolvedData((prev) =>
          prev.map((item) =>
            (item.id || item.solved_id) ===
            (editingRecord.id || editingRecord.solved_id)
              ? { ...item, score: editingRecord.newScore }
              : item
          )
        );

        setScoreModalOpen(false);
        setEditingRecord(null);
      } else {
        toast.error(response?.data?.message || "Failed to update score");
      }
    } catch (error) {
      console.error("Error updating score:", error);
      toast.error("Failed to update score");
    } finally {
      setScoreLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      title: "#",
      dataIndex: "index",
      key: "index",
      width: 60,
      render: (_, __, index) => (
        <span className="text-gray-500 font-medium">{index + 1}</span>
      ),
    },
    {
      title: "Student",
      dataIndex: "student_name",
      key: "student_name",
      render: (name, record) => (
        <div className="flex items-center gap-3">
          <Avatar
            size={40}
            className="bg-gradient-to-br from-teal-500 to-teal-600 flex-shrink-0"
          >
            {name?.charAt(0)?.toUpperCase() || <User size={18} />}
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">
              {name || `Student #${record.student_id}`}
            </p>
            {record.student_email && (
              <p className="text-sm text-gray-500">{record.student_email}</p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Submitted At",
      dataIndex: "submitted_at",
      key: "submitted_at",
      width: 180,
      render: (date) =>
        date ? (
          <span className="text-gray-600">
            {new Date(date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      width: 120,
      align: "center",
      render: (score, record) => (
        <div className="flex items-center justify-center gap-2">
          {score !== undefined && score !== null ? (
            <Tag color="teal" className="text-sm font-medium px-3 py-1">
              {score}
            </Tag>
          ) : (
            <Tag color="default" className="text-sm px-3 py-1">
              Not Graded
            </Tag>
          )}
          <Tooltip title="Edit Score">
            <button
              onClick={() => handleEditScore(record)}
              className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-teal-600 transition-colors"
            >
              <Edit3 size={14} />
            </button>
          </Tooltip>
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      align: "center",
      render: (_, record) => (
        <div className="flex items-center justify-center gap-2">
          {record.solved_quiz_url ? (
            <Tooltip title="View Solution">
              <button
                onClick={() => window.open(record.solved_quiz_url, "_blank")}
                className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
              >
                <Eye size={16} />
              </button>
            </Tooltip>
          ) : (
            <span className="text-gray-400 text-sm">No file</span>
          )}
        </div>
      ),
    },
  ];

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

      <BreadCrumb
        title="Solved Quizzes"
        parent="Group Content"
        child="Solved Quizzes"
      />

      {/* Main Card */}
      <div className="mt-6 bg-white rounded-2xl border border-gray-100 overflow-hidden">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-teal-600 to-teal-700 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <FileCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Solved Quizzes</h2>
                <p className="text-white/80 text-sm mt-1">{quizTitle}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="bg-white/20 text-white px-4 py-2 rounded-xl text-sm font-medium">
                {solvedData.length} Submissions
              </span>
            </div>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
            {/* Search */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <Tooltip title="Refresh">
                <button
                  onClick={fetchSolvedQuizzes}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors disabled:opacity-50"
                >
                  <RefreshCw
                    size={18}
                    className={loading ? "animate-spin" : ""}
                  />
                </button>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="p-4">
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            rowKey={(record) =>
              record.id ||
              record.solved_id ||
              record.student_id ||
              Math.random()
            }
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} submissions`,
            }}
            locale={{
              emptyText: (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={
                    <div className="text-center py-4">
                      <p className="text-gray-500 mb-2">
                        No solutions submitted yet
                      </p>
                    </div>
                  }
                />
              ),
            }}
            className="solved-quizzes-table"
          />
        </div>
      </div>

      {/* Upload Modal */}
      <UploadSolvedQuizModal
        open={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        quizId={quizId}
        quizTitle={quizTitle}
        groupId={groupId}
        onSuccess={() => {
          fetchSolvedQuizzes();
          setUploadModalOpen(false);
        }}
      />

      {/* Score Edit Modal */}
      <ScoreEditModal
        open={scoreModalOpen}
        onClose={() => {
          setScoreModalOpen(false);
          setEditingRecord(null);
        }}
        record={editingRecord}
        setRecord={setEditingRecord}
        onSubmit={handleUpdateScore}
        loading={scoreLoading}
      />

      <style jsx global>{`
        .solved-quizzes-table .ant-table-thead > tr > th {
          background: #f9fafb !important;
          font-weight: 600;
          color: #374151;
        }
        .solved-quizzes-table .ant-table-tbody > tr:hover > td {
          background: #f3f4f6 !important;
        }
      `}</style>
    </div>
  );
}

// ✅ Score Edit Modal Component
function ScoreEditModal({
  open,
  onClose,
  record,
  setRecord,
  onSubmit,
  loading,
}) {
  if (!record) return null;

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={420}
      centered
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-100 rounded-lg">
            <Edit3 className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Edit Score</h3>
            <p className="text-sm text-gray-500 font-normal">
              {record.student_name || `Student #${record.student_id}`}
            </p>
          </div>
        </div>
      }
    >
      <div className="space-y-5 mt-6">
        {/* Student Info */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <Avatar
              size={48}
              className="bg-gradient-to-br from-teal-500 to-teal-600"
            >
              {record.student_name?.charAt(0)?.toUpperCase() || (
                <User size={20} />
              )}
            </Avatar>
            <div>
              <p className="font-medium text-gray-900">
                {record.student_name || `Student #${record.student_id}`}
              </p>
              {record.student_email && (
                <p className="text-sm text-gray-500">{record.student_email}</p>
              )}
            </div>
          </div>
        </div>

        {/* Current Score */}
        {record.score !== undefined && record.score !== null && (
          <div className="flex items-center justify-between px-4 py-3 bg-blue-50 rounded-xl">
            <span className="text-sm text-blue-700">Current Score:</span>
            <Tag color="blue" className="font-medium">
              {record.score}
            </Tag>
          </div>
        )}

        {/* Score Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            New Score <span className="text-red-500">*</span>
          </label>
          <InputNumber
            value={record.newScore}
            onChange={(value) =>
              setRecord((prev) => ({ ...prev, newScore: value }))
            }
            min={0}
            max={100}
            size="large"
            className="w-full"
            placeholder="Enter score (0-100)"
            style={{ width: "100%" }}
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter a score between 0 and 100
          </p>
        </div>

        {/* View Solution Link */}
        {record.solved_quiz_url && (
          <button
            onClick={() => window.open(record.solved_quiz_url, "_blank")}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-blue-200 text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Eye size={16} />
            View Solution to Grade
          </button>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center gap-2"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={
              loading ||
              record.newScore === undefined ||
              record.newScore === null
            }
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:from-teal-600 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Spin size="small" />
                Saving...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Score
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}

// ✅ Upload Modal Component
function UploadSolvedQuizModal({
  open,
  onClose,
  quizId,
  quizTitle,
  groupId,
  onSuccess,
}) {
  const [loading, setLoading] = useState(false);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [uploadMode, setUploadMode] = useState("upload");
  const [file, setFile] = useState(null);
  const [linkUrl, setLinkUrl] = useState("");

  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;

  // Fetch students in the group
  const fetchGroupStudents = async () => {
    if (!groupId) return;

    setStudentsLoading(true);
    try {
      const response = await axios.post(
        `${BASE_URL}/groups/select_group_students.php`,
        { group_id: groupId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.data?.status === "success") {
        setStudents(response?.data?.message || []);
      } else {
        setStudents([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchGroupStudents();
      setSelectedStudent(null);
      setFile(null);
      setLinkUrl("");
      setUploadMode("upload");
    }
  }, [open, groupId]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast.error("Only PDF files are allowed");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async () => {
    if (!selectedStudent) {
      toast.error("Please select a student");
      return;
    }

    if (uploadMode === "upload" && !file) {
      toast.error("Please upload a PDF file");
      return;
    }

    if (uploadMode === "link" && !linkUrl.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    setLoading(true);

    try {
      let solvedQuizUrl = "";

      if (uploadMode === "upload" && file) {
        const uploadResult = await uploadPdf(file);
        if (uploadResult?.status === "success") {
          solvedQuizUrl = uploadResult.file_url;
        } else {
          toast.error(uploadResult?.message || "Failed to upload file");
          setLoading(false);
          return;
        }
      } else {
        solvedQuizUrl = linkUrl.trim();
      }

      const response = await axios.post(
        `${BASE_URL}/user/units/content/quizes/upload_solved_quiz.php`,
        {
          student_id: selectedStudent,
          quiz_id: Number(quizId),
          solved_quiz_url: solvedQuizUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response?.data?.status === "success") {
        toast.success(
          response?.data?.message || "Solved quiz uploaded successfully"
        );
        onSuccess?.();
      } else {
        toast.error(response?.data?.message || "Failed to upload solved quiz");
      }
    } catch (error) {
      console.error("Error uploading solved quiz:", error);
      toast.error("Failed to upload solved quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={550}
      title={
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <Upload className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Upload Solved Quiz</h3>
            <p className="text-sm text-gray-500 font-normal">{quizTitle}</p>
          </div>
        </div>
      }
    >
      <div className="space-y-5 mt-4">
        {/* Select Student */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Student <span className="text-red-500">*</span>
          </label>
          <Select
            placeholder="Select a student"
            className="w-full"
            size="large"
            loading={studentsLoading}
            value={selectedStudent}
            onChange={setSelectedStudent}
            showSearch
            optionFilterProp="children"
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={students.map((s) => ({
              value: s.student_id || s.user_id || s.id,
              label:
                s.student_name ||
                s.name ||
                s.user_name ||
                `Student #${s.student_id || s.id}`,
            }))}
            notFoundContent={
              studentsLoading ? (
                <Spin size="small" />
              ) : (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No students in this group"
                />
              )
            }
          />
        </div>

        {/* Upload Mode Toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Solution Source <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-2 bg-gray-100 rounded-lg p-1">
            <button
              type="button"
              onClick={() => setUploadMode("upload")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                uploadMode === "upload"
                  ? "bg-white text-teal-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <Upload size={16} />
              Upload File
            </button>
            <button
              type="button"
              onClick={() => setUploadMode("link")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                uploadMode === "link"
                  ? "bg-white text-teal-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              <LinkIcon size={16} />
              Paste URL
            </button>
          </div>
        </div>

        {/* Upload File */}
        {uploadMode === "upload" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload PDF File
            </label>
            <div
              className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                file
                  ? "border-teal-400 bg-teal-50"
                  : "border-gray-300 hover:border-teal-400"
              }`}
            >
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="hidden"
                id="solved-quiz-upload"
              />
              <label
                htmlFor="solved-quiz-upload"
                className="cursor-pointer block"
              >
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <FileCheck className="w-8 h-8 text-teal-600" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-gray-900">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setFile(null);
                      }}
                      className="p-1 rounded-full hover:bg-teal-100"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload or drag & drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF only</p>
                  </>
                )}
              </label>
            </div>
          </div>
        )}

        {/* Paste URL */}
        {uploadMode === "link" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Solution URL
            </label>
            <Input
              placeholder="https://example.com/solved-quiz.pdf"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              size="large"
              prefix={<LinkIcon size={16} className="text-gray-400" />}
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !selectedStudent}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-500 to-teal-700 text-white hover:from-teal-600 hover:to-teal-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Spin size="small" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload Solution
              </>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
