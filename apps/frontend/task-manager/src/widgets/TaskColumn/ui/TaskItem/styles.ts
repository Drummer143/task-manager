import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }, { isDragging }: { isDragging: boolean }) => ({
	taskWrapper: css`
		position: relative;

		padding: var(--ant-padding-xs);

		cursor: pointer;
		border-radius: var(--inner-border-radius);
		background-color: var(--ant-color-bg-layer-4);
		border: 1px solid var(--ant-color-border-secondary);
		${isDragging && "opacity: 0.4;"}
		transition:
			opacity var(--ant-motion-duration-fast) var(--ant-motion-ease-in-out),
			background-color var(--ant-motion-duration-fast) var(--ant-motion-ease-in-out);

		& > *:not(:last-child) {
			margin-bottom: var(--ant-margin-xs);
		}

		&:hover {
			background-color: var(--ant-color-bg-layer-4-hover);
			box-shadow: var(--ant-box-shadow-secondary);
		}

		&:active {
			background-color: var(--ant-color-bg-layer-4-active);
		}
	`,
	taskTitle: css`
		display: inline-block;

		&:last-child {
			margin-bottom: 0;
		}
	`,
	userAvatar: css`
		flex-shrink: 0;
	`
}));

