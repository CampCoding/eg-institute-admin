import axios from "axios";
import React from "react";
import { BASE_URL } from "../../base_url";

export default async function useDeleteBlog({ id }) {
  const payload = {
    blog_id: id,
  };

  let response;
  try {
    response = await axios.post(`${BASE_URL}/blogs/delete_blog.php`, payload);
  } catch (error) {
    console.error(error);
    throw error;
  }

  return response.data;
}
