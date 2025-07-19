import React, { useEffect, useState } from "react";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { BoardStatus, Task } from "@task-manager/api";
import { GetProp, MenuProps } from "antd";

import { useStyles } from "./styles";
import ColumnDropTarget from "./ui/ColumnDropTarget";
import TaskColumn from "./ui/TaskColumn";
import {
	isColumnSource,
	isColumnTarget,
	isTaskSource,
	isTaskTarget,
	TaskSourceData
} from "./utils";

interface TaskBoardProps {
	statuses: BoardStatus[];

	tasks?: Record<string, Task[]>;
	height?: React.CSSProperties["height"];

	columnMenu?: (status: BoardStatus) => GetProp<MenuProps, "items">;
	onTaskMove?: (payload: { taskId: string; statusId: string }) => void;
	onTaskOpen?: (task: Task) => void;
	onColumnMove?: (payload: { statusId: string; newPosition: number }) => void;
	renderDivider?: (index: number) => React.ReactNode;
	onTaskCreateButtonClick?: (statusId: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
	statuses,
	tasks,
	height,
	columnMenu,
	onColumnMove,
	onTaskCreateButtonClick,
	onTaskMove,
	onTaskOpen,
	renderDivider
}) => {
	const [isDraggingColumn, setIsDraggingColumn] = useState(false);

	const styles = useStyles({
		cols: statuses.length,
		withDivider: !!renderDivider,
		height
	}).styles;

	useEffect(() => {
		if (!onTaskMove && !onColumnMove) {
			return;
		}

		return monitorForElements({
			canMonitor: args => isTaskSource(args.source.data) || isColumnSource(args.source.data),
			onDragStart: args => {
				if (isColumnSource(args.source.data)) {
					setIsDraggingColumn(true);
				}
			},
			onDrop: args => {
				setIsDraggingColumn(false);

				if (
					isTaskTarget(args.location.current.dropTargets[0].data) &&
					args.location.current.dropTargets[0].data.status !==
						(args.source.data as unknown as TaskSourceData).task.status.id
				) {
					onTaskMove?.({
						taskId: (args.source.data as unknown as TaskSourceData).task.id,
						statusId: args.location.current.dropTargets[0].data.status
					});
				} else if (
					isColumnTarget(args.location.current.dropTargets[0].data) &&
					isColumnSource(args.source.data) &&
					args.location.current.dropTargets[0].data.position !== args.source.data.position
				) {
					onColumnMove?.({
						statusId: args.source.data.statusId,
						newPosition: args.location.current.dropTargets[0].data.position
					});
				}
			}
		});
	}, [onTaskMove, onColumnMove]);

	return (
		<div className={styles.container}>
			{statuses.map((status, index) => (
				<React.Fragment key={status.id}>
					{isDraggingColumn ? (
						<ColumnDropTarget position={index} />
					) : (
						renderDivider?.(index)
					)}

					<TaskColumn
						key={status.id}
						onTaskCreateButtonClick={onTaskCreateButtonClick}
						onTaskClick={onTaskOpen}
						taskDraggable={!!onTaskMove}
						columnDraggable={!!onColumnMove}
						status={status}
						menu={columnMenu}
						tasks={tasks?.[status.id]}
					/>
				</React.Fragment>
			))}

			{isDraggingColumn ? (
				<ColumnDropTarget position={statuses.length} />
			) : (
				renderDivider?.(statuses.length)
			)}
		</div>
	);
};

export default TaskBoard;

