import React, { useCallback, useEffect } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createTask } from "@task-manager/api";
import { useDisclosure } from "@task-manager/react-utils";
import { Form } from "antd";
import { useParams } from "react-router-dom";

import { useAuthStore } from "../../../../../app/store/auth";
import TaskForm from "../TaskForm";
import { FormValues } from "../TaskForm/types";

const NewTaskForm: React.FC = () => {
	const queryClient = useQueryClient();

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const pageId = useParams<{ id: string }>().id!;

	const { onClose, onOpen, open } = useDisclosure();

	const [form] = Form.useForm<FormValues>();

	const { mutateAsync, isPending, error } = useMutation({
		mutationFn: createTask,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [pageId] })
	});

	const handleSubmit = useCallback(
		async (values: FormValues) => {
			await mutateAsync({
				task: { ...values, dueDate: values.dueDate?.toISOString() },
				workspaceId: useAuthStore.getState().user.workspace.id,
				pageId
			});

			onClose();
		},
		[pageId, mutateAsync, onClose]
	);

	const handleCancel = () => {
		form.resetFields();
		onClose();
	};

	useEffect(() => {
		const handleOpenModal: DocumentEventHandler<"createTask"> = e => {
			form.setFieldValue("status", e.detail.status);

			onOpen();
		};

		document.addEventListener("createTask", handleOpenModal);

		return () => document.removeEventListener("createTask", handleOpenModal);
	}, [form, onOpen]);

	return (
		<TaskForm
			isSubmitting={isPending}
			submitError={error?.message}
			onCancel={handleCancel}
			onSubmit={handleSubmit}
			onClose={onClose}
			type="create"
			form={form}
			open={open}
		/>
	);
};

export default NewTaskForm;