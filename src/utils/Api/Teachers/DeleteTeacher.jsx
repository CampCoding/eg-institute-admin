"use client";

import { BASE_URL } from "../../base_url";
import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";

async function deleteTeacherRequest({ id }) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("AccessToken") : null;

  if (!token) throw new Error("Missing AccessToken");

  const { data } = await axios.post(
    `${BASE_URL}/teachers/delete_teacher.php`,
    { teacher_id: id },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return data;
}

export default function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeacherRequest,
    retry: 1,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}
