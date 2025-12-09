"use client";

import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../base_url";

async function fetchBlogs() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;

  if (!token) {
    const err = new Error("You are not authorized. Please log in.");
    err.status = 401;
    throw err;
  }

  try {
    const res = await axios.get(`${BASE_URL}/blogs/select_blogs.php`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (res.data?.status !== "success") {
      throw new Error(res.data?.message || "Failed to load blogs");
    }

    return res.data?.message || [];
  } catch (err) {
    if (err.code === "ECONNABORTED") {
      throw new Error("Request timeout. Please try again.");
    }

    const status = err.response?.status;

    if (status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("AccessToken");
        window.location.href = "/login";
      }
      throw new Error("Session expired. Please log in again.");
    }

    if (status === 403) {
      throw new Error("Access forbidden.");
    }

    throw new Error(
      err.response?.data?.message || "Network error. Check your connection."
    );
  }
}

export default function useGetBlogs() {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;

  return useQuery({
    queryKey: ["blogs"],
    queryFn: fetchBlogs,
    enabled: !!token, // مش هيعمل request لو مفيش token
    retry: 1,
    refetchOnWindowFocus: false,
  });
}
