import React, { useEffect, useRef, useState } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { BoardStatus, Task } from "@task-manager/api";
import { registerContextMenu } from "@task-manager/context-menu";
import { Button, Typography } from "antd";

import { useStyles } from "./styles";
import TaskList from "./ui/TaskList";

import { ColumnTargetData, isTaskSource } from "../../shared/dnd/board";

interface TaskColumnProps {
	status: BoardStatus;

	tasks?: Task[];
	draggable?: boolean;

	onTaskClick?: (task: Task) => void;
	onTaskCreateButtonClick?: (statusId: string) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
	status,
	tasks,
	onTaskCreateButtonClick,
	draggable,
	onTaskClick
}) => {
	const [isDragTarget, setIsDragTarget] = useState(false);

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
					onClick: () => onTaskCreateButtonClick?.(status.id)
				}
			]
		});
	}, [onTaskCreateButtonClick, status.id, status.title]);

	return (
		<div className={styles.taskGroup} ref={taskGroupRef}>
			<div className={styles.taskGroupHeader}>
				<Typography.Text className={styles.taskGroupTitle}>{status.title}</Typography.Text>

				{onTaskCreateButtonClick && (
					<Button
						className={styles.addTaskButton}
						onClick={() => onTaskCreateButtonClick(status.id)}
						type="text"
						icon={<PlusOutlined />}
					/>
				)}
			</div>

			<TaskList draggable={draggable} onTaskClick={onTaskClick} tasks={tasks} />
		</div>
	);
};

export default TaskColumn;

