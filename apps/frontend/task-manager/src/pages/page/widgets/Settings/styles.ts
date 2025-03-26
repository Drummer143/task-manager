import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	alert: css`
		margin-top: var(--ant-margin-xl);
	`,
	header: css`
		margin-bottom: var(--ant-margin-xs);
		padding-bottom: var(--ant-padding-xxs);

		border-bottom: 1px solid var(--ant-color-split);
	`,
	body: css`
		padding: var(--ant-padding-sm);

		background-color: var(--ant-color-bg-container);
		border-radius: var(--ant-border-radius);
	`,
	addMemberButtonContainer: css`
		display: flex;
		justify-content: flex-end;

		margin-top: var(--ant-margin-md);
	`
}));
