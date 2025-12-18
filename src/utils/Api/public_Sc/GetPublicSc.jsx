import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../base_url";

async function fetchPublicSchedules() {
  const token = localStorage.getItem("AccessToken");
  const id = localStorage.getItem("UserId");

  const payload = { admin_id: id };

  const res = await axios.post(
    `${BASE_URL}/public_schedule/public_schedule.php`,
    payload,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );

  return res.data;
}

export function useGetAllPublicSchedule() {
  return useQuery({
    queryKey: ["public_schedule"],
    queryFn: fetchPublicSchedules,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("AccessToken"),
  });
}
