import React from "react";

import { lazySuspense } from "shared/HOCs/lazySuspense";

import TaskTable from "./widgets/TaskTable";

const EditTaskForm = lazySuspense(() => import("./widgets/EditTaskForm"));
const NewTaskForm = lazySuspense(() => import("./widgets/NewTaskForm"));

interface BoardPageProps {
	page: Omit<Page, "owner" | "childPages" | "parentPage">;
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
