import React, { memo, useCallback } from "react";

import { Task } from "@task-manager/api";
import { useNavigate, useParams } from "react-router";

import { useStyles } from "./styles";

import TaskItem from "../TaskItem";

interface TaskListProps {
	tasks?: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
	const { styles } = useStyles();

	const pageId = useParams<{ id: string }>().id!;

	const navigate = useNavigate();

	const handleOpenTask = useCallback(
		(task: Task) => navigate(`/pages/${pageId}?taskId=${task.id}`),
		[pageId, navigate]
	);

	if (!tasks?.length) {
		return null;
	}

	return (
		<div className={styles.taskList}>
			{tasks?.map(task => (
				<TaskItem
					pageId={pageId}
					onClick={() => handleOpenTask(task)}
					key={task.id}
					task={task}
				/>
			))}
		</div>
	);
};

export default memo(TaskList);

