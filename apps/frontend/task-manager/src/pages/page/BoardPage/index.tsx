import React from "react";

import { Page } from "@task-manager/api";
import { lazySuspense } from "@task-manager/react-utils";

import TaskTable from "./widgets/TaskTable";

const EditTaskForm = lazySuspense(() => import("./widgets/EditTaskForm"));
const NewTaskForm = lazySuspense(() => import("./widgets/NewTaskForm"));

interface BoardPageProps {
	page: Omit<Page, "owner" | "childPages" | "parentPage" | "workspace" | "tasks">;
}

const BoardPage: React.FC<BoardPageProps> = ({ page }) => (
	<>
		<NewTaskForm />

		<EditTaskForm />

		<TaskTable pageId={page.id} />
	</>
);

export default BoardPage;
