import React, { memo, useCallback } from "react";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeStatus } from "api";
import { useNavigate, useParams } from "react-router-dom";

import { drawTaskDragImage, preventDefault, statusColors, taskStatusLocale } from "shared/utils";
import { useTasksStore } from "store/tasks";

import { StyledTaskColumn } from "./styles";

import TaskItem from "../TaskItem";

interface TaskColumnProps {
	status: TaskStatus;

	tasks?: Task[];
}

const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks }) => {
	const boardId = useParams<{ id: string }>().id!;

	const navigate = useNavigate();

	const { dropTarget } = useTasksStore();

	const queryClient = useQueryClient();

	const { mutateAsync: changeTaskStatus } = useMutation({
		mutationFn: changeStatus,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] })
	});

	const handleDragEnter: React.DragEventHandler<HTMLDivElement> = useCallback(
		() => useTasksStore.setState({ dropTarget: status }),
		[status]
	);

	const handleDragLeave: React.DragEventHandler<HTMLDivElement> = useCallback(e => {
		if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) {
			return;
		}

		useTasksStore.setState({ dropTarget: undefined });
	}, []);

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
		(e: React.DragEvent<HTMLDivElement>, task: Task) => {
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
		(e: React.DragEvent<HTMLDivElement>, task: Task) => {
			useTasksStore.setState({ dragging: task.id });

			const canvas = drawTaskDragImage(task);

			if (canvas) {
				e.dataTransfer.setDragImage(canvas, canvas.width / 2, canvas.height / 2);
			}

			setTransferData(e, task);

			document.addEventListener("dragend", () => handleDragEnd(task.status), { once: true });
		},
		[handleDragEnd, setTransferData]
	);

	const handleOpenTask = useCallback(
		(task: Task) => navigate(`/boards/${boardId}?taskId=${task.id}`),
		[boardId, navigate]
	);

	return (
		<StyledTaskColumn
			status={status}
			outlineColor={dropTarget === status ? statusColors[status] : undefined}
			onDragOver={preventDefault}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
		>
			<p>{taskStatusLocale[status]}</p>

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
		</StyledTaskColumn>
	);
};

export default memo(TaskColumn);
