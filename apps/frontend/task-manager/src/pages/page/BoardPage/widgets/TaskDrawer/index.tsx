import React, { useCallback, useMemo } from "react";

import { ExportOutlined } from "@ant-design/icons";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTask, updateTask } from "@task-manager/api/main";
import { TipTapContent } from "@task-manager/api/main/schemas";
import { JSONContent } from "@tiptap/core";
import { App, Button, Flex, FormProps, Space } from "antd";
import dayjs from "dayjs";
import { useNavigate, useParams, useSearchParams } from "react-router";

import { useAuthStore } from "../../../../../app/store/auth";
import Drawer from "../../../../../widgets/Drawer";
import TaskForm from "../../../../../widgets/TaskForm";
import { FormValues } from "../../../../../widgets/TaskForm/types";
import TaskChatDrawer from "../TaskChatDrawer";

const TaskDrawer: React.FC = () => {
	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const pageId = useParams<{ id: string }>().id!;

	const workspaceId = useAuthStore(state => state.user.workspace.id);

	const taskId = useSearchParams()[0].get("taskId");

	const message = App.useApp().message;

	const queryClient = useQueryClient();

	const navigate = useNavigate();

	const { data: taskInitialValues, isLoading: taskLoading } = useQuery({
		queryKey: [taskId],
		enabled: !!taskId,
		queryFn: async (): Promise<FormValues> => {
			const result = await getTask(taskId!);

			return {
				// TODO: fix
				statusId: result.status!.id,
				title: result.title,
				// TODO: fix
				description: result.description as JSONContent,
				assigneeId: result.assignee?.id,
				dueDate: result.dueDate ? dayjs(result.dueDate) : undefined
			};
		}
	});

	const { mutateAsync: handleSubmit, isPending: isSubmitPending } = useMutation({
		mutationFn: (values: FormValues) =>
			updateTask(taskId!, {
				...values,
				// TODO: fix
				description: values.description as TipTapContent,
				dueDate: values.dueDate?.toISOString()
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [pageId] });
			navigate(`/pages/${pageId}`);
		},
		onError: error => message.error(error.message ?? "Failed to update task")
	});

	const handleClose = useCallback(() => navigate(`/pages/${pageId}`), [pageId, navigate]);

	const formProps = useMemo<FormProps<FormValues>>(
		() => ({
			className: "h-full",
			initialValues: taskInitialValues,
			onFinish: handleSubmit,
			layout: "horizontal",
			colon: false
		}),
		[taskInitialValues, handleSubmit]
	);

	return (
		<Drawer
			width="40%"
			open={!!taskId}
			loading={taskLoading}
			onClose={handleClose}
			keyboard
			onOk={handleSubmit}
			okLoading={isSubmitPending}
			form={taskLoading ? undefined : formProps}
			okText="Save"
			extra={
				<Space>
					<Flex gap="var(--ant-margin-xxs)">
						<TaskChatDrawer />

						{taskId && (
							<Button
								type="text"
								href={`/tasks/${taskId}`}
								target="_blank"
								icon={<ExportOutlined />}
							/>
						)}

						{/* <TaskHistory taskId={taskId!} pageId={pageId} /> */}
					</Flex>

					<Button disabled={isSubmitPending} htmlType="reset" onClick={handleClose}>
						Cancel
					</Button>

					<Button loading={isSubmitPending} htmlType="submit" type="primary">
						Save
					</Button>
				</Space>
			}
		>
			{taskId && (
				<TaskForm
					taskLoading={taskLoading}
					pageId={pageId}
					taskId={taskId}
					workspaceId={workspaceId}
				/>
			)}
		</Drawer>
	);
};

export default TaskDrawer;

