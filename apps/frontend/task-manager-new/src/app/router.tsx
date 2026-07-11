import { lazySuspense } from "@task-manager/react-utils";
import { createBrowserRouter, Navigate } from "react-router";

import FullSizeLoader from "../shared/ui/FullSizeLoader";
import UnderDevelopment from "../widgets/UnderDevelopment";

const BaseLayout = lazySuspense(() => import("../widgets/BaseLayout"), <FullSizeLoader />);

export default createBrowserRouter([
	{
		path: "",
		element: <Navigate to="/profile" replace />
	},

	{
		path: "/",
		Component: BaseLayout,
		children: [
			{
				path: "/docs/:id?",
				Component: UnderDevelopment
			},
			{
				path: "/tasks/:id?",
				Component: UnderDevelopment
			},
			{
				path: "/chat/:id?",
				Component: UnderDevelopment
			}
		]
	}
]);

