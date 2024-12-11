import React from "react";

import { useQuery } from "@tanstack/react-query";
import { getTaskList } from "api";
import { useParams } from "react-router-dom";

import { withAuthPageCheck } from "shared/HOCs/withAuthPageCheck";

import { BoardContainer } from "./styles";
import TaskTable from "./widgets/TaskTable";

const EditTaskForm = React.lazy(() => import("./widgets/EditTaskForm"));
const NewTaskForm = React.lazy(() => import("./widgets/NewTaskForm"));

const Tasks: React.FC = () => {
	const boardId = useParams<{ id: string }>().id!;

	const { data } = useQuery({
		queryKey: ["tasks"],
		queryFn: () => getTaskList(boardId)
	});

	return (
		<BoardContainer>
			<NewTaskForm />
			<EditTaskForm />

			<TaskTable tasks={data} />
		</BoardContainer>
	);
};

export default withAuthPageCheck(Tasks);
