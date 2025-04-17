import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	loadingMoreWrapper: css`
		width: 100%;

		display: flex;
		justify-content: center;
		align-items: center;

		padding: var(--ant-padding-xs);
	`
}));