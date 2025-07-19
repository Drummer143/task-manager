import React, { useEffect, useMemo, useRef, useState } from "react";

import { MenuOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";
import {
	draggable,
	dropTargetForElements
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { BoardStatus, Task } from "@task-manager/api";
import { Button, Dropdown, GetProp, MenuProps, Typography } from "antd";

import { useStyles } from "./styles";

import { ColumnSourceData, isTaskSource, TaskTargetData } from "../../utils";
import TaskList from "../TaskList";

interface TaskColumnProps {
	status: BoardStatus;

	tasks?: Task[];
	taskDraggable?: boolean;
	columnDraggable?: boolean;

	menu?: (status: BoardStatus) => GetProp<MenuProps, "items">;
	onTaskClick?: (task: Task) => void;
	onTaskCreateButtonClick?: (statusId: string) => void;
}

const TaskColumn: React.FC<TaskColumnProps> = ({
	status,
	tasks,
	onTaskCreateButtonClick,
	taskDraggable,
	columnDraggable,
	menu,
	onTaskClick
}) => {
	const [isDragTarget, setIsDragTarget] = useState(false);

	const styles = useStyles({ isDragTarget }).styles;

	const taskGroupRef = useRef<HTMLDivElement | null>(null);
	const dragHandleRef = useRef<HTMLButtonElement | null>(null);

	const menuItems = useMemo<GetProp<MenuProps, "items"> | undefined>(
		() => menu?.(status),
		[menu, status]
	);

	useEffect(() => {
		if (!taskDraggable) {
			return;
		}

		const element = taskGroupRef.current;

		if (!element) {
			return;
		}

		const targetData: TaskTargetData = {
			type: "task-target",
			status: status.id
		};

		return  dropTargetForElements({
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
	}, [status, taskDraggable]);

	useEffect(() => {
		if (!columnDraggable) {
			return;
		}

		const element = taskGroupRef.current;
		const dragHandle = dragHandleRef.current;

		if (!element || !dragHandle) {
			return;
		}

		const sourceData: ColumnSourceData = {
			type: "column-source",
			statusId: status.id,
			position: status.position
		};

		return draggable({
			element,
			dragHandle,
			getInitialData: () => sourceData as unknown as Record<string, unknown>
		});
	}, [status, columnDraggable]);

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

				{!!menuItems?.length && (
					<Dropdown menu={{ items: menuItems }} trigger={["click"]}>
						<Button type="text" icon={<MenuOutlined />} />
					</Dropdown>
				)}

				{columnDraggable && (
					<Button type="text" ref={dragHandleRef} icon={<MoreOutlined />} />
				)}
			</div>

			<TaskList draggable={taskDraggable} onTaskClick={onTaskClick} tasks={tasks} />
		</div>
	);
};

export default TaskColumn;

