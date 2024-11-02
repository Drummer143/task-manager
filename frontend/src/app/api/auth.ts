import { axiosInstance } from "./base";

export const login = async (body: { username: string, password: string }) => axiosInstance.post<User>("/auth/login", body)

export const signUp = async (body: { username: string, email: string, password: string }) => axiosInstance.post<User>("/auth/sign-up", body)

export const confirmEmail = async (body: { token: string }) => axiosInstance.post<void>("/auth/confirm-email", body)

export const resetPassword = async (body: { email: string }) => axiosInstance.post<void>("/auth/reset-password", body)
