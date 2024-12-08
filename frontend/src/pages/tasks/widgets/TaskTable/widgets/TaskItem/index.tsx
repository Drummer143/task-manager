import React, { memo } from "react";

import { statusColors, updateOpacity } from "shared/utils";

interface TaskItemProps {
	task: Task;

	onDragStart: (e: React.DragEvent<HTMLDivElement>, task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onDragStart }) => {
	return (
		<div
			draggable
			onDragStart={e => onDragStart(e, task)}
			style={{ backgroundColor: updateOpacity(statusColors[task.status], 0.3) }}
		>
			<p>{task.title}</p>
		</div>
	);
};

export default memo(TaskItem, (prev, next) => prev.task.id === next.task.id && prev.onDragStart === next.onDragStart);
