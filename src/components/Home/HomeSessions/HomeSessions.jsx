"use client";
import React from "react";
import HomeCard from "../HomeCard/HomeCard";
import HomeCardHeader from "../HomeCardHeader/HomeCardHeader";
import { Globe2, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const dailySessions = [
  { day: "Mon", sessions: 320 },
  { day: "Tue", sessions: 380 },
  { day: "Wed", sessions: 355 },
  { day: "Thu", sessions: 410 },
  { day: "Fri", sessions: 465 },
  { day: "Sat", sessions: 530 },
  { day: "Sun", sessions: 505 },
];

const dialectSplit = [
  { name: "MSA (الفصحى)", value: 62 },
  { name: "Egyptian (العامية)", value: 38 },
];


const chartPalette = ["#0EA5E9", "#22C55E", "#F59E0B", "#6366F1", "#EF4444", "#14B8A6"]; // teal-ish and friends


export default function HomeSessions() {
  return (
    <div>
      <div className="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Daily Sessions */}
        <HomeCard className="xl:col-span-2">
          <HomeCardHeader
            title="Daily Study Sessions"
            subtitle="Last 7 days"
            icon={TrendingUp}
          />
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={dailySessions}
                margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke={chartPalette[0]}
                  strokeWidth={3}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </HomeCard>

        {/* Dialect Split */}
        <HomeCard>
          <HomeCardHeader
            title="Dialect Split"
            subtitle="Learner preference"
            icon={Globe2}
          />
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dialectSplit}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {dialectSplit.map((_, idx) => (
                    <Cell key={idx} fill={chartPalette[idx]} />
                  ))}
                </Pie>
                <Legend verticalAlign="bottom" height={36} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </HomeCard>
      </div>
    </div>
  );
}
