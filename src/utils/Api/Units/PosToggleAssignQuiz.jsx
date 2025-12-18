"use client";

import { BASE_URL } from "../../base_url";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postAssignQuiz({ payload, type = "assign", id, contentType }) {
  const endpoint =
    contentType === "videos" ? "vid" : contentType === "pdfs" ? "pdf" : "quiz";

  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;

  if (!token) {
    // بدل enabled: نوقف العملية هنا
    throw new Error("Missing AccessToken");
  }

  const { data } = await axios.post(
    `${BASE_URL}/units/content/${contentType}/${type}_group_${endpoint}.php`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}

export default function usePostAssign(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postAssignQuiz,
    retry: 1,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["unitquizs", "Group", id] });
    },
  });
}
