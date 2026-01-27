import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../base_url";

const fetchCourseVideos = async (course_id) => {
  if (!course_id) return { message: [] };
  const token = localStorage.getItem("AccessToken");

  const response = await axios.post(
    `${BASE_URL}/groups/select_group_course_videos.php`,
    { course_id },
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    }
  );
  return response.data;
};

export default function useGetCourseVideos({ course_id }) {
  return useQuery({
    queryKey: ["course_videos", course_id],
    queryFn: () => fetchCourseVideos(course_id),
    enabled: !!course_id, // Only fetch if course_id exists
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
