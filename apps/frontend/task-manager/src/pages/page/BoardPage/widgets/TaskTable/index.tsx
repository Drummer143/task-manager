import React, { memo, useCallback, useEffect, useMemo } from "react";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { useMutation, useQueryClient } from "@tanstack/react-query";
// import { DetailedPageResponseBoard, PreviewTaskModel, updateTask, User } from "@task-manager/api";
import { updateTask } from "@task-manager/api/main";
import { DetailedPageResponseBoard, TaskSummary, User } from "@task-manager/api/main/schemas";
import { App } from "antd";
import { useSearchParams } from "react-router";

import { useStyles } from "./styles";

import {
	isColumnTarget,
	isTaskSource,
	isTaskTarget,
	TaskSourceData
} from "../../../../../shared/dnd/board";
import { queryKeys } from "../../../../../shared/queryKeys";
import TaskColumn from "../../../../../widgets/TaskColumn";

interface TaskTableProps {
	page: DetailedPageResponseBoard;
}

const TaskTable: React.FC<TaskTableProps> = ({ page }) => {
	const styles = useStyles({ cols: page.statuses.length }).styles;

	const message = App.useApp().message;

	const setSearchParams = useSearchParams()[1];

	const queryClient = useQueryClient();

	const tasks = useMemo<
		Record<string, (Omit<TaskSummary, "assigneeId"> & { assignee?: User })[]>
	>(() => {
		const usersMap = new Map(page.assignees.map(user => [user.id, user]));

		return page.tasks.reduce(
			(acc, task) => {
				const taskWithAssignee = task.assigneeId
					? { ...task, assignee: usersMap.get(task.assigneeId) }
					: task;

				acc[task.statusId] = acc[task.statusId] || [];
				acc[task.statusId].push(
					taskWithAssignee as Omit<TaskSummary, "assigneeId"> & { assignee?: User }
				);

				return acc;
			},
			{} as Record<string, (Omit<TaskSummary, "assigneeId"> & { assignee?: User })[]>
		);
	}, [page.tasks, page.assignees]);

	const { mutateAsync: changeTaskStatus } = useMutation({
		mutationFn: ({
			taskId,
			statusId,
			position
		}: {
			taskId: string;
			statusId?: string;
			position?: number;
		}) =>
			updateTask(taskId, {
				statusId,
				position
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.pages.detail(page.id) }),
		onError: error => message.error(error.message ?? "Failed to change task status")
	});

	const handleOpenTask = useCallback(
		(taskId: string) => setSearchParams({ taskId }),
		[setSearchParams]
	);

	useEffect(() => {
		return monitorForElements({
			canMonitor: args => isTaskSource(args.source.data),
			onDrop: args => {
				const payload: {
					taskId: string;
					statusId?: string;
					position?: number;
				} = {
					taskId: (args.source.data as unknown as TaskSourceData).id
				};

				const target = args.location.current.dropTargets[0].data;
				const source = args.source.data as unknown as TaskSourceData;

				if (isColumnTarget(target) && target.status !== source.statusId) {
					payload.statusId = target.status;
				}

				if (isTaskTarget(target) && source.id !== target.id) {
					const edge = extractClosestEdge(target);

					if (target.position > source.position) {
						if (edge === "top") {
							payload.position = target.position - 1;
						} else {
							payload.position = target.position;
						}
					} else if (target.position < source.position) {
						if (edge === "top") {
							payload.position = target.position;
						} else {
							payload.position = target.position + 1;
						}
					}
				}

				if (
					(payload.statusId && payload.statusId !== source.statusId) ||
					(payload.position && payload.position !== source.position)
				) {
					changeTaskStatus(payload);
				}
			}
		});
	}, [changeTaskStatus]);

	return (
		<div className={styles.container}>
			{page.statuses.map(status => (
				<TaskColumn
					key={status.id}
					onTaskClick={handleOpenTask}
					draggable={!!changeTaskStatus}
					pageId={page.id}
					status={status}
					tasks={tasks?.[status.id]}
				/>
			))}
		</div>
	);
};

export default memo(TaskTable);

