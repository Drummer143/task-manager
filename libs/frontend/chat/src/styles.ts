import { createStyles } from "antd-style";

// interface StyleProps {

// }

export const useStyles = createStyles(({ css }) => ({
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
    `
}));

