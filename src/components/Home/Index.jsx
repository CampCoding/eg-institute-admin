"use client";
import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  PlayCircle,
  Target,
  TrendingUp,
  MessageSquare,
  Clock,
  Globe2,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import HomeCardHeader from "@/components/Home/HomeCardHeader/HomeCardHeader";
import HomeCard from "@/components/Home/HomeCard/HomeCard";
import HomeStatCard from "@/components/Home/HomeStatCard/HomeStatCard";
import HomeTopCourses from "@/components/Home/HomeTopCourses/HomeTopCourses";
import HomeSessions from "@/components/Home/HomeSessions/HomeSessions";
import HomeSkills from "@/components/Home/HomeSkills/HomeSkills";

// ---- Mock Data (replace with real API data) ----

const skillsData = [
  { skill: "Listening", score: 86 },
  { skill: "Speaking", score: 74 },
  { skill: "Reading", score: 91 },
  { skill: "Writing", score: 68 },
];

const completion = [
  { name: "Completed", value: 72, fill: "#02AAA0" },
  { name: "Remaining", value: 28, fill: "#E5E7EB" },
];

const topCourses = [
  {
    id: 1,
    title: "Arabic for Beginners — Letters & Sounds",
    dialect: "MSA",
    progress: 82,
    students: 1240,
  },
  {
    id: 2,
    title: "Egyptian Arabic: Daily Phrases (العامية)",
    dialect: "EGY",
    progress: 64,
    students: 980,
  },
  {
    id: 3,
    title: "MSA Pronunciation & Tajwīd Basics",
    dialect: "MSA",
    progress: 47,
    students: 720,
  },
];

const recentActivity = [
  {
    id: 1,
    user: "Omar Ali",
    action: "completed lesson",
    meta: "MSA Letters — ج ح خ",
    time: "2m",
  },
  {
    id: 2,
    user: "Mona Samir",
    action: "joined course",
    meta: "Egyptian Daily Phrases",
    time: "15m",
  },
  {
    id: 3,
    user: "Yousef Adel",
    action: "posted a question",
    meta: "How to pronounce ق?",
    time: "32m",
  },
  {
    id: 4,
    user: "Lina Ahmed",
    action: "earned badge",
    meta: "7-day streak",
    time: "1h",
  },
];

// Neutral color palette for charts (Tailwind-like)
const chartPalette = [
  "#0EA5E9",
  "#22C55E",
  "#F59E0B",
  "#6366F1",
  "#EF4444",
  "#14B8A6",
]; // teal-ish and friends
const Dashboard = () => {
  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Arabic Learning Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Monitor learner progress across Modern Standard Arabic (الفصحى) and
            Egyptian Arabic (العامية).
          </p>
        </div>

        {/* Search + Filters */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full sm:w-72 rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 shadow-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100"
            />
            <span className="absolute right-3 top-2.5 text-slate-400 text-sm">
              ⌘K
            </span>
          </div>
          <select className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 shadow-sm outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-100">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>Last 90 days</option>
          </select>
        </div>
      </div>
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <HomeStatCard
          icon={Users}
          color={"bg-teal-400"}
          title="Total Learners"
          value="3,482"
          delta="+6.2%"
          alt="vs last week"
        />
        <HomeStatCard
          icon={BookOpen}
          color={"bg-fuchsia-400"}
          title="Active Courses"
          value="24"
          delta="+2"
          alt="new this week"
        />
        <HomeStatCard
          icon={PlayCircle}
          color={"bg-amber-600"}
          title="Lessons Completed"
          value="18,905"
          delta="+1,120"
          alt="last 7 days"
        />
        <HomeStatCard
          icon={Target}
          color={"bg-emerald-400"}
          title="Avg. Completion"
          value="72%"
          delta="+4%"
          alt="course avg"
          highlight
        />
      </div>
      {/* Charts Row */}
      <HomeSessions />
      {/* Skills & Completion Row */}
      <HomeSkills
        chartPalette={chartPalette}
        completion={completion}
        skillsData={skillsData}
      />
      {/* Top Courses */}
      <HomeTopCourses recentActivity={recentActivity} topCourses={topCourses} />
    </div>
  );
};
export default Dashboard;
// ---- UI Bits ----
