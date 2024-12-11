import React, { memo } from "react";

import { statusColors } from "shared/utils";

interface TaskItemProps {
	task: Task;

	onClick?: React.MouseEventHandler<HTMLDivElement>;
	onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onDragStart, onClick }) => {
	return (
		<div
			onClick={onClick}
			draggable
			onDragStart={e => onDragStart(e, task)}
			style={{ backgroundColor: statusColors[task.status] }}
		>
			<p>{task.title}</p>
		</div>
	);
};

export default memo(TaskItem, (prev, next) => prev.task.id === next.task.id && prev.onDragStart === next.onDragStart);