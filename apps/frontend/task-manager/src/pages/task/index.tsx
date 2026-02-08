import React, { useState } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTask, updateTask } from "@task-manager/api";
import { App, Button, Col, Flex, Form, Row, Typography } from "antd";
import { createStyles } from "antd-style";
import dayjs from "dayjs";
import { useParams } from "react-router";

import { useAuthStore } from "../../app/store/auth";
import FullSizeLoader from "../../shared/ui/FullSizeLoader";
import TaskChat from "../../widgets/TaskChat";
import TaskForm from "../../widgets/TaskForm";
import { FormValues } from "../../widgets/TaskForm/types";
import UserCard from "../../widgets/UserCard";

const useStyles = createStyles(({ css }) => ({
	page: css`
		display: grid;
		grid-template-columns: 1fr 450px;
		gap: var(--ant-padding);
		padding: var(--ant-padding);
		align-items: start;
	`,
	bgWrapper: css`
		background-color: var(--ant-color-bg-layer-3);
		padding: var(--ant-padding-xs);
		border-radius: var(--ant-border-radius);
	`,
	saveButtonWrapper: css`
		position: sticky;
		bottom: 0;
		display: flex;
		justify-content: flex-end;
	`,
	rightColumnWrapper: css`
		position: sticky;
		top: var(--ant-padding);
		height: calc(100cqh - var(--ant-padding) * 2);
		overflow: hidden;
		display: flex;
		flex-direction: column;
		gap: var(--ant-padding);
	`,
	flexItem: css`
		flex: 1 0 50%;
	`
}));

const Task: React.FC = () => {
	const styles = useStyles().styles;

	const workspaceId = useAuthStore(state => state.user.workspace.id);

	// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
	const taskId = useParams<{ taskId: string }>().taskId!;

	const message = App.useApp().message;
	const queryClient = useQueryClient();

	const { data, isLoading: taskLoading } = useQuery({
		queryKey: [taskId],
		enabled: !!taskId,
		queryFn: async () => {
			const result = await getTask({
				pathParams: {
					taskId
				}
			});

			return {
				task: result,
				initialValues: {
					statusId: result.status.id,
					title: result.title,
					description: result.description,
					assigneeId: result.assignee?.id,
					dueDate: result.dueDate ? dayjs(result.dueDate) : undefined
				} as FormValues
			};
		}
	});

	const { mutateAsync: handleSubmit, isPending: isSubmitPending } = useMutation({
		mutationFn: (values: FormValues) =>
			updateTask({
				pathParams: { taskId },
				body: {
					...values,
					dueDate: values.dueDate?.toISOString()
				}
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: [taskId] });

			message.success("Task saved");
		},
		onError: error => message.error(error.message ?? "Failed to save task")
	});

	if (taskLoading || !data) {
		return <FullSizeLoader />;
	}

	return (
		<div className={styles.page}>
			<Form
				initialValues={data.initialValues}
				layout="vertical"
				colon={false}
				onFinish={handleSubmit}
				className={styles.bgWrapper}
			>
				<TaskForm
					taskLoading={taskLoading}
					taskId={taskId}
					pageId={data.task.pageId}
					workspaceId={workspaceId}
				/>

				<div className={styles.saveButtonWrapper}>
					<Button loading={isSubmitPending} htmlType="submit" type="primary">
						Save
					</Button>
				</div>
			</Form>

			<div className={styles.rightColumnWrapper}>
				<Flex className={styles.bgWrapper} align="center">
					<div className={styles.flexItem}>
						<Typography.Title level={5}>Reporter</Typography.Title>
					</div>

					<div className={styles.flexItem}>
						<UserCard oneLine user={data.task.reporter} hideOpenLink />
					</div>
				</Flex>

				<div className={styles.bgWrapper} style={{ flex: 1 }}>
					<TaskChat taskId={taskId} />
				</div>
			</div>
		</div>
	);
};

export default Task;

