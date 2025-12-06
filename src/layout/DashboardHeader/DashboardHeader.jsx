"use client";
import { Bell, Menu, Search } from 'lucide-react'
import { useRouter } from 'next/navigation';
import React from 'react'

export default function DashboardHeader({colors , setSidebarOpen}) {
  const router = useRouter();

  return (
    <header className="bg-white border-b border-dashed border-gray-200">
    <div className="flex items-center justify-between h-16 px-4 sm:px-6">
      <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="ml-2 lg:ml-0 text-2xl font-bold" style={{ color: colors.text }}>
          Dashboard
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button 
        onClick={() => router.push("/notifications")}
        className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg">
          <Bell className="w-6 h-6" />
          <span 
            className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs text-white flex items-center justify-center"
            style={{ backgroundColor: colors.accent }}
          >
            3
          </span>
        </button>
      </div>
    </div>
  </header>
  )
}
