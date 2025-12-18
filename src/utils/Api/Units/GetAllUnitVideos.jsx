import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../base_url";

export default function useGetAllUnitVideos({ detailId, type = "Unit" }) {
  const payload = {};
  if (type === "Group") {
    payload.group_id = detailId;
  } else {
    payload.unit_id = detailId;
  }

  async function fetchUnitVideos() {
    const token = localStorage.getItem("AccessToken");

    const res = await axios.post(
      `${BASE_URL}/units/content/videos/select_video_by${type}Id.php`,
      payload,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );

    return res.data;
  }

  return useQuery({
    queryKey: ["unitVideos", type, detailId],
    queryFn: fetchUnitVideos,
    retry: 1,
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("AccessToken"),
  });
}
