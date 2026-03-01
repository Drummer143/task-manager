import React from "react";

import { PageSummary } from "@task-manager/api/main/schemas";
import { Button, Flex, Typography } from "antd";

import AccessSettings from "./widgets/AccessSettings";
import BoardLayoutSettings from "./widgets/BoardLayoutSettings";

interface SettingsProps {
	page: PageSummary;
	onClose: () => void;
}

const Settings: React.FC<SettingsProps> = ({ page, onClose }) => {
	return (
		<>
			<Flex
				justify="space-between"
				style={{
					position: "sticky",
					top: 0,
					zIndex: 1,
					backgroundColor: "var(--ant-layout-body-bg)"
				}}
			>
				<Typography.Title level={3}>
					Settings for page &quot;{page.title}&quot;
				</Typography.Title>

				<Button onClick={onClose}>Close settings</Button>
			</Flex>

			<AccessSettings pageId={page.id} />

			{page.type === "board" && <BoardLayoutSettings page={page} />}
		</>
	);
};

export default Settings;

