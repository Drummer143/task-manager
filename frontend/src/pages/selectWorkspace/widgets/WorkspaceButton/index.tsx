import React, { useCallback } from "react";

import { SettingOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";

import * as s from "./styled";

interface WorkspaceButtonProps {
	name: string;

	onClick: () => void;
	onSettingsClick: () => void;
}

const WorkspaceButton: React.FC<WorkspaceButtonProps> = ({ name, onClick, onSettingsClick }) => {
	const handleSettingsClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
		e => {
			e.stopPropagation();

			onSettingsClick();
		},
		[onSettingsClick]
	);

	return (
		<s.Button onClick={onClick}>
			<Flex className="w-full" justify="space-between" align="center">
				<Typography.Title level={3}>{name}</Typography.Title>

				<Button onClick={handleSettingsClick} icon={<SettingOutlined />} />
			</Flex>
		</s.Button>
	);
};

export default WorkspaceButton;
