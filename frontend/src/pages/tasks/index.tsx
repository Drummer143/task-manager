import React, { useEffect } from "react";

import { withAuthPageCheck } from "shared/HOCs/withAuthPageCheck";
import { useWebsocketStore } from "store/websocketStore";

import EditTaskForm from "./widgets/EditTaskForm";
import NewTaskForm from "./widgets/NewTaskForm";
import TaskTable from "./widgets/TaskTable";

const Tasks: React.FC = () => {
	const { connect } = useWebsocketStore();

	useEffect(() => {
		connect();
	}, [connect]);

	return (
		<>
			<NewTaskForm />

			<EditTaskForm />

			<TaskTable />
		</>
	);
};

export default withAuthPageCheck(Tasks);