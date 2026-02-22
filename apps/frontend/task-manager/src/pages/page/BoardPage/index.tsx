import React from "react";

import { DetailedPageResponseBoard } from "@task-manager/api";
import { lazySuspense } from "@task-manager/react-utils";

import TaskTable from "./widgets/TaskTable";

const TaskDrawer = lazySuspense(() => import("./widgets/TaskDrawer"));

interface BoardPageProps {
	page: DetailedPageResponseBoard;
}

const BoardPage: React.FC<BoardPageProps> = ({ page }) => (
	<>
		<TaskDrawer />

		<TaskTable page={page} />
	</>
);

export default BoardPage;

