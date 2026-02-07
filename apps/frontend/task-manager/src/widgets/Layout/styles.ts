import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	outerLayout: css`
		height: 100%;

		padding: var(--ant-padding-xs);

		gap: var(--ant-padding-xs);
	`,
	innerLayout: css`
		height: 100%;

		gap: var(--ant-padding-xs);
	`,
	header: css`
		display: flex;
		justify-content: space-between;
		align-items: center;

		padding: 0 var(--ant-padding);

		border-radius: var(--ant-border-radius);
		overflow: hidden;
		border: var(--ant-line-width) solid var(--ant-color-bg-elevated);
	`,
	sider: css`
		border-radius: var(--ant-border-radius);
		overflow: hidden;
		border: var(--ant-line-width) solid var(--ant-color-bg-elevated);
	`,
	content: css`
		max-height: 100%;

		background-color: var(--ant-layout-header-bg);
		border-radius: var(--ant-border-radius);
		overflow: hidden;
		border: var(--ant-line-width) solid var(--ant-color-bg-elevated);
	`
}));
