type PageRole = "owner" | "admin" | "member" | "commentator" | "guest";

type PageType = "board" | "text" | "group";

type TaskStatus = "not_done" | "in_progress" | "done";

interface User {
	id: string;
	email: string;
	username: string;
	lastLogin: string;
	emailVerified: boolean;

	picture?: string;
	lastPasswordReset?: string;

	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
}

interface UserCredentials {
	id: string;
	passwordHash: string;

	passwordResetToken?: string;
	emailVerificationToken?: string;

	user?: User;

	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
}

interface Page {
	id: string;
	type: PageType;
	name: string;
	userRole: PageRole;

	owner: User;
	parentPage: Page;
	childrenPages: Page[];
	pageAccesses: PageAccess[];
	textLines: TextPageContent;
	tasks: Task[];

	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
}

interface TextPageContent {
	id: string;
	text: string;

	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
}

interface PageAccess {
	id: string;
	role: PageRole;

	user: User;
	page: Page;

	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
}

interface Task {
	id: string;
	title: string;
	status: TaskStatus;
	deletableNotByOwner: boolean;

	dueDate?: string;
	description?: string;

	page?: Page;
	owner?: User;
	assignedUser?: User;

	createdAt: string;
	updatedAt: string;
	deletedAt?: string;
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
