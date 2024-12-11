import React from "react";

import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import * as s from "./styles";
import UserMenu from "./UserMenu";

import NavContent from "../NavContent";

const DesktopLayout: React.FC = () => {
	return (
		<Layout className="h-full">
			<s.Header>
				header
				<UserMenu />
			</s.Header>

			<Layout className="h-full">
				<Layout.Sider collapsible breakpoint="xl">
					<NavContent />
				</Layout.Sider>

				<s.Content>
					<Outlet />
				</s.Content>
			</Layout>
		</Layout>
	);
};

export default DesktopLayout;
