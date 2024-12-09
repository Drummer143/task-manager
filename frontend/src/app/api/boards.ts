import { axiosInstance } from "./base";
import { CreateBoardArgs, UpdateBoardAccessArgs } from "./types";

type GetBoardIncludes = "tasks" | "owner" | "boardAccesses";

type ResponseWithIncludeFilter<T extends GetBoardIncludes | undefined = undefined> = Omit<
	Board,
	Exclude<GetBoardIncludes, T>
>;

export const getSingle = async <T extends GetBoardIncludes | undefined = undefined>(id: string, include?: T[]) =>
	(
		await axiosInstance.get<ResponseWithIncludeFilter<T>>(`/boards/${id}`, {
			params: { include }
		})
	).data;

export const getList = async <T extends GetBoardIncludes | undefined = undefined>(include?: T[]) =>
	(await axiosInstance.get<ResponseWithIncludeFilter<T>[]>("/boards", { params: { include } })).data;

export const createBoard = async (board: CreateBoardArgs) => (await axiosInstance.post<Board>("/boards", board)).data;

export const updateBoard = async (id: string, board: Partial<CreateBoardArgs>) =>
	(await axiosInstance.put<Board>(`/boards/${id}`, board)).data;

export const deleteBoard = async (id: string) => (await axiosInstance.delete<void>(`/boards/${id}`)).data;

export const updateBoardAccess = async (id: string, accesses: UpdateBoardAccessArgs) =>
	(await axiosInstance.post<void>(`/boards/${id}/board-accesses`, accesses)).data;
