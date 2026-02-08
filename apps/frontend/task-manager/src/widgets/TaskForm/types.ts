import { JSONContent } from "@tiptap/core";
import { Dayjs } from "dayjs";

export interface FormValues {
	title: string;
	statusId: string;

	dueDate?: Dayjs;
	assigneeId?: string;
	description?: JSONContent;
}
