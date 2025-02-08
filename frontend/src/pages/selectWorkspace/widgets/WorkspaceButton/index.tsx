import React from "react";

import { Typography } from "antd";

import * as s from "./styled";

interface WorkspaceButtonProps {
	name: string;

	onClick: () => void;
}

const WorkspaceButton: React.FC<WorkspaceButtonProps> = ({ name, onClick }) => (
	<s.Button onClick={onClick}>
		<Typography.Title level={3}>{name}</Typography.Title>
	</s.Button>
);

export default WorkspaceButton;
