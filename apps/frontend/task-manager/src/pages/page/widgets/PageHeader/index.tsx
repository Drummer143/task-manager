import React, { memo } from "react";

import { Page } from "@task-manager/api";
import { Flex, Typography } from "antd";

import Settings from "../Settings";

interface PageHeaderProps {
	page: Omit<Page, "tasks" | "owner" | "childPages" | "parentPage">;
}

const PageHeader: React.FC<PageHeaderProps> = ({ page }) => {
	return (
		<Flex justify="space-between" gap="var(--ant-margin-sm)">
			<Typography.Title editable={{ triggerType: ["text"] }} level={3}>
				{page.title}
			</Typography.Title>

			{(page.role === "admin" || page.role === "owner") && <Settings page={page} />}
		</Flex>
	);
};

export default memo(PageHeader);