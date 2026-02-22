import { JSONContent } from "@tiptap/core";

import { BaseRequest, mainInstance } from "./base";

import { BoardStatus, Page, PageType, User, UserRole } from "../types";

type CreatePageRequest = BaseRequest<
	{ workspaceId: string },
	{
		type: PageType;
		title: string;

		content?: JSONContent;
		parentPageId?: string;
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
		await mainInstance.get<T extends "list" ? Omit<Page, "childPages">[] : Page[]>(
			`workspaces/${params.pathParams.workspaceId}/pages`,
			{
				params: { format: params.pathParams.format }
			}
		)
	).data;

export type GetPageRequest = BaseRequest<{
	pageId: string;
}>;

export const getPage = async (params: GetPageRequest) =>
	(await mainInstance.get<Page>(`pages/${params.pathParams.pageId}`)).data;

export type UpdatePageRequest = BaseRequest<
	{ pageId: string },
	Omit<Partial<CreatePageRequest["body"]>, "parentPageId" | "type">
>;

export const updatePage = async (params: UpdatePageRequest) =>
	(await mainInstance.put<Page>(`pages/${params.pathParams.pageId}`, params.body)).data;

export type DeletePageRequest = BaseRequest<{ pageId: string }>;

export const deletePage = async (params: DeletePageRequest) =>
	(await mainInstance.delete<void>(`pages/${params.pathParams.pageId}`)).data;

interface DetailedPageResponseBase {
	id: string;
	title: string;
	userRole: UserRole;
	createdAt: string;
	updatedAt: string;

	deletedAt?: string;
}

export interface DetailedPageResponseText extends DetailedPageResponseBase {
	type: "text";

	content?: JSONContent | null;
}

export interface PreviewTaskModel {
	id: string;
	title: string;
	position: number;
	isDraft: boolean;
	statusId: string;

	dueDate?: string;
	assigneeId?: string;
}

export interface DetailedPageResponseBoard extends DetailedPageResponseBase {
	type: "board";

	assignees: User[];
	statuses: BoardStatus[];
	tasks: PreviewTaskModel[];
}

export interface DetailedPageResponseGroup extends DetailedPageResponseBase {
	type: "group";

	childPages: Page[];
}

export type DetailedPageResponse =
	| DetailedPageResponseText
	| DetailedPageResponseBoard
	| DetailedPageResponseGroup;

export type GetPageDetailedRequest = BaseRequest<{
	pageId: string;
}>;

export const getDetailedPage = async (params: GetPageDetailedRequest) =>
	(await mainInstance.get<DetailedPageResponse>(`pages/${params.pathParams.pageId}/detailed`))
		.data;

