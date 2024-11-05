import { createBrowserRouter } from "react-router-dom";

import { lazySuspense } from "shared/HOCs/lazySuspense";
import AuthLayout from "widgets/AuthLayout";
import Layout from "widgets/Layout";

const Tasks = lazySuspense(() => import("pages/tasks"));
const Profile = lazySuspense(() => import("pages/profile"));
const Login = lazySuspense(() => import("pages/login"));
const SignUp = lazySuspense(() => import("pages/signUp"));
const ConfirmEmail = lazySuspense(() => import("pages/confirmEmail"));
const ResetPassword = lazySuspense(() => import("pages/resetPassword"));
const NewPassword = lazySuspense(() => import("pages/newPassword"));

export default createBrowserRouter([
	{
		path: "/",
		Component: AuthLayout,
		children: [
			{
				path: "/login",
				Component: Login
			},
			{
				path: "/sign-up",
				Component: SignUp
			},
			{
				path: "/confirm-email",
				Component: ConfirmEmail
			},
			{
				path: "/reset-password",
				Component: ResetPassword
			},
			{
				path: "/new-password",
				Component: NewPassword
			}
		]
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
				path: "/tasks",
				Component: Tasks
			}
		]
	}
]);
