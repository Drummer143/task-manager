import React from "react";

import { Layout } from "antd";
import { Outlet } from "react-router";

const AuthLayout: React.FC = () => (
	<Layout className="h-full">
		<Outlet />
	</Layout>
);

export default AuthLayout;