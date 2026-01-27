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
import { Input, Select } from "antd";
import { SearchOutlined } from "@mui/icons-material";

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

export default function Page() {
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

        <div className="flex flex-col sm:flex-row items-stretch gap-3">
          {/* Search Input */}
          <Input
            placeholder="Search..."
            prefix={<SearchOutlined className="text-slate-400" />}
            className="w-full sm:w-72"
            styles={{
              input: {
                backgroundColor: "transparent",
              },
            }}
            style={{
              borderRadius: "12px",
              padding: "8px 12px",
              border: "1px solid #e2e8f0",
              backgroundColor: "rgba(255,255,255,0.8)",
              boxShadow: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
            }}
          />

          {/* Select Dropdown */}
          <Select
            placeholder="Select period"
            defaultValue="7days"
            size="large"
            style={{
              minWidth: 160,
            }}
            dropdownStyle={{
              borderRadius: "12px",
            }}
            options={[
              { value: "7days", label: "Last 7 days" },
              { value: "30days", label: "Last 30 days" },
              { value: "90days", label: "Last 90 days" },
            ]}
          />
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
}

// ---- UI Bits ----
