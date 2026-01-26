"use client";
import React, { useEffect, useMemo, useState } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { ArrowLeft, DollarSign, Plus, RotateCcw, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";

// ---- Mock data (replace with your API) ----
const TEACHERS = [
  { id: "t1", name: "Ms. Sarah Johnson" },
  { id: "t2", name: "Mr. Adam Brown" },
  { id: "t3", name: "Dr. Lina Ahmed" },
];

export default function page() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(true);

  // Form state
  const [form, setForm] = useState({
    payerType: "Teacher", // "Teacher" | "Student"
    teacherId: "",
    studentName: "",
    amount: "",
    date: "",
    notes: "",
  });

  // Basic errors
  const [errors, setErrors] = useState({});

  // Prefill date to now (local) for datetime-local input
  useEffect(() => {
    const now = new Date();
    const tzOffset = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const isoLocal = tzOffset.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
    setForm((f) => ({ ...f, date: isoLocal }));
  }, []);

  const resetForm = () => {
    setForm({
      payerType: "Teacher",
      teacherId: "",
      studentName: "",
      amount: "",
      date: "",
      notes: "",
    });
    setErrors({});
  };

  const validate = () => {
    const e = {};
    if (!form.payerType) e.payerType = "Please choose payer type.";
    if (form.payerType === "Teacher" && !form.teacherId)
      e.teacherId = "Please select a teacher.";
    if (form.payerType === "Student" && !form.studentName.trim())
      e.studentName = "Please enter student name.";
    if (!form.amount || Number(form.amount) <= 0)
      e.amount = "Enter a valid amount.";
    if (!form.date) e.date = "Choose date & time.";
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const eObj = validate();
    setErrors(eObj);
    if (Object.keys(eObj).length) return;

    // ---- Submit payload (replace with your API call) ----
    const payload = {
      payerType: form.payerType,
      teacherId: form.payerType === "Teacher" ? form.teacherId : null,
      studentName:
        form.payerType === "Student" ? form.studentName.trim() : null,
      amount: Number(form.amount),
      date: new Date(form.date).toISOString(),
      notes: form.notes.trim() || null,
    };

    console.log("Submitting receivable:", payload);
    // TODO: await api.post('/receivables', payload)

    // Simple success UX
    alert("Receivable added successfully ✅");
    resetForm();
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

      <BreadCrumb title="Add Due" parent={"Home"} child={"Add Due"} />

      <div className="mt-5 w-full gap-6">
        {/* Left column: the form */}
        <div
          className={`${showForm ? "block" : "hidden lg:block"} lg:col-span-2`}
        >
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <Plus className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Add Receivable
                </h3>
              </div>
              {showForm && (
                <button
                  onClick={() => setShowForm(false)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Payer Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payer Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Teacher", "Student"].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setForm({ ...form, payerType: type })}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                        form.payerType === type
                          ? "bg-blue-50 border-blue-200 text-blue-700"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                {errors.payerType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.payerType}
                  </p>
                )}
              </div>

              {/* Teacher / Student fields */}
              {form.payerType === "Teacher" ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teacher
                  </label>
                  <select
                    value={form.teacherId}
                    onChange={(e) =>
                      setForm({ ...form, teacherId: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select teacher...</option>
                    {TEACHERS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                  {errors.teacherId && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.teacherId}
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student Name
                  </label>
                  <input
                    type="text"
                    value={form.studentName}
                    onChange={(e) =>
                      setForm({ ...form, studentName: e.target.value })
                    }
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter student name..."
                  />
                  {errors.studentName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.studentName}
                    </p>
                  )}
                </div>
              )}

              {/* Amount + Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      onWheel={(e) => e.target.blur()}
                      min="0"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) =>
                        setForm({ ...form, amount: e.target.value })
                      }
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-red-500 text-xs mt-1">{errors.amount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.date && (
                    <p className="text-red-500 text-xs mt-1">{errors.date}</p>
                  )}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  rows={3}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Add any notes or description..."
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 text-white px-4 py-3 text-sm font-medium hover:bg-teal-700 transition-colors shadow-sm"
                >
                  <Save className="h-4 w-4" />
                  Add Receivable
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                  title="Reset form"
                >
                  <RotateCcw className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right column: helper/preview */}
      </div>
    </div>
  );
}
