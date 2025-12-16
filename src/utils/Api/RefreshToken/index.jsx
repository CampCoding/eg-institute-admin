import axios from "axios";
import React from "react";
import { BASE_URL } from "../../base_url";

export default async function useRefreshToken() {
  const refreshToken = localStorage.getItem("RefreshToken");
  const adminId = localStorage.getItem("UserId");

  const payload = { admin_id: adminId, refresh_token: refreshToken };
  try {
    const response = await axios.post(
      `${BASE_URL}/ask_refresh_tokens_for_admin.php`,
      payload
    );

    return response.data;
  } catch (error) {
    return error;
  }
}
