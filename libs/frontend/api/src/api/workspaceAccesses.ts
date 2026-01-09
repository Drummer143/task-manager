import { axiosInstance, BaseRequest } from "./base";

import { WorkspaceAccess } from "../types";

interface GetWorkspaceAccessArgs {
	workspaceId: string;
}

export type GetWorkspaceAccessRequest = BaseRequest<GetWorkspaceAccessArgs>;

export const getWorkspaceAccess = async (params: GetWorkspaceAccessRequest) =>
	(
		await axiosInstance.get<WorkspaceAccess[]>(
			`/workspaces/${params.pathParams.workspaceId}/access`
		)
	).data;

export type CreateWorkspaceAccessRequest = BaseRequest<
	GetWorkspaceAccessArgs,
	{ role: string; userId: string }
>;

export const createWorkspaceAccess = async (params: CreateWorkspaceAccessRequest) =>
	(
		await axiosInstance.post<"Success">(
			`/workspaces/${params.pathParams.workspaceId}/access`,
			params.body
		)
	).data;

export type UpdateWorkspaceAccessRequest = BaseRequest<
	GetWorkspaceAccessArgs,
	{ role?: string; userId: string }
>;

export const updateWorkspaceAccess = async (params: UpdateWorkspaceAccessRequest) =>
	(
		await axiosInstance.put<"Success">(
			`/workspaces/${params.pathParams.workspaceId}/access`,
			params.body
		)
	).data;

