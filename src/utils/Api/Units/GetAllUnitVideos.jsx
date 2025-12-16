import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../base_url";

export default function useGetAllUnitVideos({ detailId }) {
  const payload = { unit_id: detailId };
  console.log(payload);

  async function fetchUnitVideos() {
    const token = localStorage.getItem("AccessToken");

    const res = await axios.post(
      `${BASE_URL}/units/content/videos/select_videos.php`,
      payload,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );

    return res.data;
  }

  return useQuery({
    queryKey: ["unitVideos"],
    queryFn: fetchUnitVideos,
    retry: 1,
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("AccessToken"),
  });
}
