import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	bar: css`
		padding: var(--ant-padding) var(--ant-padding);

		border-top: var(--ant-line-width) solid var(--ant-color-border);
	`
}));
