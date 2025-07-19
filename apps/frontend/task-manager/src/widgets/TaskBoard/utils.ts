import { Task } from "@task-manager/api";

export interface TaskSourceData {
	type: "task-source";
	task: Task;
}

export const isTaskSource = (data: unknown): data is TaskSourceData =>
	(data as TaskSourceData).type === "task-source";

export interface TaskTargetData {
	type: "task-target";
	status: string;
}

export const isTaskTarget = (data: unknown): data is TaskTargetData =>
	(data as TaskTargetData).type === "task-target";

export interface ColumnSourceData {
	type: "column-source";
	statusId: string;
	position: number;
}

export const isColumnSource = (data: unknown): data is ColumnSourceData =>
	(data as ColumnSourceData).type === "column-source";

export interface ColumnTargetData {
	type: "column-target";
	position: number;
}

export const isColumnTarget = (data: unknown): data is ColumnTargetData =>
	(data as ColumnTargetData).type === "column-target";
