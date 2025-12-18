import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../base_url";

async function fetchStudents() {
  const token = localStorage.getItem("AccessToken");

  const res = await axios.get(`${BASE_URL}/students/select_students.php`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  return res.data;
}

export default function useGetAllStudents() {
  return useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
    retry: 1,
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("AccessToken"),
  });
}
