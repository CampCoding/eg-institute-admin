"use client";

import { BASE_URL } from "../../base_url";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function postSubscription({ payload }) {
  console.log(payload);
  
  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;

  if (!token) {
    // بدل enabled: نوقف العملية هنا
    throw new Error("Missing AccessToken");
  }

  const { data } = await axios.post(
    `${BASE_URL}/subscreption/change_subscreptions_requestes_status.php`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}

export default function usePostSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postSubscription,
    retry: 1,
    onSuccess: (_data, variables) => {
      // ✅ revalidate teachers list
      queryClient.invalidateQueries({ queryKey: ["subscription"] });

      // ✅ revalidate teacher details (لو بتستخدمه)
    },
  });
}
