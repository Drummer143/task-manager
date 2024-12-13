import React, { memo, useCallback } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { theme } from "antd";
import { changeStatus } from "api";
import { useNavigate, useParams } from "react-router-dom";

import { drawTaskDragImage, taskStatusLocale } from "shared/utils";
import { useTasksStore } from "store/tasks";

import TaskItem from "../TaskItem";

interface TaskListProps {
	tasks?: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
	const boardId = useParams<{ id: string }>().id!;

	const navigate = useNavigate();

	const queryClient = useQueryClient();

	const token: ThemeConfig["token"] = theme.useToken().token;

	const { mutateAsync: changeTaskStatus } = useMutation({
		mutationFn: changeStatus,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] })
	});

	const handleOpenTask = useCallback(
		(task: Task) => navigate(`/boards/${boardId}?taskId=${task.id}`),
		[boardId, navigate]
	);

	const handleDragEnd = useCallback(
		(taskStatus: TaskStatus) => {
			const { dragging: id, dropTarget: status } = useTasksStore.getState();

			useTasksStore.setState({ dragging: undefined, dropTarget: undefined });

			if (!id || !status || taskStatus === status) {
				return;
			}

			changeTaskStatus({ id, status });
		},
		[changeTaskStatus]
	);

	const setTransferData = useCallback(
		(e: React.DragEvent<HTMLElement>, task: Task) => {
			let text = task.title;

			if (task.description) {
				text += `\n\n${task.description}`;
			}

			text += "\n\n" + taskStatusLocale[task.status];

			e.dataTransfer.setData("text/plain", text);
			e.dataTransfer.setData("text/uri-list", `${window.location.origin}/boards/${boardId}?taskId=${task.id}`);
		},
		[boardId]
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
		<div>
			{tasks?.map(task => (
				<TaskItem
					onClick={() => handleOpenTask(task)}
					key={task.id}
					task={task}
					onDragStart={handleDragStart}
				/>
			))}
		</div>
	);
};

export default memo(TaskList);