import React, { useCallback } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Form } from "antd";
import api from "api";
import { useParams } from "react-router-dom";

import { FormValues, NewTaskFormProps } from "./types";

import TaskForm from "../TaskForm";

const NewTaskForm: React.FC<NewTaskFormProps> = ({ onClose, open }) => {
	const queryClient = useQueryClient();

	const boardId = useParams<{ id: string }>().id!;

	const [form] = Form.useForm<FormValues>();

	const { mutateAsync, isPending } = useMutation({
		mutationFn: api.tasks.create,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] })
	});

	const handleSubmit = useCallback(
		async (values: FormValues) => {
			try {
				await mutateAsync({ ...values, dueDate: values.dueDate?.toISOString(), boardId });

				onClose();
			} catch {
				/* empty */
			}
		},
		[boardId, mutateAsync, onClose]
	);

	const handleCancel = () => {
		form.resetFields();
		onClose();
	};

	return (
		<TaskForm
			onCancel={handleCancel}
			onSubmit={handleSubmit}
			form={form}
			isSubmitting={isPending}
			onClose={onClose}
			open={open}
		/>
	);
};

export default NewTaskForm;
