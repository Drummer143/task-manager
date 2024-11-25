import React, { useCallback, useEffect } from "react";

import { Form } from "antd";
import dayjs from "dayjs";
import { FieldData } from "rc-field-form/lib/interface";
import { useSearchParams } from "react-router-dom";
import { useDebouncedCallback } from "use-debounce";

import { useWebsocketStore } from "store/websocketStore";

import TaskForm from "../TaskForm";
import { FormValues } from "../TaskForm/types";

const EditTaskForm: React.FC = () => {
	const [searchParams, setSearchParams] = useSearchParams();

	const taskId = searchParams.get("task");

	const { task, send } = useWebsocketStore();

	const [form] = Form.useForm<FormValues>();

	const handleFormChange = useDebouncedCallback((values: FieldData<FormValues>[]) => {
		const body = values.reduce<Partial<FormValues>>((acc, value) => {
			if (value.value !== undefined) {
				acc[value.name as keyof FormValues] = value.value;
			}

			return acc;
		}, {} as Partial<FormValues>);

		send({ type: "update-task", body: { ...body, dueDate: body.dueDate?.toISOString(), id: taskId! } });
	}, 1000);

	const handleClose = useCallback(() => {
		setSearchParams(prev => {
			prev.delete("task");

			return prev;
		});
	}, [setSearchParams]);

	useEffect(() => {
		if (taskId) {
			send({ type: "get-task", body: taskId });
		}
	}, [send, taskId]);

	useEffect(() => {
		if (task) {
			form.setFieldsValue({
				assignedTo: task.assignee?.id,
				description: task.description,
				dueDate: task.dueDate ? dayjs(task.dueDate) : undefined,
				status: task.status,
				title: task.title
			});
		}
	}, [form, task]);

	return (
		<TaskForm
			cancelText={false}
			okText={false}
			form={form}
			open={!!taskId}
			loading={!task}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			onFieldsChange={handleFormChange as any}
			onClose={handleClose}
			onCancel={handleClose}
		/>
	);
};

export default EditTaskForm;
