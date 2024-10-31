interface User {
	createdAt: string;
	email: string;
	emailVerified: boolean;
	name: string;
	nickname: string;
	picture: string;
	updatedAt: string;
	userId: string;
	username: string;
	lastPasswordReset: string;
	lastIp: string;
	lastLogin: string;
	loginsCount: number;
}

type TaskStatus = 'not_done' | 'in_progress' | 'done';

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
