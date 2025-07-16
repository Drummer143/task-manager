import React, { memo, useCallback, useEffect, useRef, useState } from "react";

import { PlusOutlined } from "@ant-design/icons";
import { dropTargetForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { BoardStatus, Task } from "@task-manager/api";
import { Button, Spin, Typography } from "antd";

import { useStyles } from "./styles";

import { isTaskSource, TaskTargetData } from "../../utils";
import TaskList from "../TaskList";

interface TaskColumnProps {
	status: BoardStatus;

	tasks?: Task[];
	isMutating?: boolean;
}

const TaskColumn: React.FC<TaskColumnProps> = ({ status, tasks, isMutating }) => {
	const [isDragTarget, setIsDragTarget] = useState(false);

	const taskGroupRef = useRef<HTMLDivElement | null>(null);

	const styles = useStyles({
		isDragTarget
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
			status: status.id
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
		<div className={styles.taskGroup} ref={taskGroupRef}>
			<div className={styles.taskGroupHeader}>
				<Typography.Text className={styles.taskGroupTitle}>{status.title}</Typography.Text>

				<Button
					className={styles.addTaskButton}
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

