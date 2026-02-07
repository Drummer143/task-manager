import React from "react";

import { Page } from "@task-manager/api";
import { lazySuspense } from "@task-manager/react-utils";

import TaskTable from "./widgets/TaskTable";

const TaskForm = lazySuspense(() => import("./widgets/TaskForm"));

interface BoardPageProps {
	page: Omit<Page, "owner" | "childPages" | "parentPage" | "workspace" | "tasks">;
}

const BoardPage: React.FC<BoardPageProps> = ({ page }) => (
	<>
		<TaskForm />

		<TaskTable pageId={page.id} statuses={page.boardStatuses} />
	</>
);

export default BoardPage;

