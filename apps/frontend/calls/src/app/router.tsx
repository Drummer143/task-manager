import React from "react";

import { createBrowserRouter, Navigate } from "react-router";

import Layout from "../widgets/Layout";

const Room = React.lazy(() => import("../pages/Room"));
const Lobby = React.lazy(() => import("../pages/Lobby"));

export const router = createBrowserRouter([
	{
		path: "/",
		Component: Layout,
		children: [
			{
				index: true,
				Component: Lobby
			},
			{
				path: "room/:id",
				Component: Room
			},
			{
				path: "*",
				element: <Navigate to="/" replace />
			}
		]
	}
]);
