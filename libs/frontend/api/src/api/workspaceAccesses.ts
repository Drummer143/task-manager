import { axiosInstance } from "./base";

import { WorkspaceAccess } from "../types";

interface GetWorkspaceAccessArgs {
	workspaceId: string;
}

export const getWorkspaceAccess = async ({ workspaceId }: GetWorkspaceAccessArgs) =>
	(await axiosInstance.get<WorkspaceAccess[]>(`/workspaces/${workspaceId}/access`)).data;

interface CreateWorkspaceAccessArgs extends GetWorkspaceAccessArgs {
	body: {
		role: string;

		userId: string;
	};
}

export const createWorkspaceAccess = async ({ workspaceId, body }: CreateWorkspaceAccessArgs) =>
	(await axiosInstance.post<"Success">(`/workspaces/${workspaceId}/access`, body)).data;

interface UpdateWorkspaceAccessArgs extends GetWorkspaceAccessArgs {
	body: {
		role?: string;

		userId: string;
	};
}

export const updateWorkspaceAccess = async ({ workspaceId, body }: UpdateWorkspaceAccessArgs) =>
	(await axiosInstance.put<"Success">(`/workspaces/${workspaceId}/access`, body)).data;