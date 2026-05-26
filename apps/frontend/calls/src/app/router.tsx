import React from "react";

import { createBrowserRouter, Navigate } from "react-router";

const Room = React.lazy(() => import("../pages/Room"));
const PreJoin = React.lazy(() => import("../pages/PreJoin"));

export const router = createBrowserRouter([
	{
		path: "/room/:id",
		Component: Room
	},
	{
		path: "/pre-join",
		Component: PreJoin
	},
	{
		path: "*",
		element: <Navigate to="/pre-join" replace />
	}
]);

