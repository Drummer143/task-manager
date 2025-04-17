import React, { memo, useMemo } from "react";

import { Task, TaskStatus } from "@task-manager/api";
import { Flex } from "antd";

import { useStyles } from "./styles";

import { statusArray } from "../../../../../shared/constants";
import TaskColumn from "../TaskStatusGroup";

interface TaskTableProps {
	tasks?: Task[];
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks }) => {
	const { container } = useStyles().styles;

	const tasksByStatus = useMemo(
		() =>
			tasks?.reduce(
				(acc, task) => ({ ...acc, [task.status]: [...(acc[task.status] || []), task] }),
				{} as Record<TaskStatus, Task[]>
			),
		[tasks]
	);

	return (
		<Flex className={container} gap="1rem" align="flex-start">
			{statusArray.map(status => (
				<TaskColumn key={status} status={status} tasks={tasksByStatus?.[status]} />
			))}
		</Flex>
	);
};

export default memo(TaskTable);