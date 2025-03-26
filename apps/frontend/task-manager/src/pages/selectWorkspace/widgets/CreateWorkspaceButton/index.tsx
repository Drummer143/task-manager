import React from "react";

import { PlusCircleOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import { createStyles } from "antd-style";

const useStyles = createStyles(({ css }) => ({
	button: css`
		width: 30vw;
		min-width: 200px;
		height: fit-content;

		padding: var(--ant-padding) !important;
	`
}));

interface CreateWorkspaceModalProps {
	onClick: React.MouseEventHandler<HTMLElement>;
}

const CreateWorkspaceButton: React.FC<CreateWorkspaceModalProps> = ({ onClick }) => {
	const { button } = useStyles().styles;

	return (
		<Button block={false} className={button} type="dashed" icon={<PlusCircleOutlined />} onClick={onClick}>
			<Typography.Text>Create new workspace</Typography.Text>
		</Button>
	);
};

export default CreateWorkspaceButton;
