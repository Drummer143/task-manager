import { axiosInstance } from "./base";

import { PaginationQuery, ResponseWithPagination, TaskChatMessage } from "../types";

type Ids = {
	workspaceId: string;
	pageId: string;
	taskId: string;
};

export const getMessages = async ({ pageId, taskId, workspaceId, limit, offset }: Ids & PaginationQuery) =>
	(
		await axiosInstance.get<ResponseWithPagination<TaskChatMessage>>(
			`/workspaces/${workspaceId}/pages/${pageId}/tasks/${taskId}/chat`,
			{
				params: { limit, offset }
			}
		)
	).data;

export const sendMessage = async ({ pageId, taskId, workspaceId, text }: Ids & { text: string }) =>
	(
		await axiosInstance.post<TaskChatMessage>(`/workspaces/${workspaceId}/pages/${pageId}/tasks/${taskId}/chat`, {
			text
		})
	).data;