import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../base_url";

async function fetchSubscriptions() {
  const token = localStorage.getItem("AccessToken");

  const res = await axios.get(
    `${BASE_URL}/subscreption/select_subscreptions_requestes.php`,
    {
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    }
  );

  return res.data;
}

export default function useGetAllSubscriptions() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: fetchSubscriptions,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("AccessToken"),
  });
}
