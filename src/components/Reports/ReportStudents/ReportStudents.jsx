"use client";
import React, { useState } from "react";
import { BookOpen, CheckCircle, Users, Eye, FileText, Search, Filter, Clock, Award, TrendingUp, ChevronDown, ChevronUp, BarChart3, GraduationCap } from "lucide-react";

export default function ReportStudents() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDetails, setShowDetails] = useState(null);
  const [sortBy, setSortBy] = useState("name");

  // Enhanced sample data for students
  const students = [
    {
      id: 1,
      name: "محمد حسين",
      email: "mohammed.hussein@email.com",
      logins: 45,
      totalHours: 22,
      completionRate: 85,
      lastLogin: "2025-08-10",
      status: "active",
      level: "intermediate",
      courses: [
        { title: "Introduction to Arabic", hours: 10, completion: 100, status: "completed" },
        { title: "Advanced Arabic Grammar", hours: 12, completion: 75, status: "in-progress" },
      ],
      exams: [
        { name: "Arabic Exam 1", score: 88, date: "2025-07-15", status: "passed" },
        { name: "Arabic Final Exam", score: 92, date: "2025-08-05", status: "passed" }
      ],
      books: [
        { title: "Arabic for Beginners", progress: 100, status: "completed" },
        { title: "Advanced Arabic Syntax", progress: 60, status: "reading" }
      ],
    },
    {
      id: 2,
      name: "ليلى سامي",
      email: "layla.samy@email.com",
      logins: 28,
      totalHours: 14,
      completionRate: 70,
      lastLogin: "2025-08-08",
      status: "active",
      level: "beginner",
      courses: [
        { title: "Modern Arabic Literature", hours: 8, completion: 90, status: "in-progress" },
        { title: "Egyptian Dialect", hours: 6, completion: 50, status: "in-progress" },
      ],
      exams: [
        { name: "Literature Exam", score: 78, date: "2025-07-20", status: "passed" },
        { name: "Egyptian Dialect Exam", score: 65, date: "2025-08-01", status: "passed" }
      ],
      books: [
        { title: "Egyptian Dialect: A Guide", progress: 80, status: "reading" },
        { title: "Literature of the Arab World", progress: 45, status: "reading" }
      ],
    },
    {
      id: 3,
      name: "أحمد علي",
      email: "ahmed.ali@email.com",
      logins: 62,
      totalHours: 35,
      completionRate: 95,
      lastLogin: "2025-08-11",
      status: "active",
      level: "advanced",
      courses: [
        { title: "Classical Arabic Poetry", hours: 15, completion: 100, status: "completed" },
        { title: "Arabic Calligraphy", hours: 20, completion: 90, status: "in-progress" },
      ],
      exams: [
        { name: "Poetry Analysis Exam", score: 95, date: "2025-07-25", status: "passed" },
        { name: "Calligraphy Practical", score: 89, date: "2025-08-03", status: "passed" }
      ],
      books: [
        { title: "Classical Arabic Poetry Collection", progress: 100, status: "completed" },
        { title: "The Art of Arabic Calligraphy", progress: 75, status: "reading" }
      ],
    },
  ];

  // Filter and sort students
  const filteredStudents = students
    .filter(student => 
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "name": return a.name.localeCompare(b.name);
        case "logins": return b.logins - a.logins;
        case "hours": return b.totalHours - a.totalHours;
        case "completion": return b.completionRate - a.completionRate;
        default: return 0;
      }
    });

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800 border-green-200";
      case "inactive": return "bg-red-100 text-red-800 border-red-200";
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case "beginner": return "bg-blue-100 text-blue-800";
      case "intermediate": return "bg-purple-100 text-purple-800";
      case "advanced": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCompletionColor = (rate) => {
    if (rate >= 80) return "text-green-600 bg-green-100";
    if (rate >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  // Calculate statistics
  const totalStudents = students.length;
  const activeStudents = students.filter(s => s.status === "active").length;
  const averageCompletion = Math.round(students.reduce((sum, s) => sum + s.completionRate, 0) / totalStudents);
  const totalHours = students.reduce((sum, s) => sum + s.totalHours, 0);

  return (
    <div className="min-h-screen">
      <div className="mt-5">
        {/* Header Section */}
        <div className="mb-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Students</p>
                  <p className="text-3xl font-bold text-gray-900">{totalStudents}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Students</p>
                  <p className="text-3xl font-bold text-green-600">{activeStudents}</p>
                </div>
                <div className="p-3 bg-green-100 rounded-xl">
                  <TrendingUp className="w-8 h-8 text-green-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg. Completion</p>
                  <p className="text-3xl font-bold text-purple-600">{averageCompletion}%</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-xl">
                  <BarChart3 className="w-8 h-8 text-purple-600" />
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Hours</p>
                  <p className="text-3xl font-bold text-orange-600">{totalHours}</p>
                </div>
                <div className="p-3 bg-orange-100 rounded-xl">
                  <Clock className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-white/20 backdrop-blur-sm mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search Input */}
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by student name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              
              {/* Sort Filter */}
              <div className="relative">
                <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="pl-12 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white min-w-[160px]"
                >
                  <option value="name">Sort by Name</option>
                  <option value="logins">Sort by Logins</option>
                  <option value="hours">Sort by Hours</option>
                  <option value="completion">Sort by Completion</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Students Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredStudents.map((student) => (
            <div
              key={student.id}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-white/20 backdrop-blur-sm overflow-hidden"
            >
              {/* Card Header */}
              <div className="bg-gradient-to-r from-teal-500 to-emerald-500 p-6 text-white">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-xl mb-1">{student.name}</h3>
                    <p className="text-indigo-100 text-sm mb-2">{student.email}</p>
                    <div className="flex items-center gap-2 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(student.level)}`}>
                        {student.level}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(student.status)}`}>
                        {student.status}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowDetails(showDetails === student.id ? null : student.id)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {showDetails === student.id ? 
                      <ChevronUp className="w-5 h-5" /> : 
                      <ChevronDown className="w-5 h-5" />
                    }
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{student.logins}</p>
                    <p className="text-xs text-indigo-100">Logins</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{student.totalHours}</p>
                    <p className="text-xs text-indigo-100">Hours</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{student.completionRate}%</p>
                    <p className="text-xs text-indigo-100">Complete</p>
                  </div>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6">
                {/* Last Login */}
                <div className="flex items-center justify-between mb-4 text-sm text-gray-600">
                  <span>Last Login:</span>
                  <span className="font-medium">{new Date(student.lastLogin).toLocaleDateString()}</span>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                    <span className={`text-sm font-bold px-2 py-1 rounded ${getCompletionColor(student.completionRate)}`}>
                      {student.completionRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-teal-500 to-cyan-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${student.completionRate}%` }}
                    ></div>
                  </div>
                </div>

                {/* Details Section */}
                {showDetails === student.id && (
                  <div className="space-y-6 mt-6 pt-6 border-t border-gray-100">
                    {/* Courses */}
                    <div>
                      <h4 className="font-semibold text-lg text-gray-800 mb-3 flex items-center gap-2">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <BookOpen className="w-4 h-4 text-blue-600" />
                        </div>
                        Courses ({student.courses.length})
                      </h4>
                      <div className="space-y-3">
                        {student.courses.map((course, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-800">{course.title}</h5>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                course.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {course.status}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">{course.hours} hours</span>
                              <span className="text-sm font-medium">{course.completion}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${course.completion}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Exams */}
                    <div>
                      <h4 className="font-semibold text-lg text-gray-800 mb-3 flex items-center gap-2">
                        <div className="p-2 bg-green-50 rounded-lg">
                          <Award className="w-4 h-4 text-green-600" />
                        </div>
                        Exams ({student.exams.length})
                      </h4>
                      <div className="space-y-3">
                        {student.exams.map((exam, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-1">
                              <h5 className="font-medium text-gray-800">{exam.name}</h5>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                exam.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {exam.status}
                              </span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-600">
                              <span>Score: <span className="font-bold text-gray-800">{exam.score}%</span></span>
                              <span>{new Date(exam.date).toLocaleDateString()}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Books */}
                    <div>
                      <h4 className="font-semibold text-lg text-gray-800 mb-3 flex items-center gap-2">
                        <div className="p-2 bg-purple-50 rounded-lg">
                          <FileText className="w-4 h-4 text-purple-600" />
                        </div>
                        Books ({student.books.length})
                      </h4>
                      <div className="space-y-3">
                        {student.books.map((book, index) => (
                          <div key={index} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h5 className="font-medium text-gray-800">{book.title}</h5>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                book.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                              }`}>
                                {book.status}
                              </span>
                            </div>
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm text-gray-600">Progress</span>
                              <span className="text-sm font-medium">{book.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${book.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* View Details Button */}
                {showDetails !== student.id && (
                  <button
                    onClick={() => setShowDetails(student.id)}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600 rounded-xl hover:from-blue-100 hover:to-purple-100 transition-all font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredStudents.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Users className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No students found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}