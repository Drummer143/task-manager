import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }, { selected }: { selected: boolean }) => ({
	itemWrapper: css`
		transition: background var(--ant-motion-duration-slow) ease;

		padding: var(--ant-padding-xxs) var(--ant-padding-xs);
		border-radius: var(--ant-border-radius);
		cursor: pointer;

		${selected
			? css`
					background-color: var(--ant-select-option-selected-bg);
				`
			: css`
					&:hover {
						background-color: var(--ant-select-option-active-bg);
					}
				`}
	`,
	popoverOverlay: css`
		.ant-popover-inner {
			min-width: 15rem;

			padding: var(--ant-padding-xxs) !important;
		}
	`
}));
