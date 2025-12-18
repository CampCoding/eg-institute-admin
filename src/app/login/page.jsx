"use client";
import axios from "axios";
import React, { useState } from "react";
import { BASE_URL } from "../../utils/base_url";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const page = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios
      .post(BASE_URL + "/auth/admin_login.php", formData)
      .then((res) => {
        if (res.data.status === "success") {
          toast.success("Login successful!");
          localStorage.setItem("AccessToken", res.data.message.access_token);
          localStorage.setItem("RefreshToken", res.data.message.refresh_token);
          localStorage.setItem("UserId", res.data.message.admin_id);

          setTimeout(() => {
            window.location.href = "/";
          }, 1000);
        } else {
          toast.error(res.data.message);
        }
      })
      .catch((error) => {
        console.error("Login error:", error);
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/logo.png" alt="" className="w-[120px] m-auto " />
          <h1 className="text-3xl font-bold text-gray-800">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Please login to your account</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02aaa0] focus:border-transparent outline-none transition"
              placeholder="you@example.com"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#02aaa0] focus:border-transparent outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {/* Remember Me & Forgot Password */}
          {/* <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="w-4 h-4 text-[#02aaa0] border-gray-300 rounded focus:ring-[#02aaa0]"
              />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm text-[#02aaa0] hover:text-[#02aaa0]">
              Forgot password?
            </a>
          </div> */}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-[#02aaa0] !text-white py-3 rounded-lg font-semibold hover:bg-[#027971] transition duration-200 shadow-md hover:shadow-lg"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default page;
