import React, { memo, useEffect, useRef, useState } from "react";

import { draggable } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { Task } from "@task-manager/api";
import { Avatar, Flex, Typography } from "antd";

import { useStyles } from "./styles";

import { TaskSourceData } from "../../utils";

interface TaskItemProps {
	task: Task;

	draggable?: boolean;

	onClick?: (task: Task) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, draggable: taskDraggable, onClick }) => {
	const [isDragging, setIsDragging] = useState(false);

	const styles = useStyles({ isDragging }).styles;

	const taskRef = useRef<HTMLDivElement | null>(null);

	useEffect(() => {
		if (!taskDraggable) {
			return;
		}

		const element = taskRef.current;

		if (!element) {
			return;
		}

		const initialData: TaskSourceData = {
			type: "task",
			task
		};

		return draggable({
			element,
			getInitialData: () => initialData as unknown as Record<string, unknown>,
			onDragStart: () => setIsDragging(true),
			onDrop: () => setIsDragging(false)
		});
	}, [task, taskDraggable]);

	return (
		<div className={styles.taskWrapper} onClick={() => onClick?.(task)} ref={taskRef}>
			<Typography.Text ellipsis className={styles.taskTitle}>
				{task.title}
			</Typography.Text>

			{task.assignee && (
				<Flex align="center" gap="var(--ant-padding-xs)">
					<Avatar
						className={styles.userAvatar}
						src={task.assignee.picture || "/avatar-placeholder-32.jpg"}
						alt={task.assignee.username}
						size={24}
					/>

					<Typography.Text ellipsis>{task.assignee.username}</Typography.Text>
				</Flex>
			)}
		</div>
	);
};

export default memo(TaskItem);

