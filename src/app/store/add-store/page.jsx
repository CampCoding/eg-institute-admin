"use client";
import BreadCrumb from '@/components/BreadCrumb/BreadCrumb'
import BooksForm from '@/components/Store/StoreBooks/BooksForm/BooksForm';
import SuppliesForm from '@/components/Store/StoreSupplies/SuppliesForm/SuppliesForm';
import VideosForm from '@/components/Store/StoreVideos/VideosForm/VideosForm';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react'

const tabs = [
  {
    id:1,
    title:"Books"
  },
  {
    id:2,
    title:"Videos",
  },
  {
    id:3,
    title:"Supplies"
  },
]

export default function page() {
  const [activeTab , setActiveTab] = useState(1);
  const router = useRouter();
  
  return (
    <div>
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

      <BreadCrumb title={"Add Store"} parent={"Home"} child={"Store"}/>
      <div className="mt-5 px-4">
        {/* Tabs */}
        <div className="flex gap-4 items-center">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`cursor-pointer py-2 px-4 rounded-full text-sm font-medium transition-all border flex justify-center items-center
                ${activeTab === tab.id
                  ? "bg-gradient-to-bl from-teal-500 via-teal-600 to-teal-700 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-200 hover:text-gray-900"}`}
            >
              {tab.title}
            </div>
          ))}
        </div>


        {/* Forms */}
        {activeTab == 1 && <BooksForm />}
        {activeTab == 2 && <VideosForm />}
        {activeTab == 3 && <SuppliesForm />}
      </div>
    </div>
  )
}
