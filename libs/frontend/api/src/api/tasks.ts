import { JSONContent } from "@tiptap/core";

import { BaseRequest, mainInstance } from "./base";

import {
	Task
	// VersionHistoryLog
} from "../types";

type GetTaskIncludes = "assignee" | "page" | "reporter";

type ResponseWithIncludeFilter<T extends GetTaskIncludes | undefined = undefined> = Omit<
	Task,
	Exclude<GetTaskIncludes, T>
>;

export type GetTaskListRequest<T extends GetTaskIncludes | undefined = undefined> = BaseRequest<{
	pageId: string;
	include?: T[];
}>;

export const getTaskList = async <T extends GetTaskIncludes | undefined = undefined>(
	params: GetTaskListRequest<T>
) =>
	(
		await mainInstance.get<ResponseWithIncludeFilter<T>[]>(
			`pages/${params.pathParams.pageId}/tasks`,
			{
				params: { include: params.pathParams.include?.join(",") }
			}
		)
	).data;

export type GetTaskRequest<T extends GetTaskIncludes | undefined = undefined> = BaseRequest<{
	taskId: string;
	include?: T[];
}>;

export const getTask = async <T extends GetTaskIncludes | undefined = undefined>(
	params: GetTaskRequest<T>
) =>
	(
		await mainInstance.get<ResponseWithIncludeFilter<T>>(`tasks/${params.pathParams.taskId}`, {
			params: { include: params.pathParams.include?.join(",") }
		})
	).data;

export type CreateTaskRequest = BaseRequest<
	{ pageId: string },
	{
		title: string;
		statusId: string;
		dueDate?: string;
		assigneeId?: string;
		description?: JSONContent;
	}
>;

export const createTask = async (params: CreateTaskRequest) =>
	(await mainInstance.post<Task>(`/pages/${params.pathParams.pageId}/tasks`, params.body)).data;

export type UpdateTaskRequest = BaseRequest<
	{ taskId: string },
	Partial<CreateTaskRequest["body"]> & {
		position?: number;
	}
>;

export type CreateDraftRequest = BaseRequest<{ pageId: string }, { boardStatusId?: string }>;

export const createDraft = async (params: CreateDraftRequest) =>
	(await mainInstance.post<Task>(`/pages/${params.pathParams.pageId}/tasks/draft`, params.body))
		.data;

export const updateTask = async (params: UpdateTaskRequest) =>
	(await mainInstance.put<Task>(`/tasks/${params.pathParams.taskId}`, params.body)).data;

export type DeleteTaskRequest = BaseRequest<{ taskId: string }>;

export const deleteTask = async (params: DeleteTaskRequest) =>
	(await mainInstance.delete<Task>(`/tasks/${params.pathParams.taskId}`)).data;

export type ChangeStatusRequest = BaseRequest<{ taskId: string }, { statusId: string }>;

export const changeStatus = async (params: ChangeStatusRequest) =>
	(await mainInstance.patch<Task>(`/tasks/${params.pathParams.taskId}/status`, params.body))
		.data;

// export const getTaskHistory = async ({
// 	pageId,
// 	workspaceId,
// 	taskId,
// 	limit,
// 	offset
// }: Ids & { taskId: string } & PaginationQuery) =>
// 	(
// 		await mainInstance.get<
// 			ResponseWithPagination<
// 				VersionHistoryLog<"title" | "description" | "status" | "dueDate" | "assigneeId">
// 			>
// 		>(`/workspaces/${workspaceId}/pages/${pageId}/tasks/${taskId}/history`, {
// 			params: { limit, offset }
// 		})
// 	).data;

