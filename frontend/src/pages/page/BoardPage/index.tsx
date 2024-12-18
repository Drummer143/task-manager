import React from "react";

import TaskTable from "./widgets/TaskTable";

const EditTaskForm = React.lazy(() => import("./widgets/EditTaskForm"));
const NewTaskForm = React.lazy(() => import("./widgets/NewTaskForm"));

interface BoardPageProps {
	page: Omit<Page, "pageAccesses" | "owner" | "textLines" | "childrenPages" | "parentPage">;
}

const BoardPage: React.FC<BoardPageProps> = ({ page }) => {
	return (
		<>
			<NewTaskForm />

			<EditTaskForm />

			<TaskTable tasks={page.tasks} />
		</>
	);
};

export default BoardPage;
