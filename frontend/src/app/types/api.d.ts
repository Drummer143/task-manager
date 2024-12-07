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

interface ApiError {
	error: string;
	message: string;
	errorCode: string;
	statusCode: number;

	details?: Record<string, string>;
}
