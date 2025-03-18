import axios, { AxiosInstance } from "axios";

export const axiosInstance = axios.create({
  withCredentials: true,
  baseURL: "http://localhost:8080"
});

export const modifyAxiosInstance = (
  cb: (axiosInstance: AxiosInstance) => void
) => cb(axiosInstance);
