import React, { memo } from "react";

import { Task } from "@task-manager/api";
import { Typography } from "antd";

import { useStyles } from "./styles";

interface TaskItemProps {
	task: Task;

	onClick?: React.MouseEventHandler<HTMLElement>;
	onDragStart: (e: React.DragEvent<HTMLElement>, task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onDragStart, onClick }) => {
	const { taskWrapper } = useStyles({ status: task.status }).styles;

	return (
		<div className={taskWrapper} onClick={onClick} draggable onDragStart={e => onDragStart(e, task)}>
			<Typography.Text>{task.title}</Typography.Text>
		</div>
	);
};

export default memo(TaskItem, (prev, next) => prev.task.id === next.task.id && prev.onDragStart === next.onDragStart);
