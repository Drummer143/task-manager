import { Task } from "@task-manager/api";

export interface TaskSourceData {
	type: "task";
	task: Task;
}

export const isTaskSource = (data: unknown): data is TaskSourceData =>
	(data as TaskSourceData).type === "task" && "task" in (data as TaskSourceData);

export interface TaskTargetData {
	type: "task";
	status: string;
}

export const isTaskTarget = (data: unknown): data is TaskTargetData =>
	(data as TaskTargetData).type === "task" && "status" in (data as TaskTargetData);

