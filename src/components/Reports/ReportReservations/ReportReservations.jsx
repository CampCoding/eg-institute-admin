"use client";
import React, { useState } from "react";
import { Pencil, Eye, Calendar, User, GraduationCap, BookOpen, Filter, Search, MoreVertical } from "lucide-react";

export default function ReportReservations() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState("all");

  // Sample data for reservations related to Arabic learning
  const reservations = [
    { date: "2025-08-01", instructor: "أحمد علي", student: "محمد حسين", subject: "Egyptian Arabic", id: 1, status: "confirmed", time: "10:00 AM" },
    { date: "2025-08-05", instructor: "مريم فاطمة", student: "ليلى سامي", subject: "Modern Arabic", id: 2, status: "pending", time: "2:00 PM" },
    { date: "2025-08-10", instructor: "حسن مصطفى", student: "عادل يوسف", subject: "Egyptian Arabic", id: 3, status: "confirmed", time: "11:30 AM" },
    { date: "2025-08-11", instructor: "سارة محمد", student: "نور علي", subject: "Modern Arabic", id: 4, status: "confirmed", time: "3:15 PM" },
    { date: "2025-08-15", instructor: "جمال عبد الرحمن", student: "سلمى عادل", subject: "Egyptian Arabic", id: 5, status: "cancelled", time: "9:00 AM" },
    { date: "2025-08-20", instructor: "كريم محمود", student: "زهراء جمال", subject: "Modern Arabic", id: 6, status: "confirmed", time: "1:00 PM" },
  ];

  // Get unique subjects for filter
  const subjects = [...new Set(reservations.map(r => r.subject))];

  // Filter reservations based on search and subject
  const filteredReservations = reservations.filter(reservation => {
    const matchesSearch = 
      reservation.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.instructor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      reservation.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSubject = filterSubject === "all" || reservation.subject === filterSubject;
    
    return matchesSearch && matchesSubject;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "bg-green-100 text-green-800 border-green-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "cancelled": return "bg-red-100 text-red-800 border-red-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getSubjectIcon = (subject) => {
    const iconMap = {
      "Egyptian Arabic": "🌍",
      "Modern Arabic": "📖"
    };
    return iconMap[subject] || "📚";
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Reservations Grid */}
        <div className="grid mt-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredReservations.map((reservation) => (
            <div
              key={reservation.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20 backdrop-blur-sm overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-teal-500 to-emerald-600 p-4 text-white">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getSubjectIcon(reservation.subject)}</span>
                    <div>
                      <h3 className="font-bold text-lg">{reservation.subject}</h3>
                      <p className="text-blue-100 text-sm">{reservation.time}</p>
                    </div>
                  </div>
                  <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-100">
                  <Calendar className="w-4 h-4" />
                  {new Date(reservation.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Status Badge */}
                <div className="mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(reservation.status)}`}>
                    {reservation.status.charAt(0).toUpperCase() + reservation.status.slice(1)}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <GraduationCap className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Instructor</p>
                      <p className="font-semibold">{reservation.instructor}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-gray-700">
                    <div className="p-2 bg-green-50 rounded-lg">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">Student</p>
                      <p className="font-semibold">{reservation.student}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredReservations.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Calendar className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No reservations found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
