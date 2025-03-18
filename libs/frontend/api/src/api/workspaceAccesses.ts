import { axiosInstance } from "./base";

import { WorkspaceAccess } from "../types";

interface GetWorkspaceAccessArgs {
	workspaceId: string;
}

export const getWorkspaceAccess = async ({ workspaceId }: GetWorkspaceAccessArgs) =>
	(await axiosInstance.get<WorkspaceAccess[]>(`/workspaces/${workspaceId}/accesses`)).data;

interface UpdateWorkspaceAccessArgs extends GetWorkspaceAccessArgs {
	body: {
		role?: string;

		userId: string;
	};
}

export const updateWorkspaceAccess = async ({ workspaceId, body }: UpdateWorkspaceAccessArgs) =>
	(await axiosInstance.put<"Success">(`/workspaces/${workspaceId}/accesses`, body)).data;
