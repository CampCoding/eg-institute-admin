import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../base_url";

export default function useGetAllQuizzes({ detailId, type }) {
  async function fetchQuizzes() {
    const token = localStorage.getItem("AccessToken");
    const res = await axios.get(
      `${BASE_URL}/units/content/${type}/select_${type}.php`,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );

    return res.data;
  }

  return useQuery({
    queryKey: [` all${type}`, detailId],
    queryFn: fetchQuizzes,
    retry: 1,
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("AccessToken"),
  });
}
