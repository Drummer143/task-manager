import React, { memo, useCallback, useEffect } from "react";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BoardStatus, changeStatus, getTaskList, Task } from "@task-manager/api";
import { App } from "antd";
import { useNavigate } from "react-router";

import { useStyles } from "./styles";

import { useAuthStore } from "../../../../../app/store/auth";
import { isTaskSource, isTaskTarget, TaskSourceData } from "../../../../../shared/dnd/board";
import TaskColumn from "../../../../../widgets/TaskColumn";

interface TaskTableProps {
	pageId: string;
	statuses: BoardStatus[];
}

const TaskTable: React.FC<TaskTableProps> = ({ pageId, statuses }) => {
	const styles = useStyles({ cols: statuses.length }).styles;

	const message = App.useApp().message;

	const navigate = useNavigate();

	const queryClient = useQueryClient();

	const { data: tasks } = useQuery({
		queryKey: [pageId, "tasks"],
		queryFn: () =>
			getTaskList({
				pageId,
				workspaceId: useAuthStore.getState().user.workspace.id,
				include: ["assignee"]
			}).then(tasks =>
				tasks.reduce(
					(acc, task) =>
						({
							...acc,
							[task.status.id]: [...(acc[task.status.id] || []), task]
						}) as Record<string, Task[]>,
					{} as Record<string, Task[]>
				)
			)
	});

	const { mutateAsync: changeTaskStatus } = useMutation({
		mutationFn: ({ taskId, statusId }: { taskId: string; statusId: string }) =>
			changeStatus({
				workspaceId: useAuthStore.getState().user.workspace.id,
				pageId,
				taskId,
				statusId
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [pageId] }),
		onError: error => message.error(error.message ?? "Failed to change task status")
	});

	const handleCreateTaskButtonClick = useCallback(
		(status: string) =>
			document.dispatchEvent(new CustomEvent("createTask", { detail: { status } })),
		[]
	);

	const handleOpenTask = useCallback(
		(task: Task) => navigate(`/pages/${pageId}?taskId=${task.id}`),
		[pageId, navigate]
	);

	useEffect(() => {
		return monitorForElements({
			canMonitor: args => isTaskSource(args.source.data),
			onDrop: args => {
				if (
					isTaskTarget(args.location.current.dropTargets[0].data) &&
					args.location.current.dropTargets[0].data.status !==
						(args.source.data as unknown as TaskSourceData).task.status.id
				) {
					changeTaskStatus({
						taskId: (args.source.data as unknown as TaskSourceData).task.id,
						statusId: args.location.current.dropTargets[0].data.status
					});
				}
			}
		});
	}, [changeTaskStatus]);

	return (
		<div className={styles.container}>
			{statuses.map(status => (
				<TaskColumn
					key={status.id}
					onTaskCreateButtonClick={handleCreateTaskButtonClick}
					onTaskClick={handleOpenTask}
					draggable={!!changeTaskStatus}
					status={status}
					tasks={tasks?.[status.id]}
				/>
			))}
		</div>
	);
};

export default memo(TaskTable);

