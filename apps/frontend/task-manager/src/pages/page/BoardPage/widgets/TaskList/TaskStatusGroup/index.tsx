import React, { memo, useCallback } from "react";

import { PlusOutlined } from "@ant-design/icons";

import { preventDefault, taskStatusLocale } from "shared/utils";
import { useTasksStore } from "store/tasks";

import * as s from "./styles";

import TaskList from "..";

interface TaskColumnProps {
	status: TaskStatus;

	tasks?: Task[];
}

const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks }) => {
	const { dropTarget } = useTasksStore();

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
		<s.TaskGroup
			status={status}
			isDragTarget={dropTarget === status}
			onDragOver={preventDefault}
			onDragEnter={handleDragEnter}
			onDragLeave={handleDragLeave}
		>
			<s.TaskGroupHeader>
				<s.TaskGroupTitle>{taskStatusLocale[status]}</s.TaskGroupTitle>

				<s.AddTaskButton onClick={handleCreateTaskButtonClick} type="text" icon={<PlusOutlined />} />
			</s.TaskGroupHeader>

			<TaskList tasks={tasks} />
		</s.TaskGroup>
	);
};

export default memo(TaskColumn);
