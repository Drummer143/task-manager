import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	header: css`
		padding: var(--ant-padding-sm) var(--ant-padding);

		border-bottom: var(--ant-line-width) solid var(--ant-color-border);
	`,
	title: css`
		margin: 0 !important;
	`
}));
