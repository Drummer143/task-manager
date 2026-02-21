import React, { memo } from "react";

import { SettingOutlined } from "@ant-design/icons";
import { UserRole } from "@task-manager/api";
import { Button, Flex, Typography } from "antd";

interface PageHeaderProps {
	pageTitle: string;
	userRoleInPage: UserRole;

	onSettingsClick: () => void;
}

const PageHeader: React.FC<PageHeaderProps> = ({ userRoleInPage, pageTitle, onSettingsClick }) => {
	return (
		<Flex justify="space-between" gap="var(--ant-margin-sm)">
			<Typography.Title editable={{ triggerType: ["text"] }} level={3}>
				{pageTitle}
			</Typography.Title>

			{(userRoleInPage === "admin" || userRoleInPage === "owner") && (
				<Button icon={<SettingOutlined />} onClick={onSettingsClick}>
					Open settings
				</Button>
			)}
		</Flex>
	);
};

export default memo(PageHeader);

