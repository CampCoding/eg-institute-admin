"use client";

import { BASE_URL } from "../../base_url";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteReservationRequest({ id }) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;

  if (!token) throw new Error("Missing AccessToken");

  const { data } = await axios.post(
    `${BASE_URL}/meeting_resrvations/delete_meeting_resrvations.php`,
    { meeting_resrvations_id: id },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return data;
}

export default function useDeleteReservation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReservationRequest,
    retry: 1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reservations"] });
    },
  });
}
