import { axiosInstance } from "./base";

type GetBoardIncludes = "tasks" | "owner" | "boardAccesses";

type ResponseWithIncludeFilter<T extends GetBoardIncludes | undefined = undefined> = Omit<
	Board,
	Exclude<GetBoardIncludes, T>
>;

interface GetSingleBoardArgs<T extends GetBoardIncludes | undefined = undefined> {
	id: string;
	include?: T[];
}

export const getBoard = async <T extends GetBoardIncludes | undefined = undefined>({
	id,
	include
}: GetSingleBoardArgs<T>) =>
	(
		await axiosInstance.get<ResponseWithIncludeFilter<T>>(`/boards/${id}`, {
			params: { include: include?.join(",") }
		})
	).data;

export const getBoardList = async <T extends GetBoardIncludes | undefined = undefined>(include?: T[]) =>
	(await axiosInstance.get<ResponseWithIncludeFilter<T>[]>("/boards", { params: { include: include?.join(",") } }))
		.data;

interface CreateBoardArgs {
	name: string;
}

export const createBoard = async (board: CreateBoardArgs) => (await axiosInstance.post<Board>("/boards", board)).data;

export const updateBoard = async (id: string, board: Partial<CreateBoardArgs>) =>
	(await axiosInstance.put<Board>(`/boards/${id}`, board)).data;

export const deleteBoard = async (id: string) => (await axiosInstance.delete<void>(`/boards/${id}`)).data;

interface UpdateBoardAccessArgs {
	boardId: string;

	body: {
		role?: string;

		userId: string;
	};
}

export const updateBoardAccess = async ({ boardId, body }: UpdateBoardAccessArgs) =>
	(await axiosInstance.put<"Success">(`/boards/${boardId}/accesses`, body)).data;

export const getBoardAccess = async (id: string) =>
	(await axiosInstance.get<BoardAccesses[]>(`/boards/${id}/accesses`)).data;
