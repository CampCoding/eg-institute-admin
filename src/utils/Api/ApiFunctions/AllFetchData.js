import axios from "axios";

export const API = axios.create({
  baseURL: "https://camp-coding.tech/eg_Institute/admin",
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("AccessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default API;