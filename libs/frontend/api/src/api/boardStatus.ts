import { axiosInstance } from "./base";

import { BoardStatus } from "../types";

interface Ids {
	workspaceId: string;
	pageId: string;
}

export const getBoardStatuses = async ({ workspaceId, pageId }: Ids) =>
	(
		await axiosInstance.get<BoardStatus[]>(
			`/workspaces/${workspaceId}/pages/${pageId}/board-statuses`
		)
	).data;

