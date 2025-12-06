"use client";
import React, { useEffect, useMemo, useState } from "react";
import {
  Plus,
  Save,
  RotateCcw,
  Users,
  DollarSign,
  CalendarDays,
  NotebookPen,
  Edit,
  Trash2,
  X,
  Search,
  TrendingUp,
  Clock,
  Filter,
} from "lucide-react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { useRouter } from "next/navigation";
import DeleteModal from "@/components/DeleteModal/DeleteModal";

// Simple mock data — replace with your API later
const TEACHERS = [
  { id: "t1", name: "Ms. Sarah Johnson" },
  { id: "t2", name: "Mr. Adam Brown" },
  { id: "t3", name: "Dr. Lina Ahmed" },
];

const seedReceivables = [
  {
    id: 1,
    payerType: "Teacher",
    name: "Ms. Sarah Johnson",
    teacherId: "t1",
    amount: 1200,
    date: "2025-08-10T10:30",
    notes: "Monthly platform fee",
    status: "pending",
  },
  {
    id: 2,
    payerType: "Student",
    name: "Omar Ali",
    teacherId: null,
    amount: 450,
    date: "2025-08-09T15:00",
    notes: "Private session",
    status: "overdue",
  },
  {
    id: 3,
    payerType: "Teacher",
    name: "Dr. Lina Ahmed",
    teacherId: "t3",
    amount: 800,
    date: "2025-08-08T14:00",
    notes: "Commission payment",
    status: "paid",
  },
];

export default function ReceivablesPage() {
  const [items, setItems] = useState(seedReceivables);
  const [query, setQuery] = useState("");
  const [openDeleteModal , setOpenDeleteModal] = useState(false);
  const [rowData , setRowData] = useState({});
  const [statusFilter, setStatusFilter] = useState("all");
  const router = useRouter();
  const [form, setForm] = useState({
    payerType: "Teacher",
    teacherId: "",
    studentName: "",
    amount: "",
    date: "",
    notes: "",
  });

  useEffect(() => {
    const nowLocal = new Date();
    const tzOffset = nowLocal.getTimezoneOffset();
    const localISO = new Date(nowLocal.getTime() - tzOffset * 60000)
      .toISOString()
      .slice(0, 16);
    setForm((f) => ({
      ...f,
      date: localISO,
      teacherId: TEACHERS[0]?.id || "",
    }));
  }, []);

  function handleSubmit() {
    console.log("Due Deleted");
  }

  const filtered = useMemo(() => {
    let result = items;

    // Filter by search query
    const q = query.trim().toLowerCase();
    if (q) {
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.payerType.toLowerCase().includes(q) ||
          String(i.amount).includes(q) ||
          (i.notes && i.notes.toLowerCase().includes(q))
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      result = result.filter((i) => i.status === statusFilter);
    }

    return result;
  }, [items, query, statusFilter]);

  const stats = useMemo(() => {
    const total = items.reduce((sum, i) => sum + i.amount, 0);
    const pending = items.filter((i) => i.status === "pending");
    const overdue = items.filter((i) => i.status === "overdue");
    const paid = items.filter((i) => i.status === "paid");

    return {
      total,
      pending: pending.reduce((sum, i) => sum + i.amount, 0),
      overdue: overdue.reduce((sum, i) => sum + i.amount, 0),
      paid: paid.reduce((sum, i) => sum + i.amount, 0),
      counts: {
        pending: pending.length,
        overdue: overdue.length,
        paid: paid.length,
      },
    };
  }, [items]);

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateStatus = (id, status) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
  };

  const getStatusBadge = (status) => {
    const styles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      paid: "bg-green-100 text-green-800 border-green-200",
      overdue: "bg-red-100 text-red-800 border-red-200",
    };
    return `inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
      styles[status] || styles.pending
    }`;
  };

  return (
    <div className="min-h-screen">
      <BreadCrumb
        title="Collection of dues"
        parent={"Home"}
        child="Collection of dues"
      />

      {/* Stats Cards */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Total Amount
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  ${stats.total.toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  ${stats.pending.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.counts.pending} items
                </p>
              </div>
              <div className="h-12 w-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  ${stats.overdue.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.counts.overdue} items
                </p>
              </div>
              <div className="h-12 w-12 bg-red-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Collected</p>
                <p className="text-2xl font-bold text-green-600">
                  ${stats.paid.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.counts.paid} items
                </p>
              </div>
              <div className="h-12 w-12 bg-green-100 rounded-xl flex items-center justify-center">
                <Users className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full">
          {/* Receivables Table */}
          <div className="w-full">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        Receivables
                      </h2>
                      <p className="text-sm text-gray-500">
                        {filtered.length} items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search receivables..."
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-48"
                      />
                    </div>

                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="overdue">Overdue</option>
                      <option value="paid">Paid</option>
                    </select>

                    <button
                      onClick={() => router.push(`/collection-of-dues/add`)}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 text-white px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <Plus className="h-4 w-4" />
                      Add New
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">
                        #
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">
                        Payer
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">
                        Amount
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">
                        Date
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">
                        Status
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">
                        Notes
                      </th>
                      <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filtered.map((item, index) => (
                      <tr
                        key={item.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="py-4 px-6 text-sm font-medium text-gray-900">
                          #{item.id}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium ${
                                item.payerType === "Teacher"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {item.payerType === "Teacher" ? "T" : "S"}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">
                                {item.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {item.payerType}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="text-sm font-semibold text-gray-900">
                            ${item.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {new Date(item.date).toLocaleDateString()}
                          <br />
                          <span className="text-xs text-gray-400">
                            {new Date(item.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <select
                            value={item.status}
                            onChange={(e) =>
                              updateStatus(item.id, e.target.value)
                            }
                            className={`${getStatusBadge(
                              item.status
                            )} border-0 bg-transparent text-xs font-medium cursor-pointer`}
                          >
                            <option value="pending">Pending</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                          </select>
                        </td>
                        <td className="py-4 px-6">
                          <span
                            className="text-sm text-gray-600 max-w-[200px] truncate block"
                            title={item.notes}
                          >
                            {item.notes || "—"}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => router.push(`/collection-of-dues/edit/${item?.id}`)}
                              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                              title="Edit"
                            >
                              <Edit className="h-4 w-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() =>{
                                setOpenDeleteModal(true);
                                setRowData(item);
                              }}
                              className="p-2 rounded-lg border border-red-200 hover:bg-red-50 hover:border-red-300 text-red-600 transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {!filtered.length && (
                      <tr>
                        <td colSpan={7} className="py-12 text-center">
                          <div className="flex flex-col items-center gap-3">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                              <DollarSign className="h-8 w-8 text-gray-400" />
                            </div>
                            <div>
                              <p className="text-gray-900 font-medium">
                                No receivables found
                              </p>
                              <p className="text-gray-500 text-sm">
                                Try adjusting your search or filters
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteModal open={openDeleteModal} setOpen={setOpenDeleteModal} title={"Delete this due"} description={"Do You Want to delete this due?"} />
    </div>
  );
}
