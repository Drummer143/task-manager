import { FormInstance } from "antd";
import { Dayjs } from "dayjs";

export interface FormValues {
	title: string;
	statusId: string;

	dueDate?: Dayjs;
	assigneeId?: string;
	description?: string;
}

export interface TaskFormProps {
	open: boolean;
	type: "create" | "edit";
	pageId: string;

	onClose: () => void;
	onCancel: () => void;
	onSubmit: (values: FormValues) => void;

	form?: FormInstance<FormValues>;
	pageError?: string;
	extraHeader?: React.ReactNode;
	formLoading?: boolean;
	submitError?: boolean | string;
	isSubmitting?: boolean;
	initialValues?: Partial<FormValues>;
}