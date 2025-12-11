"use client";

import React, { useEffect, useMemo, useState } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import {
  Users,
  Edit,
  Trash2,
  Plus,
  Search,
  Filter,
  LayoutGrid,
  List as ListIcon,
  BookOpen,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DeleteModal from "@/components/DeleteModal/DeleteModal";
import useGetAllGroups from "../../utils/Api/Courses/GetAllGroups";
import axios from "axios";
import { Spin } from "antd";
import toast from "react-hot-toast";
import { BASE_URL } from "../../utils/base_url";


export default function Page() {
  const [groups, setGroups] = useState([]);
  const { data, isLoading } = useGetAllGroups();
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // all | active | completed | inactive
  const [sortBy, setSortBy] = useState("recent"); // recent | members | progress | name
  const [viewMode, setViewMode] = useState("grid");
  const [quickCat, setQuickCat] = useState("all");

  const router = useRouter();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [rowData, setRowData] = useState({});

  // Map API data → groups state
  useEffect(() => {
    if (!data?.message) return;

    const mapped = data.message.map((g) => ({
      id: g?.group_id,
      name: g?.group_name,
      members: Number(g?.members_count ?? 0),
      instructor: g?.teacher_name || "Unknown",
      category: g?.category || "Language",
      progress: Number(g?.progress ?? 75), // default if not provided
      status: g?.status || "inactive",
      maxStudents: Number(g?.max_students ?? 0),
    }));

    setGroups(mapped);
  }, [data]);

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(groups.map((g) => g.category)))],
    [groups]
  );

  const getStatusStyle = (status) => {
    const map= {
      active: "bg-green-50 text-green-700 ring-green-200",
      completed: "bg-blue-50 text-blue-700 ring-blue-200",
      inactive: "bg-slate-50 text-slate-700 ring-slate-200",
    };
    return map[status] || map.inactive;
  };

  const catEmoji = (category) => {
    const key = (category || "").toLowerCase();
    if (key.includes("lang")) return "🗣️";
    if (key.includes("math")) return "📊";
    if (key.includes("science")) return "🔬";
    if (key.includes("tech") || key.includes("web")) return "💻";
    return "📚";
  };

  const filteredGroups = useMemo(() => {
    let list = [...groups]; // copy so sort doesn't mutate state

    // search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(
        (g) =>
          g.name.toLowerCase().includes(q) ||
          g.instructor.toLowerCase().includes(q) ||
          g.category.toLowerCase().includes(q)
      );
    }

    // status filter
    if (filterStatus !== "all") {
      list = list.filter((g) => g.status === filterStatus);
    }

    // category quick filter
    if (quickCat !== "all") {
      list = list.filter((g) => g.category === quickCat);
    }

    // sort
    if (sortBy === "members") {
      list.sort((a, b) => b.members - a.members);
    } else if (sortBy === "progress") {
      list.sort((a, b) => b.progress - a.progress);
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }
    // "recent" keeps the original order

    return list;
  }, [groups, searchTerm, filterStatus, sortBy, quickCat]);

  // 🔴 HANDLE DELETE HERE
  const handleSubmit = async () => {
    if (!rowData?.id) return;

    try {
      setDeleteLoading(true);

      const data_send = {
        group_id: rowData.id,
      };

      const res = await axios.post(
        `${BASE_URL}/groups/delete_group.php`,
        data_send
      );

      // Adjust this condition to match your PHP response structure
      if (res?.data?.status === "success" || res?.data?.success) {
        // Remove group from UI
        toast.success(res?.data?.message);
        setGroups((prev) => prev.filter((g) => g.id !== rowData.id));
        setOpenDeleteModal(false);
      } else {
        toast.error(res?.data?.message)
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("An error occurred while deleting the group.");
    } finally {
      setDeleteLoading(false);
    }
  };

  if(isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spin spinning size="large"/>
      </div>
    )
  }

 

  return (
    <div className="min-h-screen">
      <div className="p-2 sm:p-4">
        <BreadCrumb title={"Groups Page"} parent={"Home"} child={"Groups"} />

        {/* Header */}
        <div className="mt-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>{/* Title section if you need it later */}</div>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setViewMode(viewMode === "grid" ? "list" : "grid")
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
              title={viewMode === "grid" ? "List view" : "Grid view"}
            >
              {viewMode === "grid" ? (
                <>
                  <ListIcon size={16} /> List View
                </>
              ) : (
                <>
                  <LayoutGrid size={16} /> Grid View
                </>
              )}
            </button>
            <button
              onClick={() => router.push(`/groups/add-group`)}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm !text-white shadow-sm hover:shadow"
              style={{
                backgroundImage: "linear-gradient(90deg,#2563eb,#7c3aed)",
              }}
            >
              <Plus size={18} />
              Add New Group
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-500 text-xs font-semibold">
                  Total Groups
                </div>
                <div className="mt-1 text-3xl font-bold">{groups.length}</div>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50">
                <Users className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-500 text-xs font-semibold">
                  Total Members
                </div>
                <div className="mt-1 text-3xl font-bold">
                  {groups.reduce((s, g) => s + (g.members || 0), 0)}
                </div>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-50">
                <TrendingUp className="text-emerald-600" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-slate-500 text-xs font-semibold">
                  Active Groups
                </div>
                <div className="mt-1 text-3xl font-bold">
                  {groups.filter((g) => g.status === "active").length}
                </div>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-violet-50">
                <BookOpen className="text-violet-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by group, instructor, or category…"
                className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 outline-none focus:ring-2 ring-blue-500"
              />
            </div>

            {/* Status */}
            <div className="relative">
              <Filter
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white pl-10 pr-8 outline-none"
              >
                <option value="all">All status</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Sort */}
            <div className="relative">
              <ChevronDown
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white pl-3 pr-9 outline-none"
              >
                <option value="recent">Sort: Recent</option>
                <option value="name">Sort: Name (A–Z)</option>
                <option value="members">Sort: Members</option>
                <option value="progress">Sort: Progress</option>
              </select>
            </div>
          </div>

          {/* Quick category chips */}
          <div className="mt-3 flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setQuickCat(cat)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ring-1 transition ${
                  quickCat === cat
                    ? "bg-slate-900 !text-white ring-slate-900"
                    : "bg-white text-slate-700 ring-slate-200 hover:bg-slate-50"
                }`}
                title={cat === "all" ? "All categories" : cat}
              >
                {cat === "all" ? "All Categories" : `${catEmoji(cat)} ${cat}`}
              </button>
            ))}
          </div>
        </div>

        {/* Grid / List */}
        <div
          className={
            viewMode === "grid"
              ? "mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              : "mt-6 space-y-4"
          }
        >
          {filteredGroups.map((g) => (
            <div
              key={g.id}
              className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-xl ${
                viewMode === "list" ? "p-5" : "p-6"
              }`}
            >
              {/* gradient ribbon */}
              <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rotate-45 bg-gradient-to-br from-blue-500/10 via-indigo-500/10 to-fuchsia-500/10" />
              <div className="pointer-events-none absolute right-3 top-3 text-5xl opacity-10">
                {catEmoji(g.category)}
              </div>

              <div className={viewMode === "list" ? "flex gap-5" : ""}>
                <div className={viewMode === "list" ? "flex-1" : ""}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 hover:text-blue-600 transition">
                        {g.name}
                      </h3>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${getStatusStyle(
                            g.status
                          )}`}
                        >
                          {g.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {g.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-slate-600">
                        <Users size={16} className="mr-2 text-slate-400" />{" "}
                        {g.maxStudents} Member limit
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Users size={16} className="mr-2 text-slate-400" />{" "}
                        {g.members} Member
                      </div>
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">Instructor:</span>{" "}
                      {g.instructor}
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
                      <span>Progress</span>
                      <span>{g.progress}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-[width]"
                        style={{ width: `${g.progress}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div
                  className={`mt-4 flex ${
                    viewMode === "grid" && "border-t border-slate-100"
                  } pt-4 ${
                    viewMode === "list"
                      ? "flex-col gap-2 justify-between w-44 border-0 mt-0 pt-0"
                      : "justify-between"
                  }`}
                >
                  <button
                    onClick={() => router.push(`/groups/edit-group/${g.id}`)}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50"
                  >
                    <Edit size={16} /> Edit
                  </button>
                  <button
                    onClick={() => {
                      setRowData(g);
                      setOpenDeleteModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state */}
        {filteredGroups.length === 0 && !isLoading && (
          <div className="mt-12 text-center">
            <div className="mx-auto mb-4 grid h-24 w-24 place-items-center rounded-full bg-slate-100">
              <Users size={40} className="text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900">
              No groups found
            </h3>
            <p className="mt-1 text-slate-600">
              {searchTerm || filterStatus !== "all" || quickCat !== "all"
                ? "Try adjusting your search or filters."
                : "Create your first group to get started."}
            </p>
            {!(searchTerm || filterStatus !== "all" || quickCat !== "all") && (
              <button
                onClick={() => router.push("/groups/add-group")}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold !text-white hover:opacity-90"
              >
                <Plus size={16} /> Create Group
              </button>
            )}
          </div>
        )}
      </div>

      <DeleteModal
        open={openDeleteModal}
        setOpen={setOpenDeleteModal}
        title={"Delete this group"}
        description={`Do you want to delete this group "${rowData?.name}"?`}
        handleSubmit={handleSubmit}
        // If DeleteModal supports loading prop, pass deleteLoading here:
        // loading={deleteLoading}
      />
    </div>
  );
}
