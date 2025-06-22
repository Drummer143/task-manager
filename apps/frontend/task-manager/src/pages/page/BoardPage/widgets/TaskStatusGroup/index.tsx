import React, { memo, useCallback, useEffect, useRef, useState } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Task, TaskStatus } from "@task-manager/api";
import { Button, Spin, Typography } from "antd";

import { useStyles } from "./styles";

import { taskStatusLocale } from "../../../../../shared/constants";
import { isTaskSource, TaskTargetData } from "../../utils";
import TaskList from "../TaskList";

interface TaskColumnProps {
	status: TaskStatus;

	tasks?: Task[];
	isMutating?: boolean;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks, isMutating }) => {
	const [isDragTarget, setIsDragTarget] = useState(false);

	const taskGroupRef = useRef<HTMLDivElement | null>(null);

	const { addTaskButton, taskGroup, taskGroupHeader, taskGroupTitle } = useStyles({
		isDragTarget,
		status
	}).styles;

	const handleCreateTaskButtonClick = useCallback(
		() => document.dispatchEvent(new CustomEvent("createTask", { detail: { status } })),
		[status]
	);

	useEffect(() => {
		const element = taskGroupRef.current;

		if (!element) {
			return;
		}

		const targetData: TaskTargetData = {
			type: "task",
			status
		};

		return dropTargetForElements({
			element,
			getData: () => targetData as unknown as Record<string, unknown>,
			onDrop: () => setIsDragTarget(false),
			onDragEnter: args => {
				if (!isTaskSource(args.source.data)) {
					return;
				}

				setIsDragTarget(true);
			},
			onDragLeave: () => setIsDragTarget(false)
		});
	}, [status]);

	return (
		<div className={taskGroup} ref={taskGroupRef}>
			<div className={taskGroupHeader}>
				<Typography.Text className={taskGroupTitle}>
					{taskStatusLocale[status]}
				</Typography.Text>

				<Button
					className={addTaskButton}
					onClick={handleCreateTaskButtonClick}
					type="text"
					icon={isMutating ? <Spin /> : <PlusOutlined />}
				/>
			</div>

			<TaskList tasks={tasks} />
		</div>
	);
};

export default memo(TaskColumn);

