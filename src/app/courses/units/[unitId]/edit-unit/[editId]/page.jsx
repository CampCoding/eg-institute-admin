"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { courses } from "@/utils/data";
import { ArrowLeft, Pencil, Plus, Save, X } from "lucide-react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import axios from "axios";
import { BASE_URL } from "../../../../../../utils/base_url";
import toast from "react-hot-toast";

export default function EditUnitPage() {
  const { editId, unitId } = useParams();
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
    pdfs: [""],
  });

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
    setUnit((prevUnit) => ({ ...prevUnit, pdfs: [...prevUnit.pdfs, ""] }));
  };

  const removeVideo = (index) => {
    const updatedVideos = unit.videos.filter((_, i) => i !== index);
    setUnit((prevUnit) => ({ ...prevUnit, videos: updatedVideos }));
  };

  const removePdf = (index) => {
    const updatedPdfs = unit.pdfs.filter((_, i) => i !== index);
    setUnit((prevUnit) => ({ ...prevUnit, pdfs: updatedPdfs }));
  };

  const [selectedUnit, setSelectedUnit] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("AccessToken");
    axios
      .post(
        BASE_URL + "/units/select_course_units.php",
        { course_id: unitId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res) => {
        if (res?.data?.status == "success") {
          const filtered = res?.data?.message?.find(
            (item) => item?.unit_id == unitId
          );
          setUnit({ name: filtered?.unit_title });
          setSelectedUnit(filtered);
        }
      });
  }, [unitId]);

  useEffect(() => {
    setUnit({
      name: selectedUnit?.unit_title,
    });
  }, [selectedUnit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const token = localStorage.getItem("AccessToken");

    // Validate fields
    if (!unit.name) {
      alert("Please fill out all fields before submitting.");
      return;
    }
    const data_send = {
      unit_title: unit?.name,
      unit_id: editId,
    };
    setIsLoading(true);
    axios
      .post(BASE_URL + "/units/edit_unit.php", data_send, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        if (res?.data?.status == "success") {
          toast.success(res?.data?.message);
          router.push(`/courses/units/${unitId}`);
          setUnit({ name: "" });
        } else {
          toast.error(res?.data?.message);
        }
      })
      .catch((e) => console.log(e))
      .finally(() => setIsLoading(false));
  };

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

      <BreadCrumb title="Edit Unit" child="Units" parent="Course" />

      <form onSubmit={handleSubmit} className="mt-3 px-2 sm:px-4  grid gap-6">
        <div className="rounded-2xl">
          <div className="mt-4">
            <label className="text-sm font-medium">Unit Name</label>
            <input
              value={unit?.name}
              onChange={(e) => handleInputChange(e, "name")}
              placeholder="Enter unit name"
              className="mt-1 w-full rounded-xl border border-gray-500/50 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
            />
          </div>

          {/* Unit Lessons Count */}
          {/* <div className="mt-4">
            <label className="text-sm font-medium">Lessons Count</label>
            <input
              type="number"
onWheel={(e) => e.target.blur()}
              value={unit.lessonsCount}
              onChange={(e) => handleInputChange(e, "lessonsCount")}
              min={1}
              placeholder="Enter number of lessons"
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
            />
          </div> */}

          {/* Unit Videos */}
          {/* <div className="mt-4">
            <label className="text-sm font-medium">Unit Videos</label>
            {unit.videos.map((video, index) => (
              <div key={index} className="flex items-center gap-3 mt-2">
                <input
                  type="text"
                  value={video}
                  onChange={(e) => handleArrayChange(e, "videos", index)}
                  placeholder="Enter video Code"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                />
                <button
                  type="button"
                  onClick={() => removeVideo(index)}
                  className="rounded-full border border-slate-200 p-2"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addNewVideo}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)] text-white px-3 py-2 text-sm hover:opacity-90"
            >
              <Plus size={16} /> Add Video
            </button>
          </div> */}

          {/* Unit PDFs */}
          {/* <div className="mt-4">
            <label className="text-sm font-medium">Unit PDFs</label>
            {unit.pdfs.map((pdf, index) => (
              <div key={index} className="flex items-center gap-3 mt-2">
                <input
                  type="file"
                  value={pdf}
                  onChange={(e) => handleArrayChange(e, "pdfs", index)}
                  placeholder="Enter PDF URL"
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:ring-2 ring-[var(--primary-color)]"
                />
                <button
                  type="button"
                  onClick={() => removePdf(index)}
                  className="rounded-full border border-slate-200 p-2"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addNewPdf}
              className="mt-2 inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)] text-white px-3 py-2 text-sm hover:opacity-90"
            >
              <Plus size={16} /> Add PDF
            </button>
          </div> */}
        </div>

        {/* Actions */}
        <div className="flex items-center mt-2 gap-3">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--primary-color)] !text-white px-4 py-2 font-medium hover:opacity-90"
          >
            {isLoading ? (
              "Loading...."
            ) : (
              <div className="flex gap-1 items-center">
                {" "}
                <Save size={18} />
                Save Unit
              </div>
            )}
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
