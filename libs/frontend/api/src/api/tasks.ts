import { JSONContent } from "@tiptap/core";

import { BaseRequest, mainInstance } from "./base";

import {
	Task
	// VersionHistoryLog
} from "../types";

export type GetTaskListRequest = BaseRequest<{
	pageId: string;
}>;

export const getTaskList = async (params: GetTaskListRequest) =>
	(await mainInstance.get<Task[]>(`pages/${params.pathParams.pageId}/tasks`)).data;

export type GetTaskRequest = BaseRequest<{
	taskId: string;
}>;

export const getTask = async (params: GetTaskRequest) =>
	(await mainInstance.get<Task>(`tasks/${params.pathParams.taskId}`)).data;

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

