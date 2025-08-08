import React from "react";

import { Page } from "@task-manager/api";
import { Button, Flex, Typography } from "antd";

import AccessSettings from "./widgets/AccessSettings";
import BoardLayoutSettings from "./widgets/BoardLayoutSettings";

interface SettingsProps {
	page: Omit<Page, "tasks" | "owner" | "childPages" | "parentPage" | "workspace">;
	onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ page, onClose }) => {
	return (
		<>
			<Flex justify="space-between" style={{ position: "sticky", top: 0, zIndex: 1, backgroundColor: "var(--ant-layout-body-bg)" }}>
				<Typography.Title level={3}>
					Settings for page &quot;{page.title}&quot;
				</Typography.Title>

				<Button onClick={onClose}>Close settings</Button>
			</Flex>

			<AccessSettings page={page} />

			{page.type === "board" && <BoardLayoutSettings page={page} />}
		</>
	);
};

export default Settings;

