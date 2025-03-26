import React from "react";

import { MenuOutlined } from "@ant-design/icons";
import { useDisclosure } from "@task-manager/utils";
import { Button, Divider, Layout } from "antd";
import { createStyles } from "antd-style";
import { Outlet } from "react-router-dom";

import UserMenu from "./UserMenu";

import MobileDrawer from "../../../widgets/MobileDrawer";

const useStyles = createStyles(({ css }) => ({
	mobileDrawer: css`
		.ant-drawer-body {
			padding: var(--ant-padding-lg);

			display: flex;
			flex-direction: column;
			justify-content: space-between;
		}
	`
}));

const MobileLayout: React.FC = () => {
	const { open, onOpen, onClose } = useDisclosure();

	const { mobileDrawer } = useStyles().styles;

	return (
		<Layout className="h-full">
			<MobileDrawer className={mobileDrawer} open={open} onClose={onClose}>
				nav
				<UserMenu />
			</MobileDrawer>

			<Layout className="h-full">
				<Layout.Header style={{ paddingLeft: "var(--ant-padding-md)" }}>
					<Button icon={<MenuOutlined />} onClick={onOpen} />
					header
				</Layout.Header>

				<Divider style={{ margin: 0 }} />

				<Layout.Content>
					<Outlet />
				</Layout.Content>
			</Layout>
		</Layout>
	);
};

export default MobileLayout;
