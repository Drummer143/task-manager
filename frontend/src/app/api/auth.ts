import { axiosInstance } from "./base";

export const login = async (body: { username: string, password: string }) => axiosInstance.post<User>("/auth/login", body)
