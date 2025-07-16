import React, { memo, useEffect } from "react";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BoardStatus, changeStatus, getTaskList, Task } from "@task-manager/api";
import { App } from "antd";

import { useStyles } from "./styles";

import { useAuthStore } from "../../../../../app/store/auth";
import { isTaskSource, isTaskTarget, TaskSourceData } from "../../utils";
import TaskColumn from "../TaskStatusGroup";

interface TaskTableProps {
	pageId: string;
	statuses: BoardStatus[];
}

const TaskTable: React.FC<TaskTableProps> = ({ pageId, statuses }) => {
	const styles = useStyles().styles;

	const message = App.useApp().message;

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

	const { mutateAsync: changeTaskStatus, isPending: isTaskStatusChanging } = useMutation({
		mutationFn: changeStatus,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [pageId] }),
		onError: error => message.error(error.message ?? "Failed to change task status")
	});

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
						workspaceId: useAuthStore.getState().user.workspace.id,
						pageId,
						taskId: (args.source.data as unknown as TaskSourceData).task.id,
						statusId: args.location.current.dropTargets[0].data.status
					});
				}
			}
		});
	}, [changeTaskStatus, pageId]);

	return (
		<div className={styles.container}>
			{statuses.map(status => (
				<TaskColumn
					isMutating={isTaskStatusChanging}
					key={status.id}
					status={status}
					tasks={tasks?.[status.id]}
				/>
			))}
		</div>
	);
};

export default memo(TaskTable);

