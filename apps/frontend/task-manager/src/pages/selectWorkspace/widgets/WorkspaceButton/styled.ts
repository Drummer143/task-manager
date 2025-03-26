import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	button: css`
		width: 30vw;
		min-width: 200px;
		height: fit-content;

		padding: var(--ant-padding);
		padding-left: var(--ant-padding-xl);
	`
}));
