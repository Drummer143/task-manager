import React, { memo, useEffect, useRef, useState } from "react";

import { combine } from "@atlaskit/pragmatic-drag-and-drop/combine";
import {
	draggable,
	dropTargetForElements
} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {
	attachClosestEdge,
	type Edge,
	extractClosestEdge
} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Task } from "@task-manager/api";
import { registerContextMenu } from "@task-manager/context-menu";
import { Avatar, Flex, Typography } from "antd";

import { useStyles } from "./styles";

import { isTaskSource, TaskSourceData, TaskTargetData } from "../../../../shared/dnd/board";
import DropLine from "../../../../shared/ui/DropLine";

type TaskState =
	| {
			type: "idle";
	  }
	| {
			type: "preview";
			container: HTMLElement;
	  }
	| {
			type: "is-dragging";
	  }
	| {
			type: "is-dragging-over";
			closestEdge: Edge | null;
	  };

interface TaskItemProps {
	task: Task;

	draggable?: boolean;

	onClick?: (task: Task) => void;
}

const idle: TaskState = { type: "idle" };

const TaskItem: React.FC<TaskItemProps> = ({ task, draggable: taskDraggable, onClick }) => {
	const [isDragging, setIsDragging] = useState(false);
	const [state, setState] = useState<TaskState>(idle);

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

		const initialSourceData: TaskSourceData = {
			type: "task-source",
			task
		};

		const initialTargetData: TaskTargetData = {
			type: "task-target",
			task
		};

		return combine(
			draggable({
				element,
				getInitialData: () => initialSourceData as unknown as Record<string, unknown>,
				onDragStart: () => setIsDragging(true),
				onDrop: () => setIsDragging(false)
			}),
			dropTargetForElements({
				element,
				canDrop: ({ source }) => {
					if (source.element === element) {
						return false;
					}

					return isTaskSource(source.data);
				},
				getData: ({ input }) =>
					attachClosestEdge(initialTargetData as unknown as Record<string, unknown>, {
						element,
						input,
						allowedEdges: ["top", "bottom"]
					}),
				getIsSticky() {
					return true;
				},
				onDragEnter({ self }) {
					const closestEdge = extractClosestEdge(self.data);

					setState({ type: "is-dragging-over", closestEdge });
				},
				onDrag({ self }) {
					const closestEdge = extractClosestEdge(self.data);

					setState(current => {
						if (
							current.type === "is-dragging-over" &&
							current.closestEdge === closestEdge
						) {
							return current;
						}
						return { type: "is-dragging-over", closestEdge };
					});
				},
				onDragLeave: () => setState(idle),
				onDrop: () => setState(idle)
			})
		);
	}, [task, taskDraggable]);

	useEffect(() => {
		const element = taskRef.current;

		if (!element) {
			return;
		}

		return registerContextMenu({
			element,
			name: `Task "${task.title}"`,
			menu: [
				{
					onClick: () => onClick?.(task),
					title: "Open"
				}
			]
		});
	}, [onClick, task]);

	return (
		<div style={{ position: "relative" }}>
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

			{state.type === "is-dragging-over" && state.closestEdge && (
				<DropLine id={task.id} edge={state.closestEdge} />
			)}
		</div>
	);
};

export default memo(TaskItem);

