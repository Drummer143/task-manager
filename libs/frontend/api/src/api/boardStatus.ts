import { axiosInstance, BaseRequest } from "./base";

import { BoardStatus } from "../types";

interface Ids {
	pageId: string;
}

export type GetBoardStatusesRequest = BaseRequest<Ids>;

export const getBoardStatuses = async (params: GetBoardStatusesRequest) =>
	(await axiosInstance.get<BoardStatus[]>(`pages/${params.pathParams.pageId}/board-statuses`))
		.data;

