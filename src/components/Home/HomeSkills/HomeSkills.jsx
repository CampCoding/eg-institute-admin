"use client";
import React from "react";
import HomeCard from "../HomeCard/HomeCard";
import HomeCardHeader from "../HomeCardHeader/HomeCardHeader";
import { Clock, MessageSquare } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export default function HomeSkills({ skillsData, chartPalette, completion }) {
  return (
    <div>
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <HomeCard className="lg:col-span-2">
          <HomeCardHeader
            title="Skill Scores"
            subtitle="Average by cohort"
            icon={MessageSquare}
          />
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={skillsData}
                margin={{ left: 10, right: 10, top: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="skill" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {skillsData.map((_, idx) => (
                    <Cell key={idx} fill={chartPalette[idx]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </HomeCard>

        <HomeCard>
          <HomeCardHeader
            title="Course Completion"
            subtitle="Overall"
            icon={Clock}
          />
          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                innerRadius="60%"
                outerRadius="100%"
                data={completion}
                startAngle={90}
                endAngle={-270}
              >
                <RadialBar
                  minAngle={15}
                  background
                  clockWise
                  dataKey="value"
                  cornerRadius={14}
                />
                <Legend
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
                <Tooltip contentStyle={{ borderRadius: 12 }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div className="px-6 pb-5">
            <div className="flex items-center justify-between text-sm text-slate-600">
              <span>Completed</span>
              <span className="font-semibold text-slate-900">72%</span>
            </div>
            <div className="mt-2 h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full w-[72%] bg-teal-500" />
            </div>
          </div>
        </HomeCard>
      </div>
    </div>
  );
}
