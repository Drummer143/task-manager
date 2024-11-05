import React, { memo, useEffect } from "react";

import { Spin } from "antd";

import { statusArray } from "shared/utils";
import { useWebsocketStore } from "store/websocketStore";

import { StyledFlex } from "./styles";
import TaskColumn from "./widgets/TaskColumn";

const TaskTable: React.FC = () => {
	const { send, status, tasks } = useWebsocketStore();

	useEffect(() => {
		if (status === "opened") {
			send({ type: "get-tasks" });
		}
	}, [send, status]);

	if (!tasks) {
		return <Spin />;
	}

	return (
		<StyledFlex gap="1rem">
			{statusArray.map(status => (
				<TaskColumn key={status} status={status} tasks={tasks[status]} />
			))}
		</StyledFlex>
	);
};

export default memo(TaskTable);
