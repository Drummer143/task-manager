import { axiosInstance } from "./base";

type GetPageIncludes = "tasks" | "owner" | "pageAccesses" | "textLines" | "childrenPages" | "parentPage";

type ResponseWithIncludeFilter<T extends GetPageIncludes | undefined = undefined> = Omit<
	Page,
	Exclude<GetPageIncludes, T>
>;

interface GetSinglePageArgs<T extends GetPageIncludes | undefined = undefined> {
	id: string;
	include?: T[];
}

export const getPage = async <T extends GetPageIncludes | undefined = undefined>({
	id,
	include
}: GetSinglePageArgs<T>) =>
	(
		await axiosInstance.get<ResponseWithIncludeFilter<T>>(`/pages/${id}`, {
			params: { include: include?.join(",") }
		})
	).data;

export const getPageList = async <T extends GetPageIncludes | undefined = undefined>(include?: T[]) =>
	(await axiosInstance.get<ResponseWithIncludeFilter<T>[]>("/pages", { params: { include: include?.join(",") } }))
		.data;

interface CreatePageArgs {
	type: PageType;
	name: string;

	parentId?: string;
}

export const createPage = async (page: CreatePageArgs) => (await axiosInstance.post<Page>("/pages", page)).data;

export const updatePage = async (id: string, page: Partial<CreatePageArgs>) =>
	(await axiosInstance.put<Page>(`/pages/${id}`, page)).data;

export const deletePage = async (id: string) => (await axiosInstance.delete<void>(`/pages/${id}`)).data;

interface UpdatePageAccessArgs {
	pageId: string;

	body: {
		role?: string;

		userId: string;
	};
}

export const updatePageAccess = async ({ pageId, body }: UpdatePageAccessArgs) =>
	(await axiosInstance.put<"Success">(`/pages/${pageId}/accesses`, body)).data;

export const getPageAccess = async (id: string) =>
	(await axiosInstance.get<PageAccess[]>(`/pages/${id}/accesses`)).data;

interface UpdateTextPageContentArgs {
	id: string;
	text: string;
}

export const updateTextPageContent = ({ id, text }: UpdateTextPageContentArgs) =>
	axiosInstance.put<TextPageContent>(`/pages/${id}/text`, { text }).then(res => res.data);
