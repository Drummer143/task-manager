import React, { useState } from "react";

import { Layout } from "antd";
import { Outlet } from "react-router-dom";

import * as s from "./styles";
import UserMenu from "./UserMenu";

import { useAuthStore } from "../../../app/store/auth";
import NavContent from "../NavContent";
import WorkspaceDeletionBanner from "../WorkspaceDeletionBanner";

const DesktopLayout: React.FC = () => {
	const [collapsed, setCollapsed] = useState(false);

	const { content, header } = s.useStyles().styles;

	const workspaceId = useAuthStore(state => state.user.workspace.id);

	return (
		<Layout className="h-full">
			<Layout.Header className={header}>
				header
				<UserMenu />
			</Layout.Header>

			<WorkspaceDeletionBanner />

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

				<Layout.Content className={content}>
					<Outlet />
				</Layout.Content>
			</Layout>
		</Layout>
	);
};

export default DesktopLayout;