import { axiosInstance } from "./base";

import { PageAccess } from "../types";

interface GetPageAccessArgs {
	workspaceId: string;
	pageId: string;
}

export const getPageAccess = async ({ pageId, workspaceId }: GetPageAccessArgs) =>
	(await axiosInstance.get<PageAccess[]>(`/workspaces/${workspaceId}/pages/${pageId}/accesses`)).data;

interface UpdatePageAccessArgs extends GetPageAccessArgs {
	body: {
		role?: string;

		userId: string;
	};
}

export const updatePageAccess = async ({ pageId, body, workspaceId }: UpdatePageAccessArgs) =>
	(await axiosInstance.put<"Success">(`/workspaces/${workspaceId}/pages/${pageId}/accesses`, body)).data;
