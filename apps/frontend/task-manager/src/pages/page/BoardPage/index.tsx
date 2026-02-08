import React from "react";

import { Page } from "@task-manager/api";
import { lazySuspense } from "@task-manager/react-utils";

import TaskTable from "./widgets/TaskTable";

const TaskDrawer = lazySuspense(() => import("./widgets/TaskDrawer"));

interface BoardPageProps {
	page: Omit<Page, "owner" | "childPages" | "parentPage" | "workspace" | "tasks">;
}

const BoardPage: React.FC<BoardPageProps> = ({ page }) => (
	<>
		<TaskDrawer />

		<TaskTable pageId={page.id} statuses={page.boardStatuses} />
	</>
);

export default BoardPage;

