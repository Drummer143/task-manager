import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	container: css`
		padding: var(--ant-padding-xs) var(--ant-padding-xxs);
		overflow-x: auto;
	`
}));