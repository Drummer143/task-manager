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

