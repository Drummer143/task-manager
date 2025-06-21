import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	controls: css`
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 2;

		padding: 0 var(--ant-padding-xs);
	`,
	playStateIcon: css`
		font-size: var(--ant-font-size-heading-1);
		color: var(--ant-color-text-base);
		filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.4));
	`
}));

