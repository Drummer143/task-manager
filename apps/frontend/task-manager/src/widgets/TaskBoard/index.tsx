import React, { useEffect } from "react";

import { monitorForElements } from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import { BoardStatus, Task } from "@task-manager/api";

import { useStyles } from "./styles";
import TaskColumn from "./ui/TaskColumn";
import { isTaskSource, isTaskTarget, TaskSourceData } from "./utils";

interface TaskBoardProps {
	statuses: BoardStatus[];

	tasks?: Record<string, Task[]>;

	onTaskMove?: (payload: { taskId: string; statusId: string }) => void;
	onTaskOpen?: (task: Task) => void;
	onTaskCreateButtonClick?: (statusId: string) => void;
}

const TaskBoard: React.FC<TaskBoardProps> = ({
	statuses,
	tasks,
	onTaskCreateButtonClick,
	onTaskMove,
	onTaskOpen
}) => {
	const styles = useStyles({ cols: statuses.length }).styles;

	useEffect(() => {
		if (!onTaskMove) {
			return;
		}

		return monitorForElements({
			canMonitor: args => isTaskSource(args.source.data),
			onDrop: args => {
				if (
					isTaskTarget(args.location.current.dropTargets[0].data) &&
					args.location.current.dropTargets[0].data.status !==
						(args.source.data as unknown as TaskSourceData).task.status.id
				) {
					onTaskMove({
						taskId: (args.source.data as unknown as TaskSourceData).task.id,
						statusId: args.location.current.dropTargets[0].data.status
					});
				}
			}
		});
	}, [onTaskMove]);

	return (
		<div className={styles.container}>
			{statuses.map(status => (
				<TaskColumn
					key={status.id}
					onTaskCreateButtonClick={onTaskCreateButtonClick}
					onTaskClick={onTaskOpen}
					draggable={!!onTaskMove}
					status={status}
					tasks={tasks?.[status.id]}
				/>
			))}
		</div>
	);
};

export default TaskBoard;

