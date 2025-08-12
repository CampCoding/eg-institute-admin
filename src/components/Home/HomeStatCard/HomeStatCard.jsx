"use client";
import { motion } from "framer-motion";

export default function HomeStatCard({
  icon: Icon,
  title,
  color,
  value,
  delta,
  alt,
  highlight = false,
}) {
  console.log(color);
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl  
        relative border overflow-hidden border-slate-200 bg-white/80 p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div
        className={`absolute cursor-none rounded-full -top-10 -right-14 w-20 h-20 ${color}`}
      ></div>
      <div className="flex items-center justify-between">
        <div className="h-12 w-12 rounded-2xl bg-teal-50 flex items-center justify-center">
          <Icon
            className={`h-6 w-6 ${
              highlight ? "text-teal-600" : "text-slate-600"
            }`}
          />
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500">{title}</p>
          <p className="text-2xl font-bold text-slate-900 tracking-tight">
            {value}
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            {delta} <span className="text-slate-400">{alt}</span>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
