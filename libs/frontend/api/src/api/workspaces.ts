import { BaseRequest, mainInstance } from "./base";

import {
	ChildPage,
	PaginationQuery,
	ResponseWithPagination,
	User,
	UserRole,
	Workspace
} from "../types";

interface Ids {
	workspaceId: string;
}

export type GetWorkspaceListRequest = BaseRequest<PaginationQuery>;

export const getWorkspaceList = async (params: GetWorkspaceListRequest) =>
	(
		await mainInstance.get<ResponseWithPagination<Workspace>>("/workspaces", {
			params: params.pathParams
		})
	).data;

export type GetWorkspaceRequest = BaseRequest<Ids>;

export const getWorkspace = async (params: GetWorkspaceRequest) =>
	(await mainInstance.get<Workspace>(`/workspaces/${params.pathParams.workspaceId}`)).data;

export type CreateWorkspaceRequest = BaseRequest<never, { name: string }>;

export const createWorkspace = async (params: CreateWorkspaceRequest) =>
	(await mainInstance.post<Omit<Workspace, "owner" | "pages">>("/workspaces", params.body)).data;

export type SoftDeleteWorkspace = BaseRequest<Ids>;

export const softDeleteWorkspace = async (params: SoftDeleteWorkspace) =>
	(await mainInstance.delete<void>(`/workspaces/${params.pathParams.workspaceId}/soft-delete`))
		.data;

export type CancelSoftDeleteWorkspace = BaseRequest<Ids>;

export const cancelSoftDeleteWorkspace = async (params: CancelSoftDeleteWorkspace) =>
	(
		await mainInstance.post<void>(
			`/workspaces/${params.pathParams.workspaceId}/cancel-soft-delete`
		)
	).data;

export type UpdateWorkspaceRequest = BaseRequest<Ids, { name?: string }>;

export const updateWorkspace = async (params: UpdateWorkspaceRequest) =>
	(await mainInstance.put<Workspace>(`/workspaces/${params.pathParams.workspaceId}`, params.body))
		.data;

export type GetWorkspaceDetailedRequest = BaseRequest<Ids>;

export interface DetailedWorkspaceResponse {
	id: string;
	name: string;
	role: UserRole;

	owner: User;
	pages: ChildPage[];

	updatedAt: string;
	createdAt: string;
	deletedAt?: string;
}

export const getWorkspaceDetailed = async (params: GetWorkspaceDetailedRequest) =>
	(
		await mainInstance.get<DetailedWorkspaceResponse>(
			`/workspaces/${params.pathParams.workspaceId}/detailed`
		)
	).data;

