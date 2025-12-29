import React from "react";
import { BASE_URL } from "../../base_url";
import axios from "axios";

export default async function usePostBlog({ payload, type = "add", id }) {
  if (type === "edit") {
    payload.blog_id = id;
  }
  try {
    const response = await axios.post(
      `${BASE_URL}/blogs/${type}_blog.php`,
      payload
    );

    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
