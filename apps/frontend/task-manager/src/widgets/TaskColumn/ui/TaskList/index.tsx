import React, { memo } from "react";

import { TaskSummary, User } from "@task-manager/api/main/schemas";

import { useStyles } from "./styles";

import TaskItem from "../TaskItem";

interface TaskListProps {
	tasks?: (TaskSummary & { assignee?: User })[];
	draggable?: boolean;

	onTaskClick?: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, draggable, onTaskClick }) => {
	const { styles } = useStyles();

	if (!tasks?.length) {
		return null;
	}

	return (
		<div className={styles.taskList}>
			{tasks?.map((task, index) => (
				<TaskItem draggable={draggable} onClick={onTaskClick} task={task} key={task.id} />
			))}
		</div>
	);
};

export default memo(TaskList);

