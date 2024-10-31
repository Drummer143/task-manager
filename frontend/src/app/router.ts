import { createBrowserRouter, redirect } from "react-router-dom";

import { lazySuspense } from "shared/HOCs/lazySuspense";

const Tasks = lazySuspense(() => import("pages/tasks"))
const Profile = lazySuspense(() => import("pages/profile"))

export default createBrowserRouter([
	{
		path: "/profile",
		Component: Profile
	},
	{
		path: "/tasks",
		Component: Tasks
    },
    {
        path: "/login",
        loader: () => redirect("http://localhost:8080/auth/login"),
	}
])
