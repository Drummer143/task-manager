import React, { memo, useEffect, useMemo } from "react";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { changeStatus, Task, TaskStatus } from "@task-manager/api";
import { App, Flex } from "antd";
import { useParams } from "react-router";

import { useStyles } from "./styles";

import { useAuthStore } from "../../../../../app/store/auth";
import { statusArray } from "../../../../../shared/constants";
import { isTaskSource, isTaskTarget, TaskSourceData } from "../../utils";
import TaskColumn from "../TaskStatusGroup";

interface TaskTableProps {
	tasks?: Task[];
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks }) => {
	const { container } = useStyles().styles;

	const pageId = useParams<{ id: string }>().id!;

	const message = App.useApp().message;

	const queryClient = useQueryClient();

	const { mutateAsync: changeTaskStatus, isPending: isTaskStatusChanging } = useMutation({
		mutationFn: changeStatus,
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [pageId] }),
		onError: error => message.error(error.message ?? "Failed to change task status")
	});

	const tasksByStatus = useMemo(
		() =>
			tasks?.reduce(
				(acc, task) => ({ ...acc, [task.status]: [...(acc[task.status] || []), task] }),
				{} as Record<TaskStatus, Task[]>
			),
		[tasks]
	);

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
					tasks={tasksByStatus?.[status]}
				/>
			))}
		</Flex>
	);
};

export default memo(TaskTable);

