import { Dayjs } from "dayjs";

export interface NewTaskFormProps {
	open: boolean;

	onClose: () => void;
}

export interface FormValues {
	title: string;
	status: TaskStatus;

	dueDate?: Dayjs;
	assignedTo?: string;
	description?: string;
}
