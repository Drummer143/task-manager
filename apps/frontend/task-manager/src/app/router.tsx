import { lazySuspense } from "@task-manager/react-utils";
import { createBrowserRouter, Navigate } from "react-router-dom";

import Callback from "../pages/callback";
import FullSizeLoader from "../shared/ui/FullSizeLoader";
import Layout from "../widgets/Layout";

const Profile = lazySuspense(() => import("../pages/profile"), <FullSizeLoader />);
const Page = lazySuspense(() => import("../pages/page"), <FullSizeLoader />);
const CurrentWorkspace = lazySuspense(() => import("../pages/currentWorkspace"), <FullSizeLoader />);

export default createBrowserRouter([
	{
		path: "",
		element: <Navigate to="/profile" replace />
	},
	{
		path: "/callback",
		Component: Callback
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
				path: "*",
				element: <Navigate to="/profile" replace />
			}
		]
	}
]);