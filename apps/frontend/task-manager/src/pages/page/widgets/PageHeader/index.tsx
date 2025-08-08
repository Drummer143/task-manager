import React, { memo } from "react";

import { SettingOutlined } from "@ant-design/icons";
import { Page } from "@task-manager/api";
import { Button, Flex, Typography } from "antd";

interface PageHeaderProps {
	page: Omit<Page, "tasks" | "owner" | "childPages" | "parentPage">;

	onSettingsClick: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ page, onSettingsClick }) => {
	return (
		<Flex justify="space-between" gap="var(--ant-margin-sm)">
			<Typography.Title editable={{ triggerType: ["text"] }} level={3}>
				{page.title}
			</Typography.Title>

			{(page.role === "admin" || page.role === "owner") && (
				<Button icon={<SettingOutlined />} onClick={onSettingsClick}>
					Open settings
				</Button>
			)}
		</Flex>
	);
};

export default memo(PageHeader);

