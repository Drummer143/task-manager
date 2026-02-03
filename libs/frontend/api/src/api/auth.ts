import { mainInstance } from "./base";

import { User } from "../types";

export const login = async (body: { username: string; password: string }) =>
	(await mainInstance.post<User>("/auth/login", body)).data;

export const signUp = async (body: { username: string; email: string; password: string }) =>
	(await mainInstance.post<User>("/auth/register", body)).data;

// export const confirmEmail = async (body: { token: string }) =>
// 	mainInstance.post<void>("/auth/confirm-email", body, { withCredentials: false });

// export const resetPassword = async (body: { email: string }) =>
// 	mainInstance.post<void>("/auth/reset-password", body, { withCredentials: false });

// export const verifyResetPasswordToken = async (token: string) =>
// 	mainInstance.get<void>("/auth/verify-reset-password-token?token=" + token, {
// 		withCredentials: false
// 	});

// export const updatePassword = async (body: { password: string; token: string }) =>
// 	mainInstance.post<void>("/auth/update-password", body, { withCredentials: false });

export const logout = async () => mainInstance.get<void>("/auth/logout");
