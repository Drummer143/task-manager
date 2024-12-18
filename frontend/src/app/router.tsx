import { createBrowserRouter, Navigate } from "react-router-dom";

import { lazySuspense } from "shared/HOCs/lazySuspense";
import FullSizeLoader from "shared/ui/FullSizeLoader";
import AuthLayout from "widgets/AuthLayout";
import Layout from "widgets/Layout";

const Profile = lazySuspense(() => import("pages/profile"), <FullSizeLoader />);
const Login = lazySuspense(() => import("pages/login"), <FullSizeLoader />);
const SignUp = lazySuspense(() => import("pages/signUp"), <FullSizeLoader />);
const ConfirmEmail = lazySuspense(() => import("pages/confirmEmail"), <FullSizeLoader />);
const ResetPassword = lazySuspense(() => import("pages/resetPassword"), <FullSizeLoader />);
const NewPassword = lazySuspense(() => import("pages/newPassword"), <FullSizeLoader />);
const Page = lazySuspense(() => import("pages/page"), <FullSizeLoader />);

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
				path: "/pages/:id",
				Component: Page
			},

			{
				path: "*",
				element: <Navigate to="/profile" />
			}
		]
	}
]);
