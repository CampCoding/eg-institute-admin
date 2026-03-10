"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, BookOpen, Loader2 } from "lucide-react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import axios from "axios";
import { BASE_URL } from "../../../../../utils/base_url";
import toast from "react-hot-toast";

export default function AddUnitPage() {
  const { unitId } = useParams();
  const router = useRouter();
  const [unitName, setUnitName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!unitName.trim()) {
      setError("Unit name is required");
      return;
    }

    const token = localStorage.getItem("AccessToken");
    setIsLoading(true);
    setError("");

    try {
      const res = await axios.post(
        BASE_URL + "/units/add_unit.php",
        { unit_title: unitName, course_id: unitId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res?.data?.status === "success") {
        toast.success(res?.data?.message);
        router.push(`/courses/units/${unitId}`);
      } else {
        toast.error(res?.data?.message);
      }
    } catch (e) {
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

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

      <BreadCrumb title="Add Unit" child="Add Unit" parent="Units" />

      {/* Form Card */}
      <div className="mt-6">
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-teal-600 to-cyan-600 p-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add New Unit</h2>
                <p className="text-white/80 text-sm mt-1">
                  Create a new unit for your course
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Unit Name <span className="text-rose-500">*</span>
              </label>
              <input
                value={unitName}
                onChange={(e) => {
                  setUnitName(e.target.value);
                  setError("");
                }}
                placeholder="Enter unit name..."
                className={`w-full px-4 py-3 rounded-xl border-2 outline-none transition-all ${
                  error
                    ? "border-rose-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200"
                    : "border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200"
                }`}
              />
              {error && (
                <p className="text-sm text-rose-600 mt-2 flex items-center gap-1">
                  <span className="w-1 h-1 bg-rose-500 rounded-full" />
                  {error}
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-teal-600 to-cyan-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-200 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Save Unit
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-200 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
