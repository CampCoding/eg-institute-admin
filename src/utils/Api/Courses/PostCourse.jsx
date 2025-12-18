"use client";

import { BASE_URL } from "../../base_url";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postCourse({ payload, type = "add", id }) {
  const body = { ...payload };

  if (type === "edit") {
    body.teacher_id = id;
  }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;

  if (!token) {
    // بدل enabled: نوقف العملية هنا
    throw new Error("Missing AccessToken");
  }

  const { data } = await axios.post(
    `${BASE_URL}/courses/${type}_course.php`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}

export default function usePostCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postCourse,
    retry: 1,

    onSuccess: (_data, variables) => {
      // ✅ revalidate teachers list
      queryClient.invalidateQueries({ queryKey: ["courses"] });

      // ✅ revalidate teacher details (لو بتستخدمه)
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ["courses", variables.id] });
      }
    },
  });
}
