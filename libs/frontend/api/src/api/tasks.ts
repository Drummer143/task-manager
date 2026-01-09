import { JSONContent } from "@tiptap/core";

import { axiosInstance, BaseRequest } from "./base";

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
		await axiosInstance.get<ResponseWithIncludeFilter<T>[]>(
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
		await axiosInstance.get<ResponseWithIncludeFilter<T>>(`tasks/${params.pathParams.taskId}`, {
			params: { include: params.pathParams.include?.join(",") }
		})
	).data;

export type createTaskRequest = BaseRequest<
	{ pageId: string },
	{
		title: string;
		statusId: string;
		dueDate?: string;
		assigneeId?: string;
		description?: JSONContent;
	}
>;

export const createTask = async (params: createTaskRequest) =>
	(await axiosInstance.post<Task>(`/pages/${params.pathParams.pageId}/tasks`, params.body)).data;

export type UpdateTaskRequest = BaseRequest<
	{ taskId: string },
	Partial<createTaskRequest["body"]> & {
		position?: number;
	}
>;

export const updateTask = async (params: UpdateTaskRequest) =>
	(await axiosInstance.put<Task>(`/tasks/${params.pathParams.taskId}`, params.body)).data;

export type DeleteTaskRequest = BaseRequest<{ taskId: string }>;

export const deleteTask = async (params: DeleteTaskRequest) =>
	(await axiosInstance.delete<Task>(`/tasks/${params.pathParams.taskId}`)).data;

export type ChangeStatusRequest = BaseRequest<{ taskId: string }, { statusId: string }>;

export const changeStatus = async (params: ChangeStatusRequest) =>
	(await axiosInstance.patch<Task>(`/tasks/${params.pathParams.taskId}/status`, params.body))
		.data;

// export const getTaskHistory = async ({
// 	pageId,
// 	workspaceId,
// 	taskId,
// 	limit,
// 	offset
// }: Ids & { taskId: string } & PaginationQuery) =>
// 	(
// 		await axiosInstance.get<
// 			ResponseWithPagination<
// 				VersionHistoryLog<"title" | "description" | "status" | "dueDate" | "assigneeId">
// 			>
// 		>(`/workspaces/${workspaceId}/pages/${pageId}/tasks/${taskId}/history`, {
// 			params: { limit, offset }
// 		})
// 	).data;

