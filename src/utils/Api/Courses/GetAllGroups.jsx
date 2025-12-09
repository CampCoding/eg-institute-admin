import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../base_url";

async function fetchGroups() {
  const token = localStorage.getItem("AccessToken");

  const res = await axios.get(`${BASE_URL}/groups/select_groups.php`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return res.data;
}

export default function useGetAllGroups() {
  return useQuery({
    queryKey: ["Groups"],
    queryFn: fetchGroups,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("AccessToken"),
  });
}
