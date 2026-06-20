import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	container: css`
		background: var(--ant-color-bg-elevated);
		border-radius: var(--ant-border-radius-lg);
		padding: var(--ant-padding-xs);
		max-height: 320px;
		min-width: 200px;
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--ant-padding);
		box-shadow: var(--ant-box-shadow-secondary);
	`,

	group: css`
		display: flex;
		flex-direction: column;
		gap: var(--ant-padding-xxs);
	`,

	groupTitle: css`
		padding-left: var(--ant-padding-xxs);
		color: var(--ant-color-text-secondary);
		font-size: 0.65rem;
		font-weight: 600;
		text-transform: uppercase;
	`,

	groupItems: css`
		display: flex;
		flex-direction: column;
		gap: 2px;
	`,

	button: css`
		justify-content: flex-start;
	`,

	buttonSelected: css`
		background: var(--ant-color-fill-secondary) !important;
	`
}));
