export interface TaskSourceData {
	type: "task-source";
	id: string;
	position: number;
	statusId: string;
}

export const isTaskSource = (data: unknown): data is TaskSourceData =>
	(data as TaskSourceData).type === "task-source" && "id" in (data as TaskSourceData);

export interface TaskTargetData {
	type: "task-target";
	id: string;
	position: number;
	statusId: string;
}

export const isTaskTarget = (data: unknown): data is TaskTargetData =>
	(data as TaskTargetData).type === "task-target" && "id" in (data as TaskTargetData);

export interface ColumnTargetData {
	type: "column-target";
	status: string;
}

export const isColumnTarget = (data: unknown): data is ColumnTargetData =>
	(data as ColumnTargetData).type === "column-target" && "status" in (data as ColumnTargetData);

