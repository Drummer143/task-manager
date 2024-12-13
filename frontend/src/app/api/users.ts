import { axiosInstance } from "./base";

interface GetUsersFilters {
	name_or_email?: string;
	exclude?: string;
}

export const getUserList = async (query?: PaginationQuery<GetUsersFilters>) =>
	(await axiosInstance.get<ResponseWithPagination<User>>("/users", { params: query })).data;
