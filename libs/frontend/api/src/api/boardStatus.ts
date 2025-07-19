import { axiosInstance } from "./base";

import { BoardStatus, BoardStatusType } from "../types";

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

export interface CreateBoardStatusArgs extends Ids {
	body: {
		code: string;
		localizations: Record<string, string>;
		position: number;
		type: BoardStatusType;

		initial?: boolean;
		parent_status_id?: string;
	};
}

export const createBoardStatus = async ({ workspaceId, pageId, body }: CreateBoardStatusArgs) =>
	(
		await axiosInstance.post<BoardStatus>(
			`/workspaces/${workspaceId}/pages/${pageId}/board-statuses`,
			body
		)
	).data;

export interface UpdateBoardStatusArgs extends Ids {
	boardStatusId: string;
	body: {
		initial?: boolean;
		position?: number;
		localizations?: Record<string, string>;
	};
}

export const updateBoardStatus = async ({
	workspaceId,
	pageId,
	boardStatusId,
	body
}: UpdateBoardStatusArgs) =>
	(
		await axiosInstance.put<BoardStatus>(
			`/workspaces/${workspaceId}/pages/${pageId}/board-statuses/${boardStatusId}`,
			body
		)
	).data;
