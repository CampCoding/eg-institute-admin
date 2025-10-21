"use client";
import React, { useEffect, useState } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { initialGroups } from "../../page";

export default function Page() {
    const {id} = useParams();
  const [formData, setFormData] = useState({
    name: "",
    instructor: "",
    category: "",
    members: "",
    progress: "",
    status: "active",
  });
  const [rowData , setRowData] = useState({});
  const router = useRouter();
  const categories = ["Egyptian Arabic Dialect", "Modern Standard Arabic"];
  const statuses = ["active", "completed", "inactive"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRowData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("New Group Data:", formData);
    alert("Group added successfully!");
  };

  useEffect(() => {
    if(id) {
        setRowData(initialGroups?.find(group => group?.id == id))
    }
  } , [id])

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
        title={"Edit Group Page"}
        parent={"Groups"}
        child={"Edit Group"}
      />

      <div className="mt-5  bg-white rounded-2xl   p-2 sm:p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Group Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Group Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter group name"
              value={rowData?.name}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-(--primary-color) outline-none"
            />
          </div>

          {/* Instructor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Instructor Name
            </label>
            <input
              type="text"
              name="instructor"
              placeholder="Enter instructor name"
              value={rowData?.instructor}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-(--primary-color) outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              name="category"
              value={rowData?.category}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-(--primary-color) outline-none"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Number of Members
            </label>
            <input
              type="number"
              name="members"
              placeholder="Enter number of members"
              value={rowData?.members}
              onChange={handleChange}
              min="1"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-(--primary-color) outline-none"
            />
          </div>

          {/* Progress */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Progress (%)
            </label>
            <input
              type="number"
              name="progress"
              placeholder="Enter progress percentage"
              value={rowData?.progress}
              onChange={handleChange}
              min="0"
              max="100"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-(--primary-color) outline-none"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              name="status"
              value={rowData?.status}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-(--primary-color) outline-none"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-md transition-all"
            >
              Save Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
