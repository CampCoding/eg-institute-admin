import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../base_url";

async function fetchReservations() {
  const token = localStorage.getItem("AccessToken");

  const res = await axios.get(
    `${BASE_URL}/meeting_resrvations/select_meeting_resrvations.php`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );

  return res.data;
}

export function useGetAllReservation() {
  return useQuery({
    queryKey: ["reservations"],
    queryFn: fetchReservations,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("AccessToken"),
  });
}
async function fetchReserved() {
  const token = localStorage.getItem("AccessToken");

  const res = await axios.get(
    `${BASE_URL}/meeting_resrvations/select_meeting_resrved.php`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );

  return res.data;
}

export function useGetAllReserved() {
  return useQuery({
    queryKey: ["Reserved"],
    queryFn: fetchReserved,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("AccessToken"),
  });
}
