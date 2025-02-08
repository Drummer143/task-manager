import React from "react";

import { PlusCircleOutlined } from "@ant-design/icons";
import { Button as AntButton, Typography } from "antd";
import styled from "styled-components";

const Button = styled(AntButton).attrs({
	block: false,
	type: "dashed"
})`
	width: 30vw;
	min-width: 200px;
	height: fit-content;

	padding: var(--ant-padding) !important;
`;

interface CreateWorkspaceModalProps {
	onClick: React.MouseEventHandler<HTMLElement>;
}

const CreateWorkspaceButton: React.FC<CreateWorkspaceModalProps> = ({ onClick }) => (
	<Button icon={<PlusCircleOutlined />} onClick={onClick}>
		<Typography.Text>Create new workspace</Typography.Text>
	</Button>
);

export default CreateWorkspaceButton;
