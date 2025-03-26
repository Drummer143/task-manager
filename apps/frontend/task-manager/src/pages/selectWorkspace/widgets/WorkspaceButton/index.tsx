import React, { useCallback } from "react";

import { SettingOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";

import { useStyles } from "./styled";

interface WorkspaceButtonProps {
	name: string;

	onClick: () => void;
	onSettingsClick: () => void;
}

const WorkspaceButton: React.FC<WorkspaceButtonProps> = ({ name, onClick, onSettingsClick }) => {
	const { button } = useStyles().styles;

	const handleSettingsClick: React.MouseEventHandler<HTMLButtonElement> = useCallback(
		e => {
			e.stopPropagation();

			onSettingsClick();
		},
		[onSettingsClick]
	);

	return (
		<Button className={button} onClick={onClick}>
			<Flex className="w-full" justify="space-between" align="center">
				<Typography.Title level={3}>{name}</Typography.Title>

				<Button onClick={handleSettingsClick} icon={<SettingOutlined />} />
			</Flex>
		</Button>
	);
};

export default WorkspaceButton;
