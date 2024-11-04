import dayjs from "dayjs";

export const statusArray: TaskStatus[] = ["not_done", "in_progress", "done"];

export const taskStatusLocale: Record<TaskStatus, string> = {
	done: "Done",
	in_progress: "In progress",
	not_done: "Not done"
};

export const statusColors: Record<TaskStatus, string> = {
	done: "rgba(0, 166, 90, 1)",
	in_progress: "rgba(243, 156, 18, 1)",
	not_done: "rgba(221, 75, 57, 1)"
};

export const updateOpacity = (rgba: string, opacity: number) => {
	return rgba.replace(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*(\d+(?:\.\d+)?)\)/, `rgba($1, $2, $3, ${opacity})`);
};

export const today = dayjs();
