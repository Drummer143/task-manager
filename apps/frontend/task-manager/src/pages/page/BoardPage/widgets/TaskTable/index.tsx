import React, { memo, useCallback } from "react";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BoardStatus, changeStatus, getTaskList, Task } from "@task-manager/api";
import { App } from "antd";
import { useNavigate } from "react-router";

import { useAuthStore } from "../../../../../app/store/auth";
import TaskBoard from "../../../../../widgets/TaskBoard";

interface TaskTableProps {
	pageId: string;
	statuses: BoardStatus[];
}

const TaskTable: React.FC<TaskTableProps> = ({ pageId, statuses }) => {
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

	return (
		<TaskBoard
			statuses={statuses}
			tasks={tasks}
			onTaskCreateButtonClick={handleCreateTaskButtonClick}
			onTaskOpen={handleOpenTask}
			onTaskMove={changeTaskStatus}
		/>
	);
};

export default memo(TaskTable);

