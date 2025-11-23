import { lazySuspense } from "@task-manager/react-utils";
import { createBrowserRouter, Navigate } from "react-router";

import FullSizeLoader from "../shared/ui/FullSizeLoader";
import Layout from "../widgets/Layout";

const Profile = lazySuspense(() => import("../pages/profile"), <FullSizeLoader />);
const Page = lazySuspense(() => import("../pages/page"), <FullSizeLoader />);
const CurrentWorkspace = lazySuspense(() => import("../pages/currentWorkspace"), <FullSizeLoader />);
// const Login = lazySuspense(() => import("../pages/login"), <FullSizeLoader />);
// const SignUp = lazySuspense(() => import("../pages/signUp"), <FullSizeLoader />);
// const ResetPassword = lazySuspense(() => import("../pages/resetPassword"), <FullSizeLoader />);
// const ConfirmEmail = lazySuspense(() => import("../pages/confirmEmail"), <FullSizeLoader />);
// const NewPassword = lazySuspense(() => import("../pages/newPassword"), <FullSizeLoader />);
// const AuthLayout = lazySuspense(() => import("../widgets/AuthLayout"), <FullSizeLoader />);

export default createBrowserRouter([
	{
		path: "",
		element: <Navigate to="/profile" replace />
	},

	// {
	// 	path: "/",
	// 	Component: AuthLayout,
	// 	children: [
	// 		{
	// 			path: "/login",
	// 			Component: Login
	// 		},
	// 		{
	// 			path: "/sign-up",
	// 			Component: SignUp
	// 		},
	// 		{
	// 			path: "/reset-password",
	// 			Component: ResetPassword
	// 		},
	// 		{
	// 			path: "/confirm-email",
	// 			Component: ConfirmEmail
	// 		},
	// 		{
	// 			path: "/new-password",
	// 			Component: NewPassword
	// 		}
	// 	]
	// },

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