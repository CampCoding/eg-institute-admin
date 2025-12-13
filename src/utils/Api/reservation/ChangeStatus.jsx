"use client";

import { BASE_URL } from "../../base_url";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function changeReservationStatus({ payload }) {
  const body = { ...payload };

  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;

  if (!token) {
    // بدل enabled: نوقف العملية هنا
    throw new Error("Missing AccessToken");
  }

  const { data } = await axios.post(
    `${BASE_URL}/meeting_resrvations/add_meeting_resrvation.php`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return data;
}

export default function useChangeReservationStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeReservationStatus,
    retry: 1,

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}
