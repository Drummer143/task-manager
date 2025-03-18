import { lazySuspense } from "@task-manager/utils";
import { createBrowserRouter, Navigate } from "react-router-dom";

import FullSizeLoader from "../shared/ui/FullSizeLoader";
import AuthLayout from "../widgets/AuthLayout";
import Layout from "../widgets/Layout";

const Profile = lazySuspense(() => import("../pages/profile"), <FullSizeLoader />);
const Login = lazySuspense(() => import("../pages/login"), <FullSizeLoader />);
const SignUp = lazySuspense(() => import("../pages/signUp"), <FullSizeLoader />);
const ConfirmEmail = lazySuspense(() => import("../pages/confirmEmail"), <FullSizeLoader />);
const ResetPassword = lazySuspense(() => import("../pages/resetPassword"), <FullSizeLoader />);
const NewPassword = lazySuspense(() => import("../pages/newPassword"), <FullSizeLoader />);
const Page = lazySuspense(() => import("../pages/page"), <FullSizeLoader />);
const SelectWorkspace = lazySuspense(() => import("../pages/selectWorkspace"), <FullSizeLoader />);

export default createBrowserRouter([
	{
		path: "",
		element: <Navigate to="/profile" replace />
	},

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
			},

			{
				path: "*",
				element: <Navigate to="/login" replace />
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
				path: "/pages/:id",
				Component: Page
			},
			{
				path: "/select-workspace",
				Component: SelectWorkspace
			},

			{
				path: "*",
				element: <Navigate to="/profile" replace />
			}
		]
	}
]);
