import { BaseRequest, mainInstance } from "./base";

import { WorkspaceAccess } from "../types";

interface GetWorkspaceAccessArgs {
	workspaceId: string;
}

export type GetWorkspaceAccessRequest = BaseRequest<GetWorkspaceAccessArgs>;

export const getWorkspaceAccess = async (params: GetWorkspaceAccessRequest) =>
	(
		await mainInstance.get<WorkspaceAccess[]>(
			`/workspaces/${params.pathParams.workspaceId}/access`
		)
	).data;

export type CreateWorkspaceAccessRequest = BaseRequest<
	GetWorkspaceAccessArgs,
	{ role: string; userId: string }
>;

export const createWorkspaceAccess = async (params: CreateWorkspaceAccessRequest) =>
	(
		await mainInstance.post<"Success">(
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
		await mainInstance.put<"Success">(
			`/workspaces/${params.pathParams.workspaceId}/access`,
			params.body
		)
	).data;

