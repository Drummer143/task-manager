import { axiosInstance } from "./base";

import { PaginationQuery, ResponseWithPagination, Task, TaskStatus, VersionHistoryLog } from "../types";

interface Ids {
	workspaceId: string;
	pageId: string;
}

type GetTaskIncludes = "assignee" | "page" | "reporter";

type ResponseWithIncludeFilter<T extends GetTaskIncludes | undefined = undefined> = Omit<
	Task,
	Exclude<GetTaskIncludes, T>
>;

interface GetPageArgs<T extends GetTaskIncludes | undefined = undefined> extends Ids {
	include?: T[];
}

export const getTaskList = async <T extends GetTaskIncludes | undefined = undefined>({
	pageId,
	workspaceId,
	include
}: GetPageArgs<T>) =>
	(
		await axiosInstance.get<Record<TaskStatus, ResponseWithIncludeFilter<T>[] | undefined>>(
			`/workspaces/${workspaceId}/pages/${pageId}/tasks`,
			{
				params: { include: include?.join(",") }
			}
		)
	).data;

export const getTask = async <T extends GetTaskIncludes | undefined = undefined>({
	pageId,
	taskId,
	workspaceId,
	include
}: GetPageArgs<T> & { taskId: string }) =>
	(
		await axiosInstance.get<ResponseWithIncludeFilter<T>>(
			`/workspaces/${workspaceId}/pages/${pageId}/tasks/${taskId}`,
			{
				params: { include: include?.join(",") }
			}
		)
	).data;

interface CreateTaskArgs extends Ids {
	task: {
		title: string;
		status: TaskStatus;

		dueDate?: string;
		assigneeId?: string;
		description?: string;
	};
}

export const createTask = async ({ workspaceId, pageId, task }: CreateTaskArgs) =>
	(await axiosInstance.post<Task>(`/workspaces/${workspaceId}/pages/${pageId}/tasks`, task)).data;

interface UpdateTaskArgs extends Ids {
	taskId: string;

	body: Partial<CreateTaskArgs["task"]>;
}

export const updateTask = async ({ taskId, pageId, workspaceId, body }: UpdateTaskArgs) =>
	(await axiosInstance.put<Task>(`/workspaces/${workspaceId}/pages/${pageId}/tasks/${taskId}`, body)).data;

interface DeleteTaskArgs extends Ids {
	taskId: string;
}

export const deleteTask = async ({ pageId, taskId, workspaceId }: DeleteTaskArgs) =>
	(await axiosInstance.delete<Task>(`/workspaces/${workspaceId}/pages/${pageId}/tasks/${taskId}`)).data;

interface ChangeStatusArgs extends Ids {
	taskId: string;
	status: TaskStatus;
}

export const changeStatus = async ({ taskId, pageId, workspaceId, status }: ChangeStatusArgs) =>
	(await axiosInstance.patch<Task>(`/workspaces/${workspaceId}/pages/${pageId}/tasks/${taskId}/status`, { status }))
		.data;

export const getTaskHistory = async ({
	pageId,
	workspaceId,
	taskId,
	limit,
	offset
}: Ids & { taskId: string } & PaginationQuery) =>
	(
		await axiosInstance.get<
			ResponseWithPagination<VersionHistoryLog<"title" | "description" | "status" | "dueDate" | "assigneeId">>
		>(`/workspaces/${workspaceId}/pages/${pageId}/tasks/${taskId}/history?limit=${limit}&offset=${offset}`)
	).data;
