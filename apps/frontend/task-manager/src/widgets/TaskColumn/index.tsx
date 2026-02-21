import React, { useEffect, useRef, useState } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BoardStatus, createDraft, PreviewTaskModel, User } from "@task-manager/api";
import { registerContextMenu } from "@task-manager/context-menu";
import { App, Button, Typography } from "antd";

import { useStyles } from "./styles";
import TaskList from "./ui/TaskList";

import { ColumnTargetData, isTaskSource } from "../../shared/dnd/board";

interface TaskColumnProps {
	pageId: string;
	status: BoardStatus;

	tasks?: (PreviewTaskModel & { assignee?: User })[];
	draggable?: boolean;

	onTaskClick?: (taskId: string) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
	status,
	tasks,
	draggable,
	pageId,
	onTaskClick
}) => {
	const [isDragTarget, setIsDragTarget] = useState(false);

	const queryClient = useQueryClient();

	const message = App.useApp().message;

	const { mutateAsync, isPending } = useMutation({
		mutationFn: () =>
			createDraft({
				pathParams: {
					pageId
				},
				body: {
					boardStatusId: status.id
				}
			}),
		onSuccess: draft => {
			queryClient.invalidateQueries({ queryKey: [pageId] });
			onTaskClick?.(draft.id);
		},
		onError: error => message.error(error.message ?? "Failed to create task")
	});

	const styles = useStyles({ isDragTarget }).styles;

	const taskGroupRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!draggable) {
			return;
		}

		const element = taskGroupRef.current;

		if (!element) {
			return;
		}

		const targetData: ColumnTargetData = {
			type: "column-target",
			status: status.id
		};

		return dropTargetForElements({
			element,
			getData: () => targetData as unknown as Record<string, unknown>,
			onDrop: () => setIsDragTarget(false),
			onDragEnter: args => {
				if (!isTaskSource(args.source.data)) {
					return;
				}

				setIsDragTarget(true);
			},
			onDragLeave: () => setIsDragTarget(false)
		});
	}, [draggable, status]);

	useEffect(() => {
		const element = taskGroupRef.current;

		if (!element) {
			return;
		}

		return registerContextMenu({
			element,
			name: `Status "${status.title}"`,
			menu: [
				{
					title: "Create task",
					onClick: mutateAsync
				}
			]
		});
	}, [mutateAsync, onTaskClick, status.id, status.title]);

	return (
		<div className={styles.taskGroup} ref={taskGroupRef}>
			<div className={styles.taskGroupHeader}>
				<Typography.Title level={5} className={styles.taskGroupTitle}>
					{status.title}
				</Typography.Title>

				<Button
					loading={isPending}
					className={styles.addTaskButton}
					onClick={() => mutateAsync()}
					type="text"
					icon={<PlusOutlined />}
				/>
			</div>

			<TaskList draggable={draggable} onTaskClick={onTaskClick} tasks={tasks} />
		</div>
	);
};

export default TaskColumn;

