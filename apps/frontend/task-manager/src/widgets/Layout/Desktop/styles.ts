import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	header: css`
		display: flex;
		justify-content: space-between;
		align-items: center;

		padding: 0 var(--ant-padding);

		border-bottom: var(--ant-line-width) solid var(--ant-color-split);
	`,
	content: css`
		max-height: 100%;

		border-left: var(--ant-line-width) solid var(--ant-color-split);

		overflow: hidden;
	`
}));
