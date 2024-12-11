import React from "react";

import { statusArray } from "shared/utils";

import { StyledFlex } from "./styles";

import TaskColumn from "../TaskStatusGroup";

interface TaskTableProps {
	tasks?: Record<TaskStatus, Task[] | undefined>;
}

const TaskTable: React.FC<TaskTableProps> = ({ tasks }) => {
	return (
		<StyledFlex gap="1rem" align="flex-start">
			{statusArray.map(status => (
				<TaskColumn key={status} status={status} tasks={tasks?.[status]} />
			))}
		</StyledFlex>
	);
};

export default TaskTable;
