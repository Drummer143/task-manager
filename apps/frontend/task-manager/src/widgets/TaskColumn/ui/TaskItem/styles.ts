import { createStyles } from "antd-style";

export const useStyles = createStyles(
	({ css }, { isDragging }: { isDragging: boolean }) => ({
		taskWrapper: css`
			padding: var(--ant-padding-xs);

			cursor: pointer;
			border-radius: var(--inner-border-radius);
			background-color: var(--ant-task-bg);
			border: 1px solid var(--ant-color-border-tertiary);
			${isDragging && "opacity: 0.4;"}
			transition: opacity var(--ant-motion-duration-fast) var(--ant-motion-ease-in-out);

			& > *:not(:last-child) {
				margin-bottom: var(--ant-margin-xs);
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
	})
);

