import { JSONContent as TipTapContent } from "@tiptap/core";

export type UserRole = "guest" | "commentator" | "member" | "admin" | "owner";

export type PageType = "board" | "text" | "group";

export interface Timestamps {
	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
}

export interface User extends Timestamps {
	id: string;
	email: string;
	username: string;
	// lastLogin: string;
	emailVerified: boolean;

	picture?: string;
	// lastPasswordReset?: string;
}

export interface UserCredential extends Timestamps {
	id: string;
	passwordHash: string;

	passwordResetToken?: string;
	emailVerificationToken?: string;
}

export interface EntityAccess extends Timestamps {
	id: string;
	role: UserRole;

	user: User;
}

export interface Workspace extends Timestamps {
	id: string;
	name: string;
	type: string;
	role: UserRole;

	owner: User;
	pages: Page[];
}

// export type Workspace<T extends "owner" | "pages" | never = never> = Omit<
// 	FullWorkspace,
// 	Exclude<"owner" | "pages", T>
// >;

export type WorkspaceAccess = EntityAccess;

export type Type = "mainStatus" | "subStatus";

export interface BoardStatus extends Timestamps {
	id: string;
	code: string;
	type: Type;
	position: number;
	title: string;
}

export interface Page extends Timestamps {
	id: string;
	type: PageType;
	title: string;

	childPages?: Page[];
}

export type PageAccess = EntityAccess;

export interface Task extends Timestamps {
	id: string;
	title: string;
	status: BoardStatus;
	isDraft: boolean;
	position: number;
	pageId: string;
	reporter: User;

	dueDate?: string;
	assignee?: User;
	description?: TipTapContent;

}

export interface ApiError {
	error: string;
	message: string;
	errorCode: string;
	statusCode: number;

	details?: Record<string, string>;
}

export interface PaginationMeta {
	hasMore: boolean;
	total: number;
	limit: number;
	offset: number;
}

export interface ResponseWithPagination<T> {
	meta: PaginationMeta;
	data: T[];
}

export type PaginationQuery<T extends object = object> = T & {
	offset?: number;
	limit?: number;
};

export interface Change {
	from: unknown;
	to: unknown;
}

export type ChangeList<Keys extends string = string> = Partial<Record<Keys, Change>>;

export type ShortUserInfo = Pick<User, "id" | "picture" | "username">;

// export interface VersionHistoryLog<Keys extends string = string> {
// 	id: string;
// 	author: ShortUserInfo;
// 	version: number;
// 	changes: ChangeList<Keys>;
// 	createdAt: string;
// }

