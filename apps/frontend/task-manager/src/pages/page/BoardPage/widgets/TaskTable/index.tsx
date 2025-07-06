import React, { memo, useEffect, useMemo } from "react";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { changeStatus, getTaskList, Task, TaskStatus } from "@task-manager/api";
import { App, Flex } from "antd";

import { useStyles } from "./styles";

import { useAuthStore } from "../../../../../app/store/auth";
import { statusArray } from "../../../../../shared/constants";
import { isTaskSource, isTaskTarget, TaskSourceData } from "../../utils";
import TaskColumn from "../TaskStatusGroup";

interface TaskTableProps {
	pageId: string;
}

const TaskTable: React.FC<TaskTableProps> = ({ pageId }) => {
	const { container } = useStyles().styles;

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
					(acc, task) => ({ ...acc, [task.status]: [...(acc[task.status] || []), task] }),
					{} as Record<TaskStatus, Task[]>
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
						(args.source.data as unknown as TaskSourceData).task.status
				) {
					changeTaskStatus({
						workspaceId: useAuthStore.getState().user.workspace.id,
						pageId,
						taskId: (args.source.data as unknown as TaskSourceData).task.id,
						status: args.location.current.dropTargets[0].data.status
					});
				}
			}
		});
	}, [changeTaskStatus, pageId]);

	return (
		<Flex className={container} gap="1rem" align="flex-start">
			{statusArray.map(status => (
				<TaskColumn
					isMutating={isTaskStatusChanging}
					key={status}
					status={status}
					tasks={tasks?.[status]}
				/>
			))}
		</Flex>
	);
};

export default memo(TaskTable);

