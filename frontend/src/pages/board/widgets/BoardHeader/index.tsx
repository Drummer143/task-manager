import React, { memo } from "react";

import { SettingOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";

import { useDisclosure } from "shared/hooks";

import Settings from "../Settings";

interface BoardHeaderProps {
	board?: Omit<Board, "boardAccesses" | "tasks" | "owner">;
}

const BoardHeader: React.FC<BoardHeaderProps> = ({ board }) => {
	const { onClose, onOpen, open } = useDisclosure();

	if (!board) return null;

	return (
		<Flex justify="space-between" gap="var(--ant-margin-sm)">
			<Typography.Title level={3}>{board.name}</Typography.Title>

			{(board.userRole === "admin" || board.userRole === "owner") && (
				<>
					<Button onClick={onOpen} icon={<SettingOutlined />}>
						Settings
					</Button>

					<Settings open={open} onClose={onClose} board={board} />
				</>
			)}
		</Flex>
	);
};

export default memo(BoardHeader);
