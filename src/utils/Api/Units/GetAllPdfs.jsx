import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../base_url";

export default function useGetAllPdfsByType({ detailId, type="Unit" }) {
  const payload = {};
  if (type === "Group") {
    payload.group_id = detailId;
  } else {
    payload.unit_id = detailId;
  }
  async function fetchUnitQuizzes() {
    const token = localStorage.getItem("AccessToken");

    const res = await axios.post(
      `${BASE_URL}/units/content/pdfs/select_pdf_by${type}Id.php`,
      payload,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );

    return res.data;
  }

  return useQuery({
    queryKey: ["unitpdfs", type, detailId],
    queryFn: fetchUnitQuizzes,
    retry: 1,
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("AccessToken"),
  });
}
