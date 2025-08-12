"use client";
import React, { useEffect, useState } from "react";
import BreadCrumb from "@/components/BreadCrumb/BreadCrumb";
import { DollarSign, Calendar, FileText, CheckCircle, ArrowLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { finance_transactions } from "@/utils/data";

export default function EditFinanceTransactionPage() {
    const {id} = useParams();
  const [formData, setFormData] = useState({
    date: "",
    description: "",
    type: "income",
    amount: "",
    status: "completed",
  });
  const [rowData , setRowData] = useState({});
  const  router = useRouter();
  const handleChange = (e) => {
    setRowData({
      ...rowData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Transaction Added: " + JSON.stringify(formData, null, 2));
    // Here you can send data to your backend
  };

  useEffect(() => {
     if(id) {
        setRowData(finance_transactions?.find(item => item?.id == id));
     }
  }  , [id] )

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

      <BreadCrumb title={"Edit Finance Transaction"} parent={"Finance"} child={"Edit Transaction"} />

      <div className="mt-5 px-2 sm:px-4 bg-white rounded-2xl">

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="date"
                name="date"
                value={rowData.date}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                name="description"
                value={rowData.description}
                onChange={handleChange}
                placeholder="e.g. Course Payment, Utility Bill"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="type"
              value={rowData.type}
              onChange={handleChange}
              className="w-full pl-4 pr-8 py-3 border border-gray-200 focus:outline-none rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              required
            >
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="number"
                name="amount"
                value={rowData.amount}
                onChange={handleChange}
                placeholder="Enter amount"
                className="w-full pl-10 pr-4 py-3 border focus:outline-none border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              name="status"
              value={rowData.status}
              onChange={handleChange}
              className="w-full pl-4 pr-8 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:outline-none focus:border-transparent"
            >
              <option value="completed">Completed</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 shadow-lg transition-all duration-200"
            >
              <CheckCircle size={20} /> Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
