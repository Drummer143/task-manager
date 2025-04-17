import { axiosInstance } from "./base";

import { PaginationQuery, ResponseWithPagination, User } from "../types";

interface GetUsersFilters {
	name_or_email?: string;
	exclude?: string;
}

export const getUserList = async (query?: PaginationQuery<GetUsersFilters>) =>
	(await axiosInstance.get<ResponseWithPagination<User>>("/users", { params: query })).data;