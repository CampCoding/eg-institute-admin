// utils/Api/Units/GetSolvedQuizzes.js
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/utils/ApiClient";

const useGetSolvedQuizzes = ({ quizId, groupId, enabled = true }) => {
  return useQuery({
    queryKey: ["solvedQuizzes", quizId, groupId],
    queryFn: async () => {
      const response = await apiClient.post(
        "admin/units/content/quiz/select_sloved_group_quizes.php",
        {
          quiz_id: quizId,
          group_id: groupId,
        }
      );
      return response.data;
    },
    enabled: enabled && !!quizId,
    staleTime: 5 * 60 * 1000,
  });
};

export default useGetSolvedQuizzes;
