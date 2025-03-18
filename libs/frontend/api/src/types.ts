export type UserRole = "owner" | "admin" | "member" | "commentator" | "guest";

export type PageType = "board" | "text" | "group";

export type TaskStatus = "not_done" | "in_progress" | "done";

export interface Timestamps {
	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
}

export interface User extends Timestamps {
	id: string;
	email: string;
	username: string;
	lastLogin: string;
	emailVerified: boolean;

	picture?: string;
	lastPasswordReset?: string;
}

export interface UserCredential extends Timestamps {
	id: string;
	passwordHash: string;

	passwordResetToken?: string;
	emailVerificationToken?: string;
}

export interface Workspace extends Timestamps {
	id: string;
	name: string;
	type: string;
	role: UserRole;

	owner: User;
	pages: Page[];
}

export interface WorkspaceAccess extends Timestamps {
	id: string;
	role: UserRole;

	user: User;
}

export interface Page extends Timestamps {
	id: string;
	type: PageType;
	title: string;
	role: UserRole;

	text?: string;

	owner: User;
	parentPage: Page;
	childPages: Page[];
	tasks: Task[];
	workspace: Workspace;
}

export interface PageAccess extends Timestamps {
	role: UserRole;

	user: User;
}

export interface Task extends Timestamps {
	id: string;
	title: string;
	status: TaskStatus;

	dueDate?: string;
	description?: string;

	page: Page;
	assignee: User;
	reporter: User;
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
}

export interface Change {
	from: unknown;
	to: unknown;
}

export interface VersionHistoryLog<Keys extends string = string> {
	version: number;
	id: string;
	changes: Partial<Record<Keys, Change>>;
	createdAt: string;
}
