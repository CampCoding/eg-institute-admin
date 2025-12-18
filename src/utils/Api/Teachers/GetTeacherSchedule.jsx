"use client";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../base_url";

async function fetchTeacherSchedule({ queryKey }) {
  const [, id] = queryKey; // ["teacherSchedule", id]
console.log(queryKey);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;

  const payload = { teacher_id: id };

  const res = await axios.post(
    `${BASE_URL}/teachers/teacher_schedule.php`,
    payload,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );

  return res.data;
}

export default function useGetTeacherSchedule(id) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;

  return useQuery({
    queryKey: ["teacherSchedule", id],
    queryFn: fetchTeacherSchedule,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: !!id && !!token,
  });
}
