import { removeEmptyFields } from "shared/utils";

import { axiosInstance } from "./base";

export const createTask = async (
	task: Omit<Task, "id" | "deletedAt" | "createdAt" | "assignedUser" | "deletableNotByOwner" | "owner" | "updatedAt"> & {
		pageId: string;
	}
) => (await axiosInstance.post<Task>("/tasks", removeEmptyFields(task))).data;

export const getTaskList = async (pageId: string) =>
	(await axiosInstance.get<Record<TaskStatus, Task[] | undefined>>(`/tasks?page_id=${pageId}`)).data;

export const getTask = async (id: string) => (await axiosInstance.get<Task>(`/tasks/${id}`)).data;

interface UpdateTaskArgs {
	id: string;

	body: {
		title?: string;
		status?: string;
		dueDate?: string;
		assignedTo?: string;
		description?: string;
		deletableNotByOwner?: boolean;
	};
}

export const updateTask = async ({ id, body }: UpdateTaskArgs) =>
	(await axiosInstance.put<Task>(`/tasks/${id}`, removeEmptyFields(body))).data;

export const deleteTask = async (id: string) => (await axiosInstance.delete<Task>(`/tasks/${id}`)).data;

export const changeStatus = async ({ id, status }: { id: string; status: TaskStatus }) =>
	(await axiosInstance.patch<Task>(`/tasks/${id}/status`, { status })).data;
