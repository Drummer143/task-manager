import { createBrowserRouter } from "react-router-dom";

import { lazySuspense } from "shared/HOCs/lazySuspense";

const Tasks = lazySuspense(() => import("pages/tasks"))
const Profile = lazySuspense(() => import("pages/profile"))
const Login = lazySuspense(() => import("pages/login"))
const SignUp = lazySuspense(() => import("pages/signUp"))

export default createBrowserRouter([
	{
		path: "/login",
		Component: Login
	},
	{
		path: "/sign-up",
		Component: SignUp
	},
	{
		path: "/profile",
		Component: Profile
	},
	{
		path: "/tasks",
		Component: Tasks
	}
])
