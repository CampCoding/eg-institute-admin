import axios from "axios";
import React from "react";
import { BASE_URL } from "../base_url";

export default async function Toggle({ payload, url }) {
  try {
    const response = await axios.post(`${BASE_URL}/${url}`, payload);
    return response.data;
  } catch (error) {
    console.error(error);
    throw error;
  }
}
