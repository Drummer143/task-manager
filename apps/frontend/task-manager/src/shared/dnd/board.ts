import { Task } from "@task-manager/api";

export interface TaskSourceData {
	type: "task-source";
	task: Task;
}

export const isTaskSource = (data: unknown): data is TaskSourceData =>
	(data as TaskSourceData).type === "task-source" && "task" in (data as TaskSourceData);

export interface TaskTargetData {
	type: "task-target";
	task: Task;
}

export const isTaskTarget = (data: unknown): data is TaskTargetData =>
	(data as TaskTargetData).type === "task-target" && "task" in (data as TaskTargetData);

export interface ColumnTargetData {
	type: "column-target";
	status: string;
}

export const isColumnTarget = (data: unknown): data is ColumnTargetData =>
	(data as ColumnTargetData).type === "column-target" && "status" in (data as ColumnTargetData);
