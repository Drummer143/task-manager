import React, { memo, useCallback, useEffect } from "react";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { extractClosestEdge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { BoardStatus, getTaskList, Task, updateTask } from "@task-manager/api";
import { App } from "antd";
import { useNavigate, useSearchParams } from "react-router";

import { useStyles } from "./styles";

import {
	isColumnTarget,
	isTaskSource,
	isTaskTarget,
	TaskSourceData
} from "../../../../../shared/dnd/board";
import TaskColumn from "../../../../../widgets/TaskColumn";

interface TaskTableProps {
	pageId: string;
	statuses: BoardStatus[];
}

const TaskTable: React.FC<TaskTableProps> = ({ pageId, statuses }) => {
	const styles = useStyles({ cols: statuses.length }).styles;

	const message = App.useApp().message;

	const setSearchParams = useSearchParams()[1];

	const queryClient = useQueryClient();

	const { data: tasks } = useQuery({
		queryKey: [pageId, "tasks"],
		queryFn: () =>
			getTaskList({
				pathParams: {
					pageId
				}
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
		mutationFn: ({
			taskId,
			statusId,
			position
		}: {
			taskId: string;
			statusId?: string;
			position?: number;
		}) =>
			updateTask({
				pathParams: {
					taskId
				},
				body: {
					statusId,
					position
				}
			}),
		onSuccess: () => queryClient.invalidateQueries({ queryKey: [pageId] }),
		onError: error => message.error(error.message ?? "Failed to change task status")
	});

	const handleOpenTask = useCallback(
		(task: Task) => {
			console.log(task);
			setSearchParams({ taskId: task.id });
		},
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
					taskId: (args.source.data as unknown as TaskSourceData).task.id
				};

				const target = args.location.current.dropTargets[0].data;
				const source = args.source.data as unknown as TaskSourceData;

				if (isColumnTarget(target) && target.status !== source.task.status.id) {
					payload.statusId = target.status;
				}

				if (isTaskTarget(target) && source.task.id !== target.task.id) {
					const edge = extractClosestEdge(target);

					if (target.task.position > source.task.position) {
						if (edge === "top") {
							payload.position = target.task.position - 1;
						} else {
							payload.position = target.task.position;
						}
					} else if (target.task.position < source.task.position) {
						if (edge === "top") {
							payload.position = target.task.position;
						} else {
							payload.position = target.task.position + 1;
						}
					}
				}

				if (
					(payload.statusId && payload.statusId !== source.task.status.id) ||
					(payload.position && payload.position !== source.task.position)
				) {
					changeTaskStatus(payload);
				}
			}
		});
	}, [changeTaskStatus]);

	return (
		<div className={styles.container}>
			{statuses.map(status => (
				<TaskColumn
					key={status.id}
					onTaskClick={handleOpenTask}
					draggable={!!changeTaskStatus}
					pageId={pageId}
					status={status}
					tasks={tasks?.[status.id]}
				/>
			))}
		</div>
	);
};

export default memo(TaskTable);

