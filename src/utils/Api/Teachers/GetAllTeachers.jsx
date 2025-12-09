import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../base_url";

async function fetchStudents() {
  const token = localStorage.getItem("AccessToken");

  const res = await axios.get(`${BASE_URL}/teachers/select_teachers.php`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return res.data;
}

export default function useGetAllTeachers() {
  return useQuery({
    queryKey: ["teachers"],
    queryFn: fetchStudents,
    refetchOnWindowFocus: false,
    retry: 1,
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("AccessToken"),
  });
}
