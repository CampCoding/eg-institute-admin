"use client";

import { BASE_URL } from "../../base_url";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postUnitsVideos({ payload, type = "add", id }) {
  const body = { ...payload };

  if (type === "update") {
    body.video_id = id;
  }
  console.log(body);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;

  if (!token) {
    // بدل enabled: نوقف العملية هنا
    throw new Error("Missing AccessToken");
  }

  const { data } = await axios.post(
    `${BASE_URL}/units/content/videos/${type}_video.php`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}

export default function usePostUnitsVideos() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postUnitsVideos,
    retry: 1,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}
