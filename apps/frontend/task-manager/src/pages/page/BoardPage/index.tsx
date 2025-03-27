import React from "react";

import { Page } from "@task-manager/api";
import { lazySuspense } from "@task-manager/utils";

import TaskTable from "./widgets/TaskTable";

const EditTaskForm = lazySuspense(() => import("./widgets/EditTaskForm"));
const NewTaskForm = lazySuspense(() => import("./widgets/NewTaskForm"));

interface BoardPageProps {
	page: Omit<Page, "owner" | "childPages" | "parentPage" | "workspace">;
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
