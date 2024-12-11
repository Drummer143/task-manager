import dayjs from "dayjs";

export const statusArray: TaskStatus[] = ["not_done", "in_progress", "done"];

export const taskStatusLocale: Record<TaskStatus, string> = {
	done: "Done",
	in_progress: "In progress",
	not_done: "Not done"
};

export const statusColors: Record<TaskStatus, string> = {
	done: "var(--ant-color-done)",
	in_progress: "var(--ant-color-in-progress)",
	not_done: "var(--ant-color-not-done)"
};

export const today = dayjs();
