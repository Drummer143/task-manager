import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }, { isDropTarget }: { isDropTarget: boolean }) => ({
	divider: css`
		height: 100%;
		width: var(--ant-control-height-sm);

		background-color: var(--ant-color-${isDropTarget ? "primary" : "split"});

		transition: background-color var(--ant-motion-duration-slow) var(--ant-motion-ease-out);
	`
}));

