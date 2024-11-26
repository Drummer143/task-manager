import { Dayjs } from "dayjs";

export interface FormValues {
	title: string;
	status: TaskStatus;

	dueDate?: Dayjs;
	assignedTo?: string;
	description?: string;
}