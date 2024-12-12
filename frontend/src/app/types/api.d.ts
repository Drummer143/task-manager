interface User {
	id: string;
	email: string;
	username: string;
	emailVerified: boolean;

	createdAt: string;
	lastLogin: string;
	updatedAt: string;
	lastPasswordReset: string;

	picture?: string;
	deletedAt?: string;
}

type TaskStatus = "not_done" | "in_progress" | "done";

interface Task {
	id: string;
	title: string;
	author: User;
	status: TaskStatus;
	createdAt: string;
	deletableNotByOwner: boolean;

	dueDate?: string;
	assignee?: User;
	deletedAt?: string;
	description?: string;
}

type UserBoardRole = "owner" | "admin" | "member" | "commentator" | "guest";

interface BoardAccesses {
	role: UserBoardRole;
	createdAt: string;

	user: User;
}

type Board = {
	id: string;
	name: string;
	userRole: UserBoardRole;

	createdAt: string;
	updatedAt: string;

	owner: User;
	tasks: Task[];
	boardAccesses: BoardAccesses[];
};

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
