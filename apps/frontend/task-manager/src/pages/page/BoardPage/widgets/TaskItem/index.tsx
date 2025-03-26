import React, { memo } from "react";

import { Task, TaskStatus } from "@task-manager/api";
import { Typography } from "antd";
import { createStyles } from "antd-style";

import { statusColors } from "../../../../../shared/constants";

interface TaskItemProps {
	task: Task;

	onClick?: React.MouseEventHandler<HTMLElement>;
	onDragStart: (e: React.DragEvent<HTMLElement>, task: Task) => void;
}

const useStyles = createStyles(({ css }, { status }: { status: TaskStatus }) => ({
	taskWrapper: css`
		padding: var(--ant-padding-xxs) var(--ant-padding-xs);

		cursor: pointer;
		border-radius: var(--inner-border-radius);
		background-color: var(${statusColors[status]});
	`
}));

const TaskItem: React.FC<TaskItemProps> = ({ task, onDragStart, onClick }) => {
	const { taskWrapper } = useStyles({ status: task.status }).styles;

	return (
		<div className={taskWrapper} onClick={onClick} draggable onDragStart={e => onDragStart(e, task)}>
			<Typography.Text>{task.title}</Typography.Text>
		</div>
	);
};

export default memo(TaskItem, (prev, next) => prev.task.id === next.task.id && prev.onDragStart === next.onDragStart);
