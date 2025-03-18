import { removeEmptyFields } from "@task-manager/utils";

import { axiosInstance } from "./base";
import { User } from "../types";

export const getProfile = async () => (await axiosInstance.get<User>("/profile")).data;

export const updateProfile = async (data: { username: string }) =>
	(await axiosInstance.patch<User>("/profile", removeEmptyFields(data))).data;

export const changeEmail = async (body: { email: string }) =>
	(await axiosInstance.patch<User>("/profile/email", body)).data;

interface AvatarUploaderProps {
	file: File;
	x: number;
	y: number;
	width: number;
	height: number;
}

export const uploadAvatar = async ({ file, height, width, x, y }: AvatarUploaderProps) => {
	const formData = new FormData();

	formData.append("file", file);
	formData.append("x", String(x));
	formData.append("y", String(y));
	formData.append("width", String(width));
	formData.append("height", String(height));

	return (
		await axiosInstance.patch<User>("/profile/avatar", formData, {
			headers: {
				"Content-Type": "multipart/form-data"
			}
		})
	).data;
};
