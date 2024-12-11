import React, { useCallback } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button, Form } from "antd";
import { createTask } from "api";
import { useParams } from "react-router-dom";

import { useDisclosure } from "shared/hooks";

import TaskForm from "../TaskForm";
import { FormValues } from "../TaskForm/types";

const NewTaskForm: React.FC = () => {
	const queryClient = useQueryClient();

	const boardId = useParams<{ id: string }>().id!;

	const { onClose, onOpen, open } = useDisclosure();

	const [form] = Form.useForm<FormValues>();

	const { mutateAsync, isPending } = useMutation({
		mutationFn: createTask,
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
		<>
			<Button icon={<PlusOutlined />} type="primary" onClick={onOpen}>
				New Task
			</Button>

			<TaskForm
				onCancel={handleCancel}
				onSubmit={handleSubmit}
				form={form}
				isSubmitting={isPending}
				onClose={onClose}
				open={open}
			/>
		</>
	);
};

export default NewTaskForm;
