import React, { memo } from "react";

import { SettingOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";

import { useDisclosure } from "shared/hooks";

import Settings from "../Settings";

interface PageHeaderProps {
	page?: Omit<Page, "pageAccesses" | "tasks" | "owner" | "textLines" | "childrenPages" | "parentPage">;
}

const PageHeader: React.FC<PageHeaderProps> = ({ page }) => {
	const { onClose, onOpen, open } = useDisclosure();

	if (!page) return null;

	return (
		<Flex justify="space-between" gap="var(--ant-margin-sm)">
			<Typography.Title level={3}>{page.name}</Typography.Title>

			{(page.userRole === "admin" || page.userRole === "owner") && (
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
