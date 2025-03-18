import React, { memo, useMemo } from "react";

import { StyledFlex } from "./styles";

import { statusArray } from "../../../../../shared/constants";
import TaskColumn from "../TaskStatusGroup";

interface TaskTableProps {
	tasks?: Task[];
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks }) => {
	const tasksByStatus = useMemo(
		() =>
			tasks?.reduce(
				(acc, task) => ({ ...acc, [task.status]: [...(acc[task.status] || []), task] }),
				{} as Record<TaskStatus, Task[]>
			),
		[tasks]
	);

	return (
		<StyledFlex gap="1rem" align="flex-start">
			{statusArray.map(status => (
				<TaskColumn key={status} status={status} tasks={tasksByStatus?.[status]} />
			))}
		</StyledFlex>
	);
};

export default memo(TaskTable);
