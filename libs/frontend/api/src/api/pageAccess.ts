import { axiosInstance, BaseRequest } from "./base";

import { PageAccess } from "../types";

interface Ids {
	pageId: string;
}

export type GetPageAccessRequest = BaseRequest<Ids>;

export const getPageAccess = async (params: GetPageAccessRequest) =>
	(await axiosInstance.get<PageAccess[]>(`pages/${params.pathParams.pageId}/access`)).data;

export type UpdatePageAccessRequest = BaseRequest<
	Ids,
	{
		role?: string;

		userId: string;
	}
>;

export const updatePageAccess = async (params: UpdatePageAccessRequest) =>
	(await axiosInstance.put<"Success">(`pages/${params.pathParams.pageId}/access`, params.body))
		.data;

export type CreatePageAccessRequest = BaseRequest<
	Ids,
	{
		role: string;

		userId: string;
	}
>;

export const createPageAccess = async (params: CreatePageAccessRequest) =>
	(
		await axiosInstance.post<"Success">(
			`pages/${params.pathParams.pageId}/access`,
			params.body
		)
	).data;

