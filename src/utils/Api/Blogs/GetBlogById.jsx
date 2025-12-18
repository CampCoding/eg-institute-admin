import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../base_url";

export default function useGetBlogById({ id }) {
  return useQuery({
    queryKey: ["blog", id],
    enabled: typeof window !== "undefined" && !!id, // ✅ شغل بس لما id موجود
    retry: 1,
    queryFn: async () => {
      const token = localStorage.getItem("AccessToken");
      if (!token) throw new Error("Missing AccessToken");

      const payload = { blog_id: id };

      try {
        const response = await axios.post(
          `${BASE_URL}/blogs/select_blog_withId.php`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        return response.data;
      } catch (error) {
        // ✅ اطبع السبب الحقيقي
        console.log("GET BLOG ERROR:", {
          message: error?.message,
          status: error?.response?.status,
          data: error?.response?.data,
          url: error?.config?.url,
        });
        throw error; // ✅ مهم جدًا
      }
    },
  });
}
