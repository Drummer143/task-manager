import React, { useCallback } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "api";
import dayjs from "dayjs";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

import { FormValues } from "../NewTaskForm/types";
import TaskForm from "../TaskForm";

const EditTaskForm: React.FC = () => {
	const boardId = useParams<{ id: string }>().id!;
	const taskId = useSearchParams()[0].get("taskId");

	const queryClient = useQueryClient();

	const navigate = useNavigate();

	const handleClose = useCallback(() => navigate(`/boards/${boardId}`), [boardId, navigate]);

	const { isLoading, data } = useQuery({
		queryKey: ["task", taskId],
		queryFn: async (): Promise<FormValues> => {
			const result = await api.tasks.getSingle(taskId!);

			return {
				status: result.status,
				title: result.title,
				description: result.description,
				assignedTo: result.assignee?.id,
				dueDate: result.dueDate ? dayjs(result.dueDate) : undefined
			};
		},
		enabled: !!taskId
	});

	const { mutateAsync, isPending } = useMutation({
		mutationFn: api.tasks.updateTask,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			navigate(`/boards/${boardId}`);
		}
	});

	const handleSubmit = useCallback(
		async (values: FormValues) =>
			mutateAsync({
				id: taskId!,
				body: {
					...values,
					dueDate: values.dueDate?.toISOString()
				}
			}),
		[taskId, mutateAsync]
	);

	return (
		<TaskForm
			open={!!taskId}
			onClose={handleClose}
			formLoading={isLoading}
			initialValues={data}
			onCancel={handleClose}
			onSubmit={handleSubmit}
			isSubmitting={isPending}
		/>
	);
};

export default EditTaskForm;
