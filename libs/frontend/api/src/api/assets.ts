import { BaseRequest, mainInstance } from "./base";

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
		assetId: string;
	}
>;

export const createUploadToken = async (params: CreateUploadTokenRequest, signal?: AbortSignal) =>
	(
		await mainInstance.post<CreateUploadTokenResponse>(
			"/assets/token",
			params.body,
			{
				signal
			}
		)
	).data;

