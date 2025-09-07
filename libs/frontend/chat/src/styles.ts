import { createStyles } from "antd-style";

export const useStyles = createStyles(({ css }) => ({
	wrapper: css`
		width: 100%;
		height: 100%;

		display: flex;
		flex-direction: column;

		overflow: hidden;
	`,
    messageList: css`
        flex: 1;
    `,
}));

