import axios from "axios";
import { BASE_URL } from "../base_url";

export async function Toggle({ payload, url, queryClient, key }) {
  const res = await axios.post(`${BASE_URL}/${url}`, payload, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("AccessToken")}`,
    },
  });
  queryClient.invalidateQueries({ queryKey: [`${key}`] });
  return res.data;
}
