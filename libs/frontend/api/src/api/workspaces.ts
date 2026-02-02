import { BaseRequest, mainInstance } from "./base";

import { PaginationQuery, ResponseWithPagination, Workspace } from "../types";

type GetWorkspaceIncludes = "owner" | "pages";

type ResponseWithIncludeFilter<T extends GetWorkspaceIncludes | undefined = undefined> = Omit<
	Workspace,
	Exclude<GetWorkspaceIncludes, T>
>;

interface Ids {
	workspaceId: string;
}

export type GetWorkspaceListRequest<T extends GetWorkspaceIncludes | undefined = undefined> =
	BaseRequest<
		PaginationQuery & {
			include?: T[];
		}
	>;

export const getWorkspaceList = async <T extends GetWorkspaceIncludes | undefined = undefined>(
	params: GetWorkspaceListRequest<T>
) =>
	(
		await mainInstance.get<ResponseWithPagination<ResponseWithIncludeFilter<T>>>(
			"/workspaces",
			{
				params: params.pathParams
			}
		)
	).data;

export type GetWorkspaceRequest<T extends GetWorkspaceIncludes | undefined = undefined> =
	BaseRequest<
		Ids & {
			include?: T[];
		}
	>;

export const getWorkspace = async <T extends GetWorkspaceIncludes | undefined = undefined>(
	params: GetWorkspaceRequest<T>
) =>
	(
		await mainInstance.get<ResponseWithIncludeFilter<T>>(
			`/workspaces/${params.pathParams.workspaceId}`,
			{
				params: { include: params.pathParams.include?.join(",") }
			}
		)
	).data;

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
	(
		await mainInstance.put<Workspace>(
			`/workspaces/${params.pathParams.workspaceId}`,
			params.body
		)
	).data;

