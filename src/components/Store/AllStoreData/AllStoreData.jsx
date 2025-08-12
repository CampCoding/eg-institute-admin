'use client';
import React, { useState } from 'react';
import BreadCrumb from '@/components/BreadCrumb/BreadCrumb';
import { PRODUCTS } from '@/utils/data'; // Assuming PRODUCTS is imported here
import StoreCard from '../StoreCard/StoreCard';

const tabs = [
  { id: 1, title: 'All' },
  { id: 2, title: 'Books' },
  { id: 3, title: 'Videos' },
  { id: 4, title: 'Supplies' },
];

export default function AllStoreData() {
  const [activeTab, setActiveTab] = useState(1);

  // Filter products based on the active tab
  const filteredProducts = PRODUCTS.filter((product) => {
    if (activeTab === 1) return true; // Show all products
    if (activeTab === 2) return product.type === 'books'; // Filter books
    if (activeTab === 3) return product.type === 'videos'; // Filter videos
    if (activeTab === 4) return product.type === 'supplies'; // Filter supplies
  });

  return (
    <div className="min-h-screen">
      <BreadCrumb title={"Store"} child={"Store"} parent={"Home"} />

      {/* Tab Navigation */}
      <div className="mt-5 px-4">
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
      </div>

      {/* Content for active tab */}
      <div className="mt-6 p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProducts.map((product) => (
            <StoreCard
              key={product.id}
              p={product}
              PRIMARY="#0284C7" // Primary color for the card
              PRIMARY_DARK="#0369A1" // Darker primary color for hover effects
              PRIMARY_LIGHT="#D1E9FF" // Lighter primary color for hover effects
            />
          ))}
        </div>
      </div>
    </div>
  );
}
