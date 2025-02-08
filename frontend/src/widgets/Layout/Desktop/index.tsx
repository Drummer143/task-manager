import React, { useState } from "react";

import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import { useAppStore } from "store/app";

import * as s from "./styles";
import UserMenu from "./UserMenu";

import NavContent from "../NavContent";

const DesktopLayout: React.FC = () => {
	const [collapsed, setCollapsed] = useState(false);

	const workspaceId = useAppStore(state => state.workspaceId);

	return (
		<Layout className="h-full">
			<s.Header>
				header
				<UserMenu />
			</s.Header>

			<Layout className="h-full">
				{workspaceId && (
					<Layout.Sider
						style={collapsed ? { position: "absolute" } : undefined}
						onCollapse={setCollapsed}
						width={256}
					>
						<NavContent />
					</Layout.Sider>
				)}

				<s.Content>
					<Outlet />
				</s.Content>
			</Layout>
		</Layout>
	);
};

export default DesktopLayout;
