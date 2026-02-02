import { BaseRequest, mainInstance } from "./base";

import { BoardStatus } from "../types";

interface Ids {
	pageId: string;
}

export type GetBoardStatusesRequest = BaseRequest<Ids>;

export const getBoardStatuses = async (params: GetBoardStatusesRequest) =>
	(await mainInstance.get<BoardStatus[]>(`pages/${params.pathParams.pageId}/board-statuses`))
		.data;

