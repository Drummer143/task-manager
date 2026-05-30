import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	gridContainer: css`
		flex: 1;

		min-height: 0;

		padding: var(--ant-padding);

		overflow: hidden;
	`,
	focusLayout: css`
		flex: 1;

		min-height: 0;

		padding: var(--ant-padding);

		overflow: hidden;
	`
}));
