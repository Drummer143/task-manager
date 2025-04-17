import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	menuWrapper: css`
		display: flex;
		flex-direction: column;

		color: var(--ant-color-text-secondary);
		background: var(--ant-menu-item-bg);

		&.submenu {
			transition: height var(--ant-motion-duration-slow);
			background-color: var(--ant-menu-sub-menu-item-bg);
			overflow: hidden;
		}
	`,
	menuListItem: css`
		min-height: var(--ant-menu-item-height);

		display: flex;
		justify-content: space-between;
		align-items: center;

		margin: var(--ant-menu-item-margin-block);

		padding-right: var(--ant-padding-xs);

		color: var(--ant-menu-item-color);
		transition:
			background-color var(--ant-motion-duration-slow),
			color var(--ant-motion-duration-slow);
		border-radius: var(--ant-menu-item-border-radius);

		&:hover {
			color: var(--ant-menu-item-color);
			background-color: var(--ant-menu-item-hover-bg);
		}

		&.active {
			color: var(--ant-menu-item-selected-color);
			background-color: var(--ant-menu-item-selected-bg);
		}

		.menu > & {
			padding-left: 24px;
		}

		.submenu > & {
			padding-left: 40px;
		}
	`
}));