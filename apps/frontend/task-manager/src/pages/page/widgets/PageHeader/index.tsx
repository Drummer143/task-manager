import React, { memo } from "react";

import { SettingOutlined } from "@ant-design/icons";
import { useDisclosure } from "@task-manager/utils";
import { Button, Flex, Typography } from "antd";

import Settings from "../Settings";

interface PageHeaderProps {
	page?: Omit<Page, "tasks" | "owner" | "childPages" | "parentPage">;
}

const PageHeader: React.FC<PageHeaderProps> = ({ page }) => {
	const { onClose, onOpen, open } = useDisclosure();

	if (!page) return null;

	return (
		<Flex justify="space-between" gap="var(--ant-margin-sm)">
			<Typography.Title editable={{ triggerType: ["text"] }} level={3}>
				{page.title}
			</Typography.Title>

			{(page.role === "admin" || page.role === "owner") && (
				<>
					<Button onClick={onOpen} icon={<SettingOutlined />}>
						Settings
					</Button>

					<Settings open={open} onClose={onClose} page={page} />
				</>
			)}
		</Flex>
	);
};

export default memo(PageHeader);
