"use client";

import { BASE_URL } from "../../base_url";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteRequest({ id, type = "pdf" }) {
  let payload;

  if (type === "pdf") {
    payload = { pdf_id: id };
  } else if (type === "video") {
    payload = { video_id: id };
  } else {
    payload = { quiz_id: id };
  }
  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;

  if (!token) throw new Error("Missing AccessToken");

  const { data } = await axios.post(
    `${BASE_URL}/units/content/${type}${
      type !== "quiz" ? "s" : ""
    }/delete_${type}.php`,
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return data;
}

export default function useDeleteContent({ queryKey }) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteRequest,
    retry: 1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`${queryKey}`] });
    },
  });
}
