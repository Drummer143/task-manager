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

interface ApiError {
	error: string;
	message: string;
	errorCode: string;
	statusCode: number;

	details?: Record<string, string>;
}
