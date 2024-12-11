import dayjs from "dayjs";

export const statusArray: TaskStatus[] = ["not_done", "in_progress", "done"];

export const taskStatusLocale: Record<TaskStatus, string> = {
	done: "Done",
	in_progress: "In progress",
	not_done: "Not done"
};

export const statusColors: Record<TaskStatus, string> = {
	done: "--ant-color-done",
	in_progress: "--ant-color-in-progress",
	not_done: "--ant-color-not-done"
};

export const today = dayjs();
