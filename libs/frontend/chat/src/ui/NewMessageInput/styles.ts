import { createStyles } from "antd-style";

interface StyleProps {
	hasTopBar?: boolean;
}

export const useStyles = createStyles(({ css }, { hasTopBar }: StyleProps) => ({
	textareaWrapper: css`
		--font-size-xs: 11px;

		position: relative;
	`,
	sendButton: css`
		position: absolute;
		bottom: 2px;
		right: 2px;
	`,
	inputWrapper: css`
		background-color: var(--ant-color-bg-container);
		border: var(--ant-line-width) var(--ant-line-type) var(--ant-color-border);
		border-radius: var(--ant-border-radius);
		transition: border-color var(--ant-motion-duration-slow);

		&:hover {
			border-color: #3c89c8;
		}

		&.focused {
			border-color: #1668dc;
		}

		.ProseMirror {
			min-height: 40px;
			outline: none;
		}
	`,
	textarea: css`
		padding-right: 36px;

		transition: border-radius var(--ant-motion-duration-fast) var(--ant-motion-ease-out-circ)
			var(--ant-motion-duration-fast);

		${hasTopBar &&
		css`
			border-top-right-radius: 0;
			border-top-left-radius: 0;
		`}
	`
}));

