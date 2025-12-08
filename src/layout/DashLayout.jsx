"use client";
import React, { useState } from "react";
import Sidebar from "./Sidebar/Sidebar";
import DashboardHeader from "./DashboardHeader/DashboardHeader";

const DashLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const colors = {
    primary: "#02AAA0",
    secondary: "#C9AE6C",
    accent: "#4ade80",
    background: "#f3f4f6",
    text: "#111827",
  };

  let AccessToken = null;

  if (typeof window !== "undefined") {
    const tokenString = localStorage.getItem("AccessToken");
    try {
      AccessToken = tokenString ? tokenString : null;
    } catch (e) {
      console.error("Invalid AccessToken JSON:", e);
      AccessToken = null;
    }
  }
  console.log(AccessToken);

  if (!AccessToken) {
    if (window.location.pathname != "/login") {
      window.location.href = "/login";
    }
    return <>{children}</>;
  }

  return (
    <div
      className="min-h-screen flex max-h-[100vh] overflow-hidden"
      style={{ backgroundColor: colors.background }}
    >
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Sidebar
        colors={colors}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div className="flex flex-col w-full min-h-screen">
        <DashboardHeader colors={colors} setSidebarOpen={setSidebarOpen} />

        <main className=" bg-white min-h-screen relative shadow-2xl h-auto  overflow-auto  m-5 rounded-2xl p-4 sm:p-6">
          {/* <div className="absolute cursor-none w-30 h-30 rounded-full bg-gradient-to-br from-teal-400 blur-3xl via-teal-600 to-teal-800 -top-10 -right-10"></div> */}
          {/* <div className="absolute cursor-none w-30 h-30 rounded-full bg-gradient-to-bl from-[#4ade80] blur-3xl via-[#349b5a] to-[#1e5933] -bottom-0 -left-0"></div> */}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashLayout;
