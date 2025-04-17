import React, { memo, useCallback } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { Task, TaskStatus } from "@task-manager/api";
import { preventDefault } from "@task-manager/utils";
import { Button, Typography } from "antd";

import { useStyles } from "./styles";

import { useTasksStore } from "../../../../../app/store/tasks";
import { taskStatusLocale } from "../../../../../shared/constants";
import TaskList from "../TaskList";

interface TaskColumnProps {
	status: TaskStatus;

	tasks?: Task[];
}

const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks }) => {
	const { dropTarget } = useTasksStore();

	const { addTaskButton, taskGroup, taskGroupHeader, taskGroupTitle } = useStyles({
		isDragTarget: dropTarget === status,
		status
	}).styles;

	const handleDragEnter: React.DragEventHandler<HTMLDivElement> = useCallback(
		() => useTasksStore.setState({ dropTarget: status }),
		[status]
	);

	const handleDragLeave: React.DragEventHandler<HTMLDivElement> = useCallback(e => {
		if (e.relatedTarget && e.currentTarget.contains(e.relatedTarget as Node)) {
			return;
		}

		useTasksStore.setState({ dropTarget: undefined });
	}, []);

	const handleCreateTaskButtonClick = useCallback(() => {
		document.dispatchEvent(new CustomEvent("createTask", { detail: { status } }));
	}, [status]);

	return (
		<div
			className={taskGroup}
			onDragOver={preventDefault}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
		>
			<div className={taskGroupHeader}>
				<Typography.Text className={taskGroupTitle}>{taskStatusLocale[status]}</Typography.Text>

				<Button
					className={addTaskButton}
					onClick={handleCreateTaskButtonClick}
					type="text"
					icon={<PlusOutlined />}
				/>
			</div>

			<TaskList tasks={tasks} />
		</div>
	);
};

export default memo(TaskColumn);
