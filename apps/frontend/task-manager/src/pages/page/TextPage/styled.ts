import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	controlsWrapper: css`
		display: flex;
		justify-content: center;
		align-items: center;
		gap: var(--ant-margin);

		padding-top: var(--ant-padding-xs);
	`
}));