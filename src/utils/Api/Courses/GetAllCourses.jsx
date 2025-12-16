import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../base_url";

async function fetchCourses() {
  const token = localStorage.getItem("AccessToken");

  const res = await axios.get(`${BASE_URL}/courses/select_courses.php`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return res.data;
}

export function useGetAllCourses() {
  return useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
    refetchOnWindowFocus: false,
    retry: 1,
    staleTime: 5 * 60 * 1000,
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("AccessToken"),
  });
}
