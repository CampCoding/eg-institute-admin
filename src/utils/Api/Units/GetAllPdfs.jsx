import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../../base_url";

export default function useGetAllUnitPdfs({ detailId }) {
  const payload = { unit_id: detailId };
  console.log(payload);

  async function fetchUnitPdfs() {
    const token = localStorage.getItem("AccessToken");

    const res = await axios.post(
      `${BASE_URL}/units/content/pdfs/select_pdfs.php`,
      payload,
      {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      }
    );

    return res.data;
  }

  return useQuery({
    queryKey: ["unitPdfs"],
    queryFn: fetchUnitPdfs,
    retry: 1,
    enabled:
      typeof window !== "undefined" && !!localStorage.getItem("AccessToken"),
  });
}
