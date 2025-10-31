import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	wrapper: css`
		position: absolute;
		top: 0;
		left: 0;
		right: 0;

		padding: calc(var(--ant-padding-xxs) / 2) var(--ant-padding-xxs);

		border-radius: var(--ant-border-radius) var(--ant-border-radius) 0 0;
		background-color: var(--ant-color-bg-spotlight);
		transform: translateY(-100%);
		font-size: var(--ant-font-size-xs);

		* {
			font-size: inherit;
		}
	`
}));
