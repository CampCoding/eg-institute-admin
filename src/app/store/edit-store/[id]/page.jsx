"use client";
import BreadCrumb from '@/components/BreadCrumb/BreadCrumb'
import EditBooksForm from '@/components/Store/StoreBooks/EditBooksForm/EditBooksForm';
import EditSuppliesForm from '@/components/Store/StoreSupplies/EditSuppliesForm/EditSuppliesForm';
import EditVideosForm from '@/components/Store/StoreVideos/EditVideosForm/EditVideosForm';
import { PRODUCTS } from '@/utils/data';
import { ArrowLeft } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'

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
    const router = useRouter();
    const {id} = useParams();
    const [activeTab , setActiveTab] = useState(1);
    const [rowData ,setRowData] = useState({});

    useEffect(() => {
        if(id) {
        setRowData(PRODUCTS?.find(prod => prod?.id == id));
        }
        else {
            setRowData({})
        }
    } , [id])
    

  return (
    <div>
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

      <BreadCrumb title={"Edit Store"} parent={"Home"} child={"Store"}/>
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

        {activeTab == 1  && <EditBooksForm rowData={rowData?.subtype == "books" && rowData} setRowData={rowData?.subtype == "books"  && setRowData}/>}
        {activeTab == 2 && <EditVideosForm rowData={rowData?.subtype == "videos"  && rowData} setRowData={rowData?.subtype == "videos"  && setRowData}/>}
        {activeTab == 3 && <EditSuppliesForm  rowData={rowData?.subtype != "books" && rowData?.subtype !="videos" && rowData} setRowData={rowData?.subtype != "books" && rowData?.subtype !="videos" && setRowData}/>}
      </div>
    </div>
    </div>
  )
}
