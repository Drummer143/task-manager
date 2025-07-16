import React, { memo } from "react";

import { Task } from "@task-manager/api";

import { useStyles } from "./styles";

import TaskItem from "../TaskItem";

interface TaskListProps {
	tasks?: Task[];
	draggable?: boolean;

	onTaskClick?: (task: Task) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, draggable, onTaskClick }) => {
	const { styles } = useStyles();

	if (!tasks?.length) {
		return null;
	}

	return (
		<div className={styles.taskList}>
			{tasks?.map(task => (
				<TaskItem draggable={draggable} onClick={onTaskClick} key={task.id} task={task} />
			))}
		</div>
	);
};

export default memo(TaskList);

