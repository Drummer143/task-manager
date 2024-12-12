import React from "react";

import { useQuery } from "@tanstack/react-query";
import { getBoard } from "api";
import { useParams } from "react-router-dom";

import { withAuthPageCheck } from "shared/HOCs/withAuthPageCheck";

import { BoardContainer } from "./styles";
import BoardHeader from "./widgets/BoardHeader";
import TaskTable from "./widgets/TaskTable";

const EditTaskForm = React.lazy(() => import("./widgets/EditTaskForm"));
const NewTaskForm = React.lazy(() => import("./widgets/NewTaskForm"));

const Board: React.FC = () => {
	const boardId = useParams<{ id: string }>().id!;

	const { data } = useQuery({
		queryKey: ["board", boardId],
		queryFn: () => getBoard({ id: boardId, include: ["tasks"] })
	});

	return (
		<BoardContainer>
			<NewTaskForm />

			<EditTaskForm />

			<BoardHeader board={data} />

			<TaskTable tasks={data?.tasks} />
		</BoardContainer>
	);
};

export default withAuthPageCheck(Board);
