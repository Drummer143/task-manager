import { axiosInstance } from "./base";

interface Ids {
	workspaceId: string;
}

type GetAccessIncludes = "user";

type ResponseWithIncludeFilter<T extends GetAccessIncludes | undefined = undefined> = Omit<
	PageAccess,
	Exclude<GetAccessIncludes, T>
>;

interface GetPageAccessArgs<T extends GetAccessIncludes | undefined = undefined> extends Ids {
	include?: T[];

	pageId: string;
}

export const getPageAccess = async <T extends GetAccessIncludes | undefined = undefined>({
	pageId,
	workspaceId
}: GetPageAccessArgs<T>) =>
	(await axiosInstance.get<ResponseWithIncludeFilter<T>[]>(`/workspaces/${workspaceId}/pages/${pageId}/accesses`))
		.data;

interface UpdatePageAccessArgs extends Ids {
	pageId: string;

	body: {
		role?: string;

		userId: string;
	};
}

export const updatePageAccess = async ({ pageId, body }: UpdatePageAccessArgs) =>
	(await axiosInstance.put<"Success">(`/pages/${pageId}/accesses`, body)).data;
