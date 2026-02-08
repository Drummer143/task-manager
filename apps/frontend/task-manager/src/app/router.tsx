import { lazySuspense } from "@task-manager/react-utils";
import { createBrowserRouter, Navigate } from "react-router";

import FullSizeLoader from "../shared/ui/FullSizeLoader";
import Layout from "../widgets/Layout";

const Profile = lazySuspense(() => import("../pages/profile"), <FullSizeLoader />);
const Page = lazySuspense(() => import("../pages/page"), <FullSizeLoader />);
const Task = lazySuspense(() => import("../pages/task"), <FullSizeLoader />);
const CurrentWorkspace = lazySuspense(
	() => import("../pages/currentWorkspace"),
	<FullSizeLoader />
);

export default createBrowserRouter([
	{
		path: "",
		element: <Navigate to="/profile" replace />
	},

	{
		path: "/",
		Component: Layout,
		children: [
			{
				path: "/profile",
				Component: Profile
			},
			{
				path: "/pages/:id",
				Component: Page
			},
			{
				path: "workspace",
				Component: CurrentWorkspace
			},
			{
				path: "tasks/:taskId",
				Component: Task
			},
			{
				path: "*",
				element: <Navigate to="/profile" replace />
			}
		]
	}
]);

