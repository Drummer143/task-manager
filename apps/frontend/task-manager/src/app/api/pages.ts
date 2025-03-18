import { axiosInstance } from "./base";

type GetPageIncludes = "tasks" | "owner" | "childrenPages" | "parentPage";

interface Ids {
	workspaceId: string;
}

type ResponseWithIncludeFilter<T extends GetPageIncludes | undefined = undefined> = Omit<
	Page,
	Exclude<GetPageIncludes, T>
>;

interface CreatePageArgs extends Ids {
	page: {
		type: PageType;
		title: string;
	
		text?: string;
		parentId?: string;
	};
}

export const createPage = async ({ workspaceId, page }: CreatePageArgs) =>
	(await axiosInstance.post<Page>(`/workspaces/${workspaceId}/pages`, page)).data;

interface GetSinglePageArgs<T extends GetPageIncludes | undefined = undefined> extends Ids {
	pageId: string;
	include?: T[];
}

export const getPage = async <T extends GetPageIncludes | undefined = undefined>({
	workspaceId,
	pageId,
	include
}: GetSinglePageArgs<T>) =>
	(
		await axiosInstance.get<ResponseWithIncludeFilter<T>>(`workspaces/${workspaceId}/pages/${pageId}`, {
			params: { include: include?.join(",") }
		})
	).data;

interface GetPageListArgs<T extends GetPageIncludes | undefined = undefined> extends Ids {
	include?: T[];
}

export const getPageList = async <T extends GetPageIncludes | undefined = undefined>({
	workspaceId,
	include
}: GetPageListArgs<T>) =>
	(
		await axiosInstance.get<ResponseWithIncludeFilter<T>[]>(`workspaces/${workspaceId}/pages`, {
			params: { include: include?.join(",") }
		})
	).data;

interface UpdatePageArgs extends Ids {
	pageId: string;

	page: Omit<Partial<CreatePageArgs["page"]>, "parentId" | "type">;
}

export const updatePage = async ({ pageId, workspaceId, page }: UpdatePageArgs) =>
	(await axiosInstance.put<Page>(`/workspaces/${workspaceId}/pages/${pageId}`, page)).data;

interface DeletePageArgs extends Ids {
	pageId: string;
}

export const deletePage = async ({ pageId, workspaceId }: DeletePageArgs) =>
	(await axiosInstance.delete<void>(`/workspaces/${workspaceId}/pages/${pageId}`)).data;
