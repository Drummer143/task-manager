import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	wrapper: css`
		padding: var(--ant-padding-xxs);

		border-bottom: var(--ant-line-width) var(--ant-line-type) var(--ant-color-split);
	`,
	pinTextWrapper: css`
		flex: 1;

		height: 100%;

		padding: 0 var(--ant-padding-xxs);

		align-items: flex-start;
		flex-direction: column;
		gap: 0;

		overflow: hidden;
	`,
	senderName: css`
		margin-bottom: 0 !important;

		font-weight: var(--ant-font-weight-strong);
		font-size: var(--ant-font-size-lg);
	`,
	pinText: css`
		max-width: 100%;

		margin-bottom: 0 !important;
	`
}));
