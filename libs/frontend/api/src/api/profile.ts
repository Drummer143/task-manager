import { removeEmptyFields } from "@task-manager/utils";

import { BaseRequest, mainInstance } from "./base";

import { User, Workspace } from "../types";

type getProfileResponse = User & { workspace: Workspace };

export const getProfile = async () => (await mainInstance.get<getProfileResponse>("/profile")).data;

export type updateProfileRequest = BaseRequest<never, { username: string }>;

export const updateProfile = async (params: updateProfileRequest) =>
	(await mainInstance.patch<User>("/profile", removeEmptyFields(params.body))).data;

export type changeEmailRequest = BaseRequest<never, { email: string }>;

export const changeEmail = async (params: changeEmailRequest) =>
	(await mainInstance.patch<User>("/profile/email", params.body)).data;

export type uploadAvatarRequest = BaseRequest<
	never,
	{
		file: File;
		x: number;
		y: number;
		width: number;
		height: number;
	}
>;

export const uploadAvatar = async (params: uploadAvatarRequest) => {
	const formData = new FormData();

	formData.append("file", params.body.file);
	formData.append("x", String(params.body.x));
	formData.append("y", String(params.body.y));
	formData.append("width", String(params.body.width));
	formData.append("height", String(params.body.height));

	return (
		await mainInstance.patch<User>("/profile/avatar", formData, {
			headers: {
				"Content-Type": "multipart/form-data"
			}
		})
	).data;
};

