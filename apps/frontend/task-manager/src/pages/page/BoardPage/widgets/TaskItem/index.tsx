import React, { memo } from "react";

import { Typography } from "antd";
import styled from "styled-components";

import { statusColors } from "../../../../../shared/constants";

interface TaskItemProps {
	task: Task;

	onClick?: React.MouseEventHandler<HTMLElement>;
	onDragStart: (e: React.DragEvent<HTMLElement>, task: Task) => void;
}

const TaskWrapper = styled.div<{ status: TaskStatus }>`
	padding: var(--ant-padding-xxs) var(--ant-padding-xs);

	cursor: pointer;
	border-radius: var(--inner-border-radius);
	background-color: ${({ status }) => `var(${statusColors[status]})`};
`;

const TaskItem: React.FC<TaskItemProps> = ({ task, onDragStart, onClick }) => {
	return (
		<TaskWrapper status={task.status} onClick={onClick} draggable onDragStart={e => onDragStart(e, task)}>
			<Typography.Text>{task.title}</Typography.Text>
		</TaskWrapper>
	);
};

export default memo(TaskItem, (prev, next) => prev.task.id === next.task.id && prev.onDragStart === next.onDragStart);
