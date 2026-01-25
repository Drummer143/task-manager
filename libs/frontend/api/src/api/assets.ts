import { axiosInstance, BaseRequest } from "./base";

export interface CreateUploadTokenResponse {
	token: string;
}

export type AssetTarget = {
	id: string;
	type: "pageText" | "taskDescription";
};

export type CreateUploadTokenRequest = BaseRequest<
	never,
	{
		name: string;
		target: AssetTarget;
	}
>;

export const createUploadToken = async (params: CreateUploadTokenRequest, signal?: AbortSignal) =>
	(
		await axiosInstance.post<CreateUploadTokenResponse>(
			"/assets/token",
			params.body,
			{
				signal
			}
		)
	).data;

