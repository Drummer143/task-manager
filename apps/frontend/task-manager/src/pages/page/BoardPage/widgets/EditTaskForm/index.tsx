import React, { useCallback } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTask, updateTask } from "@task-manager/api";
import { App } from "antd";
import dayjs from "dayjs";
import { useNavigate, useParams, useSearchParams } from "react-router";

import { useAuthStore } from "../../../../../app/store/auth";
// import TaskChat from "../TaskChat";
import TaskForm from "../TaskForm";
import { FormValues } from "../TaskForm/types";
// import TaskHistory from "../TaskHistory";

const EditTaskForm: React.FC = () => {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const pageId = useParams<{ id: string }>().id!;

	const taskId = useSearchParams()[0].get("taskId");

	const message = App.useApp().message;

	const queryClient = useQueryClient();

	const navigate = useNavigate();

	const handleClose = useCallback(() => navigate(`/pages/${pageId}`), [pageId, navigate]);

	const { isLoading, data: taskInitialValues } = useQuery({
		queryKey: [taskId],
		enabled: !!taskId,
		queryFn: async (): Promise<FormValues> => {
			const result = await getTask({
				pageId,
				taskId: taskId!,
				workspaceId: useAuthStore.getState().user.workspace.id,
				include: ["assignee"]
			});

			return {
				statusId: result.status.id,
				title: result.title,
				description: result.description,
				assigneeId: result.assignee?.id,
				dueDate: result.dueDate ? dayjs(result.dueDate) : undefined
			};
		}
	});

	const { mutateAsync, isPending } = useMutation({
		mutationFn: updateTask,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [pageId] });
			navigate(`/pages/${pageId}`);
		},
		onError: error => message.error(error.message ?? "Failed to update task")
	});

	const handleSubmit = useCallback(
		async (values: FormValues) =>
			mutateAsync({
				taskId: taskId!,
				pageId,
				workspaceId: useAuthStore.getState().user.workspace.id,
				body: {
					...values,
					dueDate: values.dueDate?.toISOString()
				}
			}),
		[mutateAsync, taskId, pageId]
	);

	return (
		<TaskForm
			initialValues={taskInitialValues}
			isSubmitting={isPending}
			formLoading={isLoading}
			onSubmit={handleSubmit}
			onCancel={handleClose}
			onClose={handleClose}
			open={!!taskId}
			type="edit"
			pageId={pageId}
			// extraHeader={
			// 	<Flex gap={"var(--ant-margin-xxs)"}>
			// 		<TaskChat />
			// 		{/* <TaskHistory taskId={taskId!} pageId={pageId} /> */}
			// 	</Flex>
			// }
		/>
	);
};

export default EditTaskForm;

