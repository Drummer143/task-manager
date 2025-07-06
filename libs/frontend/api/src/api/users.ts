import { axiosInstance } from "./base";

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

export const getUserList = async (query?: PaginationQuery<GetUsersFilters>) =>
	(await axiosInstance.get<ResponseWithPagination<User>>("/users", { params: query })).data;