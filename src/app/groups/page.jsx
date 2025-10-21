"use client";

import React, { useMemo, useState } from "react";
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
  MoreVertical,
  BookOpen,
  TrendingUp,
  ChevronDown,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DeleteModal from "@/components/DeleteModal/DeleteModal";

export const initialGroups = [
  {
    id: 1,
    name: "Beginner English",
    members: 12,
    instructor: "John Doe",
    category: "Language",
    progress: 75,
    status: "active",
    lastActivity: "2 hours ago",
  },
  {
    id: 2,
    name: "Advanced Math",
    members: 8,
    instructor: "Jane Smith",
    category: "Mathematics",
    progress: 60,
    status: "active",
    lastActivity: "1 day ago",
  },
  {
    id: 3,
    name: "Science Club",
    members: 15,
    instructor: "Ahmed Ali",
    category: "Science",
    progress: 90,
    status: "completed",
    lastActivity: "3 days ago",
  },
  {
    id: 4,
    name: "Web Development",
    members: 20,
    instructor: "Sarah Johnson",
    category: "Technology",
    progress: 45,
    status: "inactive",
    lastActivity: "5 hours ago",
  },
];

export default function Page() {
  const [groups, setGroups] = useState(initialGroups);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("recent"); // recent | members | progress | name
  const [viewMode, setViewMode] = useState("grid"); // grid | list
  const [quickCat, setQuickCat] = useState("all");
  const router = useRouter();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [rowData, setRowData] = useState({});

  const categories = useMemo(
    () => ["all", ...Array.from(new Set(groups.map((g) => g.category)))],
    [groups]
  );

  const getStatusStyle = (status) => {
    const map = {
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
    let list = [...groups];

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
    if (sortBy === "members") list.sort((a, b) => b.members - a.members);
    else if (sortBy === "progress")
      list.sort((a, b) => b.progress - a.progress);
    else if (sortBy === "name")
      list.sort((a, b) => a.name.localeCompare(b.name));
    // "recent" is default order in this demo (pretend already recent)

    return list;
  }, [groups, searchTerm, filterStatus, sortBy, quickCat]);

  function handleSubmit() {
    console.log("Group Deleted");
  }

  return (
    <div className="min-h-screen">
      <div className="p-2 sm:p-4">
        <BreadCrumb title={"Groups Page"} parent={"Home"} child={"Groups"} />

        {/* Header */}
        <div className="mt-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            {/* <h1 className="text-2xl sm:text-3xl font-bold text-(--primary-color)">
              Learning Groups
            </h1>
            <p className="text-slate-600">Manage and organize your educational groups.</p> */}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
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
                  {groups.reduce((s, g) => s + g.members, 0)}
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
              ? "mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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

                    {/* <button
                      className="rounded-lg p-1 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                      title="More"
                      onClick={() => alert("Open actions menu")}
                    >
                      <MoreVertical size={18} />
                    </button> */}
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="flex items-center text-sm text-slate-600">
                      <Users size={16} className="mr-2 text-slate-400" />{" "}
                      {g.members} members
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">Instructor:</span>{" "}
                      {g.instructor}
                    </div>
                    <div className="text-xs text-slate-500">
                      Last activity: {g.lastActivity}
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
                    onClick={() => router.push(`/groups/edit-group/${g?.id}`)}
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
        {filteredGroups.length === 0 && (
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
                onClick={() => alert("Open: Add Group modal")}
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
        title={"Delete this gorup"}
        description={`Do You Want to delete this group ${rowData?.name}?`}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
