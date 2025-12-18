"use client";

import { BASE_URL } from "../../base_url";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postTeacher({ payload, type = "add", id }) {
  const body = { ...payload };

  if (type === "edit") {
    body.teacher_id = id;
  }
  console.log(payload);
  

  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;

  if (!token) {
    // بدل enabled: نوقف العملية هنا
    throw new Error("Missing AccessToken");
  }

  const { data } = await axios.post(
    `${BASE_URL}/teachers/${type}_teacher.php`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}

export default function usePostTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postTeacher,
    retry: 1,

    onSuccess: (_data, variables) => {
      // ✅ revalidate teachers list
      queryClient.invalidateQueries({ queryKey: ["teachers"] });

      // ✅ revalidate teacher details (لو بتستخدمه)
      if (variables?.id) {
        queryClient.invalidateQueries({ queryKey: ["teacher", variables.id] });
      }
    },
  });
}
