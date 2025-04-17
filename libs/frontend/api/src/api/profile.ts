import { removeEmptyFields } from "@task-manager/utils";

import { axiosInstance } from "./base";

import { User, Workspace } from "../types";

type GetProfileIncludes = "workspace";

type ResponseWithIncludeFilter<T extends GetProfileIncludes | undefined = undefined> = Omit<
	User & { workspace: Workspace },
	Exclude<GetProfileIncludes, T>
>;

export const getProfile = async <T extends GetProfileIncludes | undefined = undefined>({
	includes
}: {
	includes?: T[];
}) =>
	(await axiosInstance.get<ResponseWithIncludeFilter<T>>("/profile", { params: { includes: includes?.toString() } }))
		.data;

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
