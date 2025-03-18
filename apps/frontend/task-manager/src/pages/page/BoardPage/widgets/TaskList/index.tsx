import React, { memo, useCallback } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeStatus } from "@task-manager/api";
import { App, theme } from "antd";
import { useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";

import { drawTaskDragImage } from "./utils";

import { useAppStore } from "../../../../../app/store/app";
import { useTasksStore } from "../../../../../app/store/tasks";
import { taskStatusLocale } from "../../../../../shared/constants";
import TaskItem from "../TaskItem";

interface TaskListProps {
	tasks?: Task[];
}

const TaskListWrapper = styled.div`
	padding: 0 var(--ant-padding-xxs);

	& > *:not(:last-child) {
		margin-bottom: var(--ant-margin-xs);
	}
`;

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
	const pageId = useParams<{ id: string }>().id!;

	const message = App.useApp().message;

	const navigate = useNavigate();

	const queryClient = useQueryClient();

	const token: ThemeConfig["token"] = theme.useToken().token;

	const { mutateAsync: changeTaskStatus } = useMutation({
		mutationFn: changeStatus,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [pageId] }),
		onError: error => message.error(error.message ?? "Failed to change task status")
	});

	const handleOpenTask = useCallback(
		(task: Task) => navigate(`/pages/${pageId}?taskId=${task.id}`),
		[pageId, navigate]
	);

	const handleDragEnd = useCallback(
		(taskStatus: TaskStatus) => {
			const { dragging: taskId, dropTarget: status } = useTasksStore.getState();

			useTasksStore.setState({ dragging: undefined, dropTarget: undefined });

			if (!taskId || !status || taskStatus === status) {
				return;
			}

			changeTaskStatus({ taskId, pageId, workspaceId: useAppStore.getState().workspaceId!, status });
		},
		[changeTaskStatus, pageId]
	);

	const setTransferData = useCallback(
		(e: React.DragEvent<HTMLElement>, task: Task) => {
			let text = task.title;

			if (task.description) {
				text += `\n\n${task.description}`;
			}

			text += "\n\n" + taskStatusLocale[task.status];

			e.dataTransfer.setData("text/plain", text);
			e.dataTransfer.setData("text/uri-list", `${window.location.origin}/pages/${pageId}?taskId=${task.id}`);
		},
		[pageId]
	);

	const handleDragStart = useCallback(
		(e: React.DragEvent<HTMLElement>, task: Task) => {
			useTasksStore.setState({ dragging: task.id });

			const colors: Record<TaskStatus, string> = {
				done: token.colorDone!,
				in_progress: token.colorInProgress!,
				not_done: token.colorNotDone!
			};

			const canvas = drawTaskDragImage(task, colors[task.status]);

			if (canvas) {
				e.dataTransfer.setDragImage(canvas, canvas.width / 2, canvas.height / 2);
			}

			setTransferData(e, task);

			document.addEventListener("dragend", () => handleDragEnd(task.status), { once: true });
		},
		[handleDragEnd, setTransferData, token.colorDone, token.colorInProgress, token.colorNotDone]
	);

	if (!tasks?.length) {
		return null;
	}

	return (
		<TaskListWrapper>
			{tasks?.map(task => (
				<TaskItem
					onClick={() => handleOpenTask(task)}
					key={task.id}
					task={task}
					onDragStart={handleDragStart}
				/>
			))}
		</TaskListWrapper>
	);
};

export default memo(TaskList);
