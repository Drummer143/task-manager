import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	itemWrapper: css`
		display: flex;
		width: fit-content;
		justify-content: space-between;
		align-items: center;
		gap: var(--ant-padding-lg);

		margin-bottom: var(--ant-margin-sm);
	`,
	roleSelect: css`
		min-width: 7.5rem;
	`
}));
