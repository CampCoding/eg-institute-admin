'use client';
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { courses } from "@/utils/data"; // assuming the courses data is imported from here
import { ArrowLeft, Pencil, Plus, Save, X } from "lucide-react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";

export default function AddUnitPage() {
  const { unitId } = useParams();
  const router = useRouter();
  const [openDeleteModal, setOpenDeleteModal] = useState(false);

  const [course, setCourse] = useState(
    courses?.find((c) => c.id === parseInt(unitId))
  );
  const [unit, setUnit] = useState({
    name: "",
    unitNumber: course?.units?.length + 1 || 1,
    lessonsCount: 0,
    videos: [""],
    pdfs: [],
  });

  // Handle input change for unit name, videos, and PDFs
  const handleInputChange = (e, field) => {
    const { value } = e.target;
    setUnit((prevUnit) => ({ ...prevUnit, [field]: value }));
  };

  const handleArrayChange = (e, field, index) => {
    const { value } = e.target;
    const updatedArray = [...unit[field]];
    updatedArray[index] = value;
    setUnit((prevUnit) => ({ ...prevUnit, [field]: updatedArray }));
  };

  const addNewVideo = () => {
    setUnit((prevUnit) => ({ ...prevUnit, videos: [...prevUnit.videos, ""] }));
  };

  const addNewPdf = () => {
    setUnit((prevUnit) => ({ ...prevUnit, pdfs: [...prevUnit.pdfs, null] }));
  };

  const removeVideo = (index) => {
    const updatedVideos = unit.videos.filter((_, i) => i !== index);
    setUnit((prevUnit) => ({ ...prevUnit, videos: updatedVideos }));
  };

  const removePdf = (index) => {
    const updatedPdfs = unit.pdfs.filter((_, i) => i !== index);
    setUnit((prevUnit) => ({ ...prevUnit, pdfs: updatedPdfs }));
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0]; // Get the file selected by the user
    const updatedPdfs = [...unit.pdfs];
    updatedPdfs[index] = file; // Set the file object in the array
    setUnit((prevUnit) => ({ ...prevUnit, pdfs: updatedPdfs }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate fields
    if (!unit.name || !unit.pdfs.length) {
      alert("Please fill out all fields before submitting.");
      return;
    }

    const newUnit = {
      ...unit,
      unitId: course.units.length + 1,
      unitNumber: course.units.length + 1,
    };

    const updatedCourse = {
      ...course,
      units: [...course.units, newUnit],
    };

    // Save the updated course (this is a placeholder, replace with your actual saving method)
    if (typeof window !== "undefined") {
      const updatedCourses = courses.map((c) =>
        c.id === course.id ? updatedCourse : c
      );
      localStorage.setItem("courses", JSON.stringify(updatedCourses));
    }

    router.push(`/courses/${course.id}`);
  };

  return (
    <div className="min-h-screen p-6">
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

      <BreadCrumb title="Add PDF" child="PDFs" parent="Add PDF" />

      <form onSubmit={handleSubmit} className="mt-3 px-2 sm:px-4 grid gap-6">
        <div className="rounded-2xl">
          <div className="mt-4">
            <label className="text-sm font-medium">Unit Title</label>
            <input
              value={unit.name}
              onChange={(e) => handleInputChange(e, "name")}
              placeholder="Enter unit name"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
            />
          </div>

          {/* PDF File Upload */}
          <div className="mt-4 flex flex-col">
            <label className="text-sm font-medium">Upload PDFs</label>
            {unit.pdfs.map((pdf, index) => (
              <div key={index} className="flex items-center gap-4 mt-2">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileChange(e, index)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                />
                <button
                  type="button"
                  onClick={() => removePdf(index)}
                  className="bg-red-600 text-white p-2 rounded-full"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addNewPdf}
              className="mt-4  w-fit flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700"
            >
              <Plus size={16} /> Add another PDF
            </button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)] text-white px-4 py-2 font-medium hover:opacity-90"
          >
            <Save size={18} />
            Save Unit
          </button>
          <button
            type="button"
            onClick={() => router.push(`/courses/${course.id}`)}
            className="rounded-xl border border-slate-200 px-4 py-2 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
