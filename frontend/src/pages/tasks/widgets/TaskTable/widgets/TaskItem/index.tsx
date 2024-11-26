import React, { memo } from "react";

import { statusColors, updateOpacity } from "shared/utils";

interface TaskItemProps {
	task: Task;

	onClick: (task: Task, e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
	onDragStart: (task: Task, e: React.DragEvent<HTMLDivElement>) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onDragStart, onClick }) => {
	return (
		<div
			draggable
			onClick={e => onClick(task, e)}
			onDragStart={e => onDragStart(task, e)}
			style={{ backgroundColor: updateOpacity(statusColors[task.status], 0.3) }}
		>
			<p>{task.title}</p>
		</div>
	);
};

export default memo(TaskItem);
