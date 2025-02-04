import { FormInstance } from "antd";
import { Dayjs } from "dayjs";

export interface FormValues {
	title: string;
	status: TaskStatus;

	dueDate?: Dayjs;
	assignedTo?: string;
	description?: string;
}

export interface TaskFormProps {
	open: boolean;
	type: "create" | "update";

	onClose: () => void;
	onCancel: () => void;
	onSubmit: (values: FormValues) => void;

	form?: FormInstance<FormValues>;
	pageError?: string;
	formLoading?: boolean;
	submitError?: boolean | string;
	isSubmitting?: boolean;
	initialValues?: Partial<FormValues>;
}
