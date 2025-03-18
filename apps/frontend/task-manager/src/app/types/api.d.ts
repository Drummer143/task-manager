type UserRole = "owner" | "admin" | "member" | "commentator" | "guest";

type PageType = "board" | "text" | "group";

type TaskStatus = "not_done" | "in_progress" | "done";

interface Timestamps {
	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
}

interface User extends Timestamps {
	id: string;
	email: string;
	username: string;
	lastLogin: string;
	emailVerified: boolean;

	picture?: string;
	lastPasswordReset?: string;
}

interface UserCredential extends Timestamps {
	id: string;
	passwordHash: string;

	passwordResetToken?: string;
	emailVerificationToken?: string;
}

interface Workspace extends Timestamps {
	id: string;
	name: string;
	type: string;
	role: UserRole;

	owner: User;
	pages: Page[];
}

interface WorkspaceAccess extends Timestamps {
	id: string;
	role: UserRole;

	user: User;
}

interface Page extends Timestamps {
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

interface PageAccess extends Timestamps {
	role: UserRole;

	user: User;
}

interface Task extends Timestamps {
	id: string;
	title: string;
	status: TaskStatus;

	dueDate?: string;
	description?: string;

	page: Page;
	assignee: User;
	reporter: User;
}

interface ApiError {
	error: string;
	message: string;
	errorCode: string;
	statusCode: number;

	details?: Record<string, string>;
}

interface PaginationMeta {
	hasMore: boolean;
	total: number;
	limit: number;
	offset: number;
}

interface ResponseWithPagination<T> {
	meta: PaginationMeta;
	data: T[];
}

interface PaginationQuery<T extends object = never> extends T {
	offset?: number;
	limit?: number;
}

interface Change {
	from: unknown;
	to: unknown;
}

interface VersionHistoryLog<Keys extends string = string> {
	version: number;
	id: string;
	changes: Partial<Record<Keys, Change>>;
	createdAt: string;
}
