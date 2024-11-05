import { removeEmptyFields } from "shared/utils";

import { axiosInstance } from "./base";

export const create = async (
	task: Omit<Task, "id" | "deletedAt" | "createdAt" | "assignee" | "deletableNotByOwner" | "author">
) => (await axiosInstance.post<Task>("/tasks", removeEmptyFields(task))).data;

export const getList = async () => (await axiosInstance.get<Record<TaskStatus, Task[] | undefined>>("/tasks")).data;

export const remove = async (id: string) => (await axiosInstance.delete<Task>(`/tasks/${id}`)).data;

export const changeStatus = async ({ id, status }: { id: string; status: TaskStatus }) =>
	(await axiosInstance.patch<Task>(`/tasks/${id}/status`, { status })).data;
