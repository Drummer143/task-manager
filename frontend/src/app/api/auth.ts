import { axiosInstance } from "./base";

export const login = async (body: { username: string, password: string }) => (await axiosInstance.post<User>("/auth/login", body, { withCredentials: false })).data

export const signUp = async (body: { username: string, email: string, password: string }) => (await axiosInstance.post<User>("/auth/sign-up", body, { withCredentials: false })).data

export const confirmEmail = async (body: { token: string }) => axiosInstance.post<void>("/auth/confirm-email", body)

export const resetPassword = async (body: { email: string }) => axiosInstance.post<void>("/auth/reset-password", body)

export const verifyResetPasswordToken = async (token: string) => axiosInstance.get<void>("/auth/verify-reset-password-token?token=" + token)

export const updatePassword = async (body: { password: string, token: string }) => axiosInstance.post<void>("/auth/update-password", body)

export const logout = async () => axiosInstance.get<void>("/auth/logout", { withCredentials: false })
