import { axiosInstance } from "./base";

import { Workspace } from "../types";

type GetWorkspaceIncludes = "owner" | "pages";

type ResponseWithIncludeFilter<T extends GetWorkspaceIncludes | undefined = undefined> = Omit<
	Workspace,
	Exclude<GetWorkspaceIncludes, T>
>;

interface Ids {
	workspaceId: string;
}

interface GetWorkspaceArgs<T extends GetWorkspaceIncludes | undefined = undefined> extends Ids {
	include?: T[];
}

export const getWorkspaceList = async <T extends GetWorkspaceIncludes | undefined = undefined>(include?: T[]) =>
	(
		await axiosInstance.get<ResponseWithIncludeFilter<T>[]>("/workspaces", {
			params: { include: include?.join(",") }
		})
	).data;

export const getWorkspace = async <T extends GetWorkspaceIncludes | undefined = undefined>({
	workspaceId,
	include
}: GetWorkspaceArgs<T>) =>
	(
		await axiosInstance.get<ResponseWithIncludeFilter<T>>(`/workspaces/${workspaceId}`, {
			params: { include: include?.join(",") }
		})
	).data;

interface CreateWorkspaceArgs {
	name: string;
}

export const createWorkspace = async (body: CreateWorkspaceArgs) =>
	(await axiosInstance.post<Omit<Workspace, "owner" | "pages">>("/workspaces", body)).data;

export const softDeleteWorkspace = async ({ workspaceId }: Ids) =>
	(await axiosInstance.delete<void>(`/workspaces/${workspaceId}/soft-delete`)).data;

export const cancelSoftDeleteWorkspace = async ({ workspaceId }: Ids) =>
	(await axiosInstance.post<void>(`/workspaces/${workspaceId}/cancel-soft-delete`)).data;

interface UpdateWorkspaceArgs extends Ids {
	body: {
		name?: string;
	};
}

export const updateWorkspace = async ({ workspaceId, body }: UpdateWorkspaceArgs) =>
	(await axiosInstance.put<Workspace>(`/workspaces/${workspaceId}`, body)).data;