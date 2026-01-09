import { axiosInstance, BaseRequest } from "./base";

import { PaginationQuery, ResponseWithPagination, User } from "../types";

interface GetUsersFilters {
	query?: string;
	exclude?: string[];
	sort_by?: string;
	sort_order?: string;
	workspaceId?: string;
	email?: string;
	username?: string;
}

export type GetUsersRequest = BaseRequest<PaginationQuery & GetUsersFilters>;

export const getUserList = async (params: GetUsersRequest) =>
	(
		await axiosInstance.get<ResponseWithPagination<User>>("/users", {
			params: params.pathParams
		})
	).data;

