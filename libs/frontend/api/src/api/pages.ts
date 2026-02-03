import { JSONContent } from "@tiptap/react";

import { BaseRequest, mainInstance } from "./base";

import { Page, PageType } from "../types";

type GetPageIncludes =
	| "tasks"
	| "owner"
	| "childPages"
	| "parentPage"
	| "workspace"
	| "boardStatuses";

type ResponseWithIncludeFilter<T extends GetPageIncludes | undefined = undefined> = Omit<
	Page,
	Exclude<GetPageIncludes, T>
>;

type CreatePageRequest = BaseRequest<
	{ workspaceId: string },
	{
		type: PageType;
		title: string;

		content?: JSONContent;
		parentId?: string;
	}
>;

export const createPage = async (params: CreatePageRequest) =>
	(
		await mainInstance.post<Page>(
			`workspaces/${params.pathParams.workspaceId}/pages`,
			params.body
		)
	).data;

type ListFormat = "list" | "tree";

export type GetPageListRequest<T extends ListFormat = "list"> = BaseRequest<{
	workspaceId: string;
	format?: T;
}>;

export const getPageList = async <T extends ListFormat = "list">(params: GetPageListRequest<T>) =>
	(
		await mainInstance.get<
			T extends "list"
				? ResponseWithIncludeFilter[]
				: ResponseWithIncludeFilter<"childPages">[]
		>(`workspaces/${params.pathParams.workspaceId}/pages`, {
			params: { format: params.pathParams.format }
		})
	).data;

export type GetPageRequest<T extends GetPageIncludes | undefined = undefined> = BaseRequest<{
	pageId: string;
	include?: T[];
}>;

export const getPage = async <T extends GetPageIncludes | undefined = undefined>(
	params: GetPageRequest<T>
) =>
	(
		await mainInstance.get<ResponseWithIncludeFilter<T>>(`pages/${params.pathParams.pageId}`, {
			params: { include: params.pathParams.include?.join(",") }
		})
	).data;

export type UpdatePageRequest = BaseRequest<
	{ pageId: string },
	Omit<Partial<CreatePageRequest["body"]>, "parentId" | "type">
>;

export const updatePage = async (params: UpdatePageRequest) =>
	(await mainInstance.put<Page>(`pages/${params.pathParams.pageId}`, params.body)).data;

export type DeletePageRequest = BaseRequest<{ pageId: string }>;

export const deletePage = async (params: DeletePageRequest) =>
	(await mainInstance.delete<void>(`pages/${params.pathParams.pageId}`)).data;

