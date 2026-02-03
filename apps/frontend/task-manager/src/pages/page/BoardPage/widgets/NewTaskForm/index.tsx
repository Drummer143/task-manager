import React, { useCallback, useEffect } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDraft as createDraftApi, createTask as createTaskApi } from "@task-manager/api";
import { useDisclosure } from "@task-manager/react-utils";
import { App, Form } from "antd";
import { useParams } from "react-router";

import TaskForm from "../TaskForm";
import { FormValues } from "../TaskForm/types";

const NewTaskForm: React.FC = () => {
	const queryClient = useQueryClient();

	const pageId = useParams<{ id: string }>().id!;

	const { onClose, onOpen, open } = useDisclosure();

	const message = App.useApp().message;

	const [form] = Form.useForm<FormValues>();

	const {
		mutateAsync: createDraft,
		isPending: isDraftPending,
		data,
		reset
	} = useMutation({
		mutationFn: createDraftApi,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [pageId] }),
		onError: error => {
			onClose();

			form.resetFields();

			message.error(error.message);
		}
	});

	const {
		mutateAsync: createTask,
		isPending,
		error: taskError
	} = useMutation({
		mutationFn: createTaskApi,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [pageId] });

			reset();
		}
	});

	const handleSubmit = useCallback(
		async (values: FormValues) => {
			await createTask({
				pathParams: {
					pageId
				},
				body: { ...values, dueDate: values.dueDate?.toISOString() }
			});

			onClose();
		},
		[pageId, createTask, onClose]
	);

	const handleCancel = () => {
		form.resetFields();
		onClose();
	};

	useEffect(() => {
		const handleOpenModal: DocumentEventHandler<"createTask"> = e => {
			form.setFieldValue("statusId", e.detail.status);

			createDraft({
				pathParams: {
					pageId
				},
				body: {
					boardStatusId: e.detail.status
				}
			});

			onOpen();
		};

		document.addEventListener("createTask", handleOpenModal);

		return () => document.removeEventListener("createTask", handleOpenModal);
	}, [createDraft, form, onOpen, pageId]);

	return (
		<TaskForm
			isSubmitting={isPending}
			submitError={taskError?.message}
			formLoading={isDraftPending}
			onCancel={handleCancel}
			onSubmit={handleSubmit}
			onClose={onClose}
			type="create"
			form={form}
			open={open}
			pageId={pageId}
			taskId={data?.id}
		/>
	);
};

export default NewTaskForm;

