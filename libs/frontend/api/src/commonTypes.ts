export type PaginationQuery<T extends object = object> = T & {
	offset?: number;
	limit?: number;
};

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
