import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	itemWrapper: css`
		display: flex;
		justify-content: space-between;
		align-items: center;

		margin-bottom: var(--ant-margin-sm);
	`,
	roleSelect: css`
		min-width: 7.5rem;
	`
}));
