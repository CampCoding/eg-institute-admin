"use client";
import React from "react";
import { CalendarDays, DollarSign, Users } from "lucide-react";

export default function ReportIncomes() {
  // Sample data
  const incomes = [
    { date: "2025-08-01", amount: 1500, people: 12 },
    { date: "2025-08-05", amount: 2100, people: 18 },
    { date: "2025-08-10", amount: 900, people: 6 },
    { date: "2025-08-11", amount: 3200, people: 25 },
  ];

  return (
    <div className="min-h-screen mt-5">
   

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {incomes.map((item, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition-shadow transform hover:scale-105 p-6 border border-gray-300"
          >
            {/* Card Header */}
            <div className="flex  justify-between items-center mb-4">
              <h3 className="text-xl font-medium text-gray-800">Report {index + 1}</h3>
              <CalendarDays className="text-blue-500" size={24} />
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 mb-3">
              <span className="font-medium text-gray-600">
                {new Date(item.date).toLocaleDateString()}
              </span>
            </div>

            {/* Income */}
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="text-green-500" size={24} />
              <span className="text-2xl font-semibold text-gray-800">
                ${item.amount.toLocaleString()}
              </span>
            </div>

            {/* People Paid */}
            <div className="flex items-center gap-2">
              <Users className="text-purple-500" size={24} />
              <span className="text-lg font-medium text-gray-700">
                {item.people} people paid
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
