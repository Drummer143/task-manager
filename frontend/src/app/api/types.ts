export interface CreateBoardArgs {
	name: string;
}

export type UpdateBoardAccessArgs = Array<{
	role?: UserBoardRole;

	userId: string;
}>
